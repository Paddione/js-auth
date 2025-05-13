// controllers/authController.js
const passport = require('passport');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); // For generating password reset tokens (alternative to uuid in model)
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const { sendPasswordResetEmail } = require('../services/emailService');
const { validationResult } = require('express-validator');

// GET Register Page
exports.getRegister = (req, res) => {
    const validationErrors = req.flash('validation_errors') || [];
    const oldInput = req.flash('old_input')[0] || {};
    res.render('auth/register', {
        title: 'Register',
        errors: validationErrors,
        oldInput: oldInput
    });
};

// POST Register
exports.postRegister = async (req, res, next) => {
    const { username, email, password, confirmPassword } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash('validation_errors', errors.array());
        req.flash('old_input', { username, email }); // Don't flash back password
        return res.status(422).render('auth/register', {
            title: 'Register',
            errors: errors.array(),
            oldInput: { username, email }
        });
    }

    try {
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            req.flash('error_msg', 'Email already exists');
            req.flash('old_input', { username, email });
            return res.render('auth/register', {
                title: 'Register',
                errors: [{msg: 'Email already exists'}],
                oldInput: { username, email }
            });
        }
        let userNameCheck = await User.findOne({ username: username });
        if (userNameCheck) {
            req.flash('error_msg', 'Username already taken');
            req.flash('old_input', { username, email });
            return res.render('auth/register', {
                title: 'Register',
                errors: [{msg: 'Username already taken'}],
                oldInput: { username, email }
            });
        }

        const newUser = new User({
            username,
            email: email.toLowerCase(),
            password // Password will be hashed by the pre-save hook in User model
        });

        await newUser.save();
        // Optional: Send verification email here if implemented
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/auth/login');

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong. Please try again.');
        res.redirect('/auth/register');
        // or next(err) to pass to global error handler
    }
};

// GET Login Page
exports.getLogin = (req, res) => {
    const validationErrors = req.flash('validation_errors') || [];
    const oldInput = req.flash('old_input')[0] || {};
    res.render('auth/login', {
        title: 'Login',
        errors: validationErrors, // For express-validator errors if any
        oldInput: oldInput
    });
};

// POST Login
exports.postLogin = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('validation_errors', errors.array());
        req.flash('old_input', { email: req.body.email });
        return res.status(422).render('auth/login', {
            title: 'Login',
            errors: errors.array(),
            oldInput: { email: req.body.email }
        });
    }

    passport.authenticate('local', {
        successRedirect: '/user/dashboard',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
};

// GET Logout
exports.getLogout = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/auth/login');
    });
};

// GET Forgot Password Page
exports.getForgotPassword = (req, res) => {
    const validationErrors = req.flash('validation_errors') || [];
    const oldInput = req.flash('old_input')[0] || {};
    res.render('auth/forgot-password', {
        title: 'Forgot Password',
        errors: validationErrors,
        oldInput: oldInput
    });
};

// POST Forgot Password
exports.postForgotPassword = async (req, res, next) => {
    const { email } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash('validation_errors', errors.array());
        req.flash('old_input', { email });
        return res.status(422).render('auth/forgot-password', {
            title: 'Forgot Password',
            errors: errors.array(),
            oldInput: { email }
        });
    }

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            req.flash('error_msg', 'No user found with that email address.');
            return res.redirect('/auth/forgot-password');
        }

        // Delete any existing tokens for this user
        await PasswordResetToken.deleteMany({ userId: user._id });

        const resetToken = new PasswordResetToken({ userId: user._id });
        await resetToken.save();

        const resetLink = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken.token}`;

        const emailSent = await sendPasswordResetEmail(user.email, resetLink);

        if (emailSent) {
            req.flash('success_msg', 'Password reset link sent to your email. Please check your inbox (and spam folder).');
        } else {
            req.flash('error_msg', 'Could not send password reset email. Please try again later.');
        }
        res.redirect('/auth/forgot-password');

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong. Please try again.');
        res.redirect('/auth/forgot-password');
        // or next(err)
    }
};

// GET Reset Password Page
exports.getResetPassword = async (req, res) => {
    const { token } = req.params;
    const validationErrors = req.flash('validation_errors') || [];

    try {
        const resetToken = await PasswordResetToken.findOne({ token: token });

        if (!resetToken || resetToken.expiresAt < Date.now()) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/auth/forgot-password');
        }

        res.render('auth/reset-password', {
            title: 'Reset Password',
            token: token,
            errors: validationErrors,
            oldInput: {} // No old input to pass here for password fields
        });
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong.');
        res.redirect('/auth/forgot-password');
    }
};

// POST Reset Password
exports.postResetPassword = async (req, res, next) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash('validation_errors', errors.array());
        return res.status(422).render('auth/reset-password', {
            title: 'Reset Password',
            token: token,
            errors: errors.array(),
            oldInput: {}
        });
    }

    try {
        const resetToken = await PasswordResetToken.findOne({ token: token });

        if (!resetToken || resetToken.expiresAt < Date.now()) {
            req.flash('error_msg', 'Password reset token is invalid or has expired.');
            return res.redirect('/auth/forgot-password');
        }

        const user = await User.findById(resetToken.userId);
        if (!user) {
            req.flash('error_msg', 'User not found.');
            return res.redirect('/auth/forgot-password');
        }

        user.password = password; // Hashing will be done by pre-save hook
        await user.save();
        await PasswordResetToken.deleteOne({ _id: resetToken._id }); // Delete the token

        req.flash('success_msg', 'Password has been reset successfully. You can now log in.');
        res.redirect('/auth/login');

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Something went wrong. Please try again.');
        res.redirect(`/auth/reset-password/${token}`);
        // or next(err)
    }
};