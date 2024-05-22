// const express = require("express");
// const router = express.Router();

// const session = require('express-session');
// const MongoStore = require('connect-mongo');
// const bcrypt = require('bcrypt');
// const saltRounds = 12;

// const Joi = require("joi");

// const mongodb_host = process.env.MONGODB_HOST;
// const mongodb_user = process.env.MONGODB_USER;
// const mongodb_password = process.env.MONGODB_PASSWORD;
// const mongodb_database = process.env.MONGODB_DATABASE;
// const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
// // const node_session_secret = process.env.NODE_SESSION_SECRET;

// var { database } = include('databaseConnection');
// const userCollection = database.db(mongodb_database).collection('users');
// const tokenCollection = database.db(mongodb_database).collection('forgotToken');

// var mongoStore = MongoStore.create({
//     mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
//     crypto: {
//         secret: mongodb_session_secret
//     }
// })

// // USES
// router.use(express.urlencoded({ extended: false }));
// router.use(express.static(__dirname + "/public"));

// const { Configuration, OpenAI } = require("openai");
// const openai = new OpenAI({apiKey: process.env.GPT_KEY});

let input = "";

$(function() {
    $('#chatButton').on("click", function() {
        // Get the input value
        const userInput = $('#chatbotTextBox').val();
        // Send AJAX request to the server
        console.log("userInput: "+ JSON.stringify({userInput}));
        $.ajax({
            url: '/chatbot',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ userInput }),
            success: function(response) {
                console.log("success");
                // Update the page with the processed data
                $('#output').text(response);
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
            }
        });
    });
});

// $(function () { 
//     $("#chatInput").on("submit", function (event) { 
//        event.preventDefault();
//        let value = $("#chatbotTextBox").val();
//        console.log(value);
//        $.ajax({
//             url: "/chatBot",
//             type:"POST",
//             contentType: "application/json",
//             data: JSON.stringify({value}),
//             success: function(res){
//                 console.log("res.text: " + res.response);
//                 console.log("here");
//                 $("#testing").html(`${res.response}`);
//             }


//        })
//     }); 
//  }); 

//  module.exports = router