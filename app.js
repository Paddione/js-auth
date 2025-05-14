// app.js
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // For storing sessions in MongoDB
const passport = require('passport');
const flash = require('connect-flash'); // For flash messages
const path = require('path');
const csrf = require('csurf'); // For CSRF protection

const User = require('./models/User'); // User model for first admin creation
const bcrypt = require('bcryptjs');   // For hashing first admin password

const app = express();

// --- Passport Configuration ---
// This line assumes your passport-config.js exports a function that takes passport as an argument
require('./config/passport-config')(passport);

// --- Database Configuration & Connection with Retry ---
const dbURI = process.env.MONGO_URI;

const connectWithRetry = () => {
    console.log('Attempting MongoDB connection...');
    // For Mongoose 6+, useNewUrlParser, useUnifiedTopology, useCreateIndex, useFindAndModify are no longer needed.
    // serverSelectionTimeoutMS gives Mongoose time to find a server, useful in containerized environments.
    mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 })
        .then(() => {
            console.log('MongoDB Connected Successfully.');
            createFirstAdminUser(); // Attempt to create first admin user after successful connection
        })
        .catch(err => {
            console.error(`MongoDB Connection Error: ${err.message} - Retrying in 5 seconds...`);
            setTimeout(connectWithRetry, 5000);
        });
};

connectWithRetry(); // Initialize database connection

// --- Optional: Create First Admin User ---
async function createFirstAdminUser() {
    if (process.env.FIRST_ADMIN_EMAIL && process.env.FIRST_ADMIN_PASSWORD) {
        try {
            const existingAdmin = await User.findOne({ role: 'admin' });
            if (existingAdmin) {
                // console.log('An admin user already exists. Skipping creation of first admin.');
                return;
            }

            const existingUserByEmail = await User.findOne({ email: process.env.FIRST_ADMIN_EMAIL.toLowerCase() });
            if (existingUserByEmail) {
                console.warn(`Could not create first admin: Email "${process.env.FIRST_ADMIN_EMAIL}" is already in use by another account.`);
                return;
            }

            const adminUser = new User({
                username: process.env.FIRST_ADMIN_USERNAME || 'admin', // Default username or from .env
                email: process.env.FIRST_ADMIN_EMAIL.toLowerCase(),
                password: process.env.FIRST_ADMIN_PASSWORD, // Pre-save hook will hash this
                role: 'admin',
                isVerified: true // Assume first admin is verified
            });
            await adminUser.save(); // This will trigger the pre-save hook for password hashing
            console.log(`First admin user created successfully. Email: ${process.env.FIRST_ADMIN_EMAIL}`);
            console.warn('IMPORTANT: Please change the default admin password immediately after first login for security reasons.');

        } catch (error) {
            console.error('Error during first admin user creation:', error.message);
        }
    }
}

// --- View Engine Setup (EJS) ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Sets the directory for EJS templates

// --- Middleware ---
// Body Parser Middleware (for parsing form data)
app.use(express.urlencoded({ extended: false })); // Parses URL-encoded bodies
app.use(express.json()); // Parses JSON bodies

// Express Session Middleware
app.use(
    session({
        secret: process.env.SESSION_SECRET, // Secret key to sign the session ID cookie
        resave: false,                      // Don't save session if unmodified
        saveUninitialized: false,           // Don't create session until something stored
        store: MongoStore.create({          // Store session in MongoDB
            mongoUrl: dbURI,
            collectionName: 'sessions',     // Optional: name of the sessions collection
            ttl: 14 * 24 * 60 * 60          // Optional: session TTL in seconds (e.g., 14 days)
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,    // Cookie expiry (e.g., 1 day in milliseconds)
            httpOnly: true,                 // Helps prevent XSS attacks
            secure: process.env.NODE_ENV === 'production' // Use secure cookies in production (requires HTTPS)
        }
    })
);

// Passport Middleware (for authentication)
app.use(passport.initialize()); // Initializes Passport
app.use(passport.session());    // Enables persistent login sessions

// CSRF Protection Middleware (csurf)
app.use(csrf());

// Connect Flash Middleware (for flash messages)
app.use(flash());

// Global Variables Middleware (for views)
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.validation_errors = req.flash('validation_errors');
    res.locals.old_input = req.flash('old_input')[0] || {};
    res.locals.currentUser = req.user || null;
    res.locals.csrfToken = typeof req.csrfToken === 'function' ? req.csrfToken() : '';
    next();
});

// Static Folder Middleware
app.use(express.static(path.join(__dirname, 'public')));

// --- Routes ---
app.use('/', require('./routes/indexRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// --- Error Handling Middleware ---
// CSRF Token Error Handler
app.use(function (err, req, res, next) {
    if (err.code === 'EBADCSRFTOKEN') {
        req.flash('error_msg', 'Form submission error or session expired. Please try again.');
        res.locals.currentUser = req.user || null;
        res.locals.csrfToken = (typeof req.csrfToken === 'function') ? req.csrfToken() : '';
        return res.redirect(req.session.returnTo || req.originalUrl.split('?')[0] || '/');
    }
    next(err);
});

// 404 Not Found Handler
app.use((req, res, next) => {
    res.locals.currentUser = req.user || null;
    res.locals.csrfToken = (typeof req.csrfToken === 'function') ? req.csrfToken() : '';
    res.status(404).render('404', {
        title: 'Page Not Found'
    });
});

// General Error Handler
app.use((err, req, res, next) => {
    console.error("Global Error Handler Invoked:", err);
    res.locals.currentUser = req.user || null;
    res.locals.csrfToken = (typeof req.csrfToken === 'function') ? req.csrfToken() : '';
    res.locals.success_msg = '';
    res.locals.error_msg = '';
    const statusCode = err.status || 500;
    const errorMessage = (process.env.NODE_ENV === 'development' || err.expose) ? err.message : 'An unexpected error occurred. Please try again later.';
    if (res.headersSent) {
        return next(err);
    }
    res.status(statusCode).render('error', {
        title: `Error ${statusCode}`,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack, status: statusCode } : {}
    });
});

// --- Server Initialization & Graceful Shutdown ---
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => { // Assign app.listen to 'server' variable
    console.log(`Server started on port ${PORT}`);
    console.log(`Application accessible at: ${process.env.APP_BASE_URL || `http://localhost:${PORT}`}`);
});

// Graceful Shutdown Function
async function gracefulShutdown(signal) {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);

    const forceShutdownTimeout = setTimeout(() => {
        console.error('Graceful shutdown timed out, forcefully shutting down');
        process.exit(1); // Force exit if cleanup takes too long
    }, 15000); // 15 seconds timeout

    try {
        // Close HTTP server: stop accepting new connections and wait for existing ones to finish
        await new Promise((resolve, reject) => {
            server.close((err) => {
                if (err) {
                    console.error('Error closing HTTP server:', err);
                    return reject(err); // Reject if server.close() itself errors
                }
                console.log('HTTP server closed.');
                resolve();
            });
        });

        // Close MongoDB connection
        // Mongoose connection.close() returns a promise and no longer accepts a callback or the 'false' argument
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');

        clearTimeout(forceShutdownTimeout); // Important: clear the timeout if shutdown was successful
        process.exit(0); // Exit process cleanly after all cleanup
    } catch (err) {
        console.error('Error during graceful shutdown:', err);
        clearTimeout(forceShutdownTimeout); // Also clear timeout on error before exiting
        process.exit(1); // Exit with an error code
    }
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Sent by Docker/orchestrators
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Sent by Ctrl+C in terminal

