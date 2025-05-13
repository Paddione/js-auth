// routes/indexRoutes.js
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../middlewares/authMiddleware');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('index', { title: 'Welcome' }));

// Dashboard (redirects to user dashboard for authenticated users)
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    if (req.user.role === 'admin') {
        res.redirect('/admin/dashboard');
    } else {
        res.redirect('/user/dashboard');
    }
});

module.exports = router;