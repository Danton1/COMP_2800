// imports
const express = require("express");
const router = express.Router();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const Joi = require("joi");

// declaring encoding and expriy variables
const saltRounds = 12;
const expireTime = 24 * 60 * 60 * 1000; //expires after 24 hr  (hours * minutes * seconds * millis)

// ENV variables
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_database = process.env.MONGODB_DATABASE;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const node_session_secret = process.env.NODE_SESSION_SECRET;

// connecting to database
var { database } = include('databaseConnection');
const userCollection = database.db(mongodb_database).collection('users');
var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
    crypto: {
        secret: mongodb_session_secret
    }
})

// USES
router.use(express.urlencoded({ extended: false }));
router.use(express.static(__dirname + "/public"));

// creates session
router.use(session({
    secret: node_session_secret,
    store: mongoStore, //default is memory store 
    saveUninitialized: false,
    resave: true
}));

// renders page
router.get('/', (req, res) => {
    res.render("signUpPage");
});

router.post('/submitSignUp', async (req, res) => {
    // gets variables from html
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var birthDate = req.body.birthDate;
    var country = req.body.country;
    var city = req.body.city;
    var email = req.body.email;
    var password = req.body.password;
    var passwordConfirm = req.body.passwordConfirm;

    // compares password match
    if (password.localeCompare(passwordConfirm) != 0) {
        res.render("errorPage", { error: "Passwords do not match." });
        return;
    }

    // Getting the userName info from the email
    const result = await userCollection.find({ email: email }).project({ email: 1, _id: 1 }).toArray();

    if (result.length != 0) {
        res.render("errorPage", { error: "Email already used" });
        return;
    } else {
        // sets default variables in database
        const schema = Joi.object({
            startTime: Joi.date().required(),
            endTime: Joi.date().required(),
            firstName: Joi.string().max(20).required(),
            lastName: Joi.string().max(20).required(),
            birthDate: Joi.date().required().min(Joi.ref('startTime')).max(Joi.ref('endTime')),
            country: Joi.string().max(20).required(),
            city: Joi.string().max(20).required(),
            email: Joi.string().email().max(40).required(),
            password: Joi.string().max(20).required()
        });
        // validates data
        const validationResult = schema.validate({ startTime: '1900-01-01T00:00:00.000', endTime: '2054-01-01T00:00:00.000', firstName, lastName, birthDate, country, city, email, password, });
        // error handling
        if (validationResult.error != null) {
            var err = validationResult.error.details[0];
            if (err.type.localeCompare('string.empty') == 0) {
                res.render("errorPage", { error: `${err.path[0]} is empty.` });
                return;
            } else if (err.type.localeCompare('date.max') == 0) {
                res.render("errorPage", { error: `Date is too large.` });
                return;
            } else if (err.type.localeCompare('date.min') == 0) {
                res.render("errorPage", { error: `Date is too small.` });
                return;
            }
            res.render("errorPage", { error: `${err.message}` });
            return;
        }
        // encodes password
        var encodedPassword = await bcrypt.hash(password, saltRounds);
        // updates variables to db
        await userCollection.insertOne(
            {
                firstName: firstName,
                lastName: lastName,
                birthDate: birthDate,
                country: country,
                city: city,
                email: email,
                secondaryEmail: null,
                phoneNumber: null,
                emergencyEmail: null,
                emergencyPhoneNumber: null,
                password: encodedPassword,
                medications: [], illnesses: [], allergies: [],
                profile_pic: null
            }
        );
        // updates session variables
        req.session.authenticated = true;
        req.session.firstName = firstName;
        req.session.lastName = lastName;
        req.session.email = email;
        req.session.cookie.maxAge = expireTime;
        // go to main page
        res.redirect('/');
    }
});

module.exports = router;