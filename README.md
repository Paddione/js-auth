/my-auth-app
|-- /config
|   |-- passport-config.js
|   |-- keys-example.js  // Example for .env, rename to .env and fill
|-- /controllers
|   |-- authController.js
|   |-- userController.js
|   |-- adminController.js
|-- /middlewares
|   |-- authMiddleware.js
|   |-- validationMiddleware.js
|-- /models
|   |-- User.js
|   |-- PasswordResetToken.js
|-- /public
|   |-- /css
|   |   |-- style.css
|   |-- /js
|       |-- main.js       // (Optional, for client-side enhancements)
|-- /routes
|   |-- authRoutes.js
|   |-- userRoutes.js
|   |-- adminRoutes.js
|   |-- indexRoutes.js
|-- /services
|   |-- emailService.js
|-- /views
|   |-- /auth
|   |   |-- login.ejs
|   |   |-- register.ejs
|   |   |-- forgot-password.ejs
|   |   |-- reset-password.ejs
|   |-- /user
|   |   |-- dashboard.ejs
|   |   |-- change-password.ejs
|   |-- /admin
|   |   |-- dashboard.ejs
|   |   |-- users.ejs
|   |   |-- edit-user.ejs
|   |-- /partials
|   |   |-- header.ejs
|   |   |-- footer.ejs
|   |   |-- navigation.ejs
|   |   |-- messages.ejs  // For flash messages
|   |-- index.ejs
|-- .gitignore
|-- app.js
|-- package.json