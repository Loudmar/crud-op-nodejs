require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const { logger } = require('./middleware/logEvents');
const errorHandler = require('./middleware/errorHandler')
const verifyJWT = require('./middleware/verifyJWT');
const cookieParser = require('cookie-parser');
const credentials = require('./middleware/credentials');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

// connecting to MongoDB

connectDB();

// custom middleware
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirement
app.use(credentials);

// Cross origin resource sharing
app.use(cors(corsOptions));

//build-in middleware to handle url encoded data
app.use(express.urlencoded({ extended: false }));
// build-in middleware for json
app.use(express.json());

// middleware for cookies
app.use(cookieParser());

// Server static files
app.use(express.static(path.join(__dirname, '/public')));

//routes

app.use('/', require('./routes/root'));
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));

// Any routes below the verify will need to be verified.
app.use(verifyJWT);
app.use('/employees', require('./routes/api/employees'));
app.use('/users', require('./routes/api/users'));

// Routes handlers - Middleware

app.get('/hello(.html)?', (req, res, next) => {
    console.log('Trying to load hello.html');
    next()
}, (req, res) => {
    res.send('Hello Loud, happy you are here!');
});
//app.get or all
app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ error: "404 Not Found" })
    } else {
        res.type('text').send("404 Not Found");
    }
})

//Express already handle errors, but here we can also customize error handler
app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})

//It can be deployed to glitch.me