const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

// Array to store registered users
let users = [];

/**
 * Checks if a username is valid (not empty and not already registered)
 * @param {string} username The username to check
 * @returns {boolean} True if the username is available, false otherwise
 */
const isValid = (username)=>{
    if (!username) return false;
    let userswithsamename = users.filter((user)=>{
        return user.username === username
    });
    if(userswithsamename.length > 0){
        return false; // Username already exists
    } else {
        return true; // Username is valid and available
    }
}

/**
 * Checks if username and password match a registered user
 * @param {string} username 
 * @param {string} password
 * @returns {boolean} True if authenticated, false otherwise
 */
const authenticatedUser = (username,password)=>{
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

// Task 7: only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        // Changed status to 400 (Bad Request) as credentials weren't provided
        return res.status(400).json({message: "Error logging in: Username or Password not provided"});
    }

    if (authenticatedUser(username, password)) {
        // Create JWT for session
        let accessToken = jwt.sign({
            data: username
        }, 'access', { expiresIn: 60 * 60 }); // Token expires in 1 hour

        // Store JWT and username in session
        req.session.authorization = {
            accessToken,
            username
        }
        // Use status 200 and return a message
        return res.status(200).json({message: "User successfully logged in", token: accessToken});
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Task 8: Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    // Review content is expected in the query parameters
    const review = req.query.review;
    const username = req.user.data; // Retrieved from the JWT payload

    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found."});
    }

    if (!review) {
        return res.status(400).json({message: "Review content is required."});
    }

    // Check if the user already reviewed the book
    if (books[isbn].reviews[username]) {
        // If yes, modify the existing review
        books[isbn].reviews[username] = review;
        return res.status(200).json({message: `Review for ISBN ${isbn} by user ${username} successfully modified.`});
    } else {
        // If no, add a new review
        books[isbn].reviews[username] = review;
        return res.status(200).json({message: `Review for ISBN ${isbn} by user ${username} successfully added.`});
    }
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.data; // Retrieved from the JWT payload

    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found."});
    }

    // Check if the user has a review for this book
    if (books[isbn].reviews[username]) {
        // Delete the review associated with the current username
        delete books[isbn].reviews[username];
        return res.status(200).json({message: `Review for ISBN ${isbn} by user ${username} successfully deleted.`});
    } else {
        return res.status(404).json({message: `No review found for ISBN ${isbn} by user ${username}.`});
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;