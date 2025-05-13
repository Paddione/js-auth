// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const csrf = require('csurf');

const User = require('./models/User'); // For first admin creation
const bcrypt = require('bcryptjs');   // For first admin creation

const app = express();

// Passport Config
require('./config/passport-config')(passport);

// DB Config
const dbURI = process.env.MONGO_URI;
mongoose.connect(dbURI)
    .then(() => {
        console.log('MongoDB Connected...');
        createFirstAdminUser(); // Create first admin if needed
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

async function createFirstAdminUser() {
    if (process.env.FIRST_ADMIN_EMAIL && process.env.FIRST_ADMIN_PASSWORD) {
        try {
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (!existingAdmin) {
                const existingUserByEmail = await User.findOne({ email: process.env.FIRST_ADMIN_EMAIL });
                if (existingUserByEmail) {
                    console.log('An admin account could not be created because the specified email is already in use.');
                    return;
                }

                const hashedPassword = await bcrypt.hash(process.env.FIRST_ADMIN_PASSWORD, 12);
                const adminUser = new User({
                    username: 'admin', // Default username for the first admin
                    email: process.env.FIRST_ADMIN_EMAIL,
                    password: hashedPassword,
                    role: 'admin',
                    isVerified: true // Or implement email verification for admin too
                });
                await adminUser.save();
                console.log('First admin user created successfully. Email:', process.env.FIRST_ADMIN_EMAIL);
                console.log('IMPORTANT: Please change the default password immediately after first login.');
            }
        } catch (error) {
            console.error('Error creating first admin user:', error);
        }
    }
}


// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Bodyparser Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Express session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: dbURI,
            collectionName: 'sessions' // Optional: specify session collection name
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// CSRF Protection
// IMPORTANT: CSRF must be after session and cookie parsers but before routes
app.use(csrf({ cookie: false })); // Using session-based CSRF tokens

// Connect flash
app.use(flash());

// Global variables for views
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // For passport errors
    res.locals.currentUser = req.user || null;
    res.locals.csrfToken = req.csrfToken(); // Make CSRF token available to all views
    next();
});

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/indexRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// Error handling middleware for CSRF token errors
app.use(function (err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN') {
        req.flash('error_msg', 'Form tampered with or session expired. Please try again.');
        return res.redirect(req.originalUrl.split('?')[0] || '/');
    }
    next(err);
});


// Not Found (404) Handler - Must be after all routes
app.use((req, res, next) => {
    res.status(404).render('404', { title: 'Page Not Found' }); // Create a 404.ejs view
});

// General Error Handler - Must be the last middleware
app.use((err, req, res, next) => {
    console.error("Global Error Handler:", err);
    const statusCode = err.status || 500;
    res.status(statusCode).render('error', { // Create an error.ejs view
        title: 'Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));