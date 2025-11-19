const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/**
 * Simulates fetching all books asynchronously using a Promise.
 * @returns {Promise<object>} A promise that resolves with the books object.
 */
function getBookList() {
    return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
            if (Object.keys(books).length > 0) {
                resolve(books);
            } else {
                reject(new Error("No books found."));
            }
        }, 600);
    });
}

/**
 * Simulates fetching book details by ISBN asynchronously using a Promise.
 * @param {string} isbn The ISBN of the book.
 * @returns {Promise<object>} A promise that resolves with the book details or rejects if not found.
 */
function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            if (book) {
                resolve(book);
            } else {
                reject(new Error(`Book with ISBN ${isbn} not found.`));
            }
        }, 600);
    });
}

/**
 * Simulates fetching books by Author asynchronously using a Promise.
 * @param {string} author The author's name.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of matching books.
 */
function getBooksByAuthor(author) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const matchingBooks = [];
            for (const isbn in books) {
                if (books[isbn].author === author) {
                    matchingBooks.push({ isbn, ...books[isbn] });
                }
            }
            if (matchingBooks.length > 0) {
                resolve({booksbyauthor: matchingBooks});
            } else {
                reject(new Error(`No books found by author: ${author}`));
            }
        }, 600);
    });
}

/**
 * Simulates fetching books by Title asynchronously using a Promise.
 * @param {string} title The book's title.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of matching books.
 */
function getBooksByTitle(title) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const matchingBooks = [];
            for (const isbn in books) {
                if (books[isbn].title === title) {
                    matchingBooks.push({ isbn, ...books[isbn] });
                }
            }
            if (matchingBooks.length > 0) {
                resolve({booksbytitle: matchingBooks});
            } else {
                reject(new Error(`No books found with title: ${title}`));
            }
        }, 600);
    });
}


// Task 6: Register a new user (Synchronous)
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (isValid(username)) {
            users.push({"username":username,"password":password});
            return res.status(200).json({message: "User successfully registered. Now you can login."});
        } else {
            return res.status(409).json({message: "User already exists!"});    
        }
    } 
    return res.status(400).json({message: "Unable to register user. Username and password are required."});
});

// Task 10 (Async-Await): Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
        const bookList = await getBookList();
        return res.status(200).json(bookList);
    } catch (error) {
        return res.status(404).json({message: error.message});
    }
});

// Task 11 (Async-Await): Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
        const book = await getBookByISBN(isbn);
        return res.status(200).json(book);
    } catch (error) {
        return res.status(404).json({message: error.message});
    }
});
 
// Task 12 (Promise Callbacks): Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    
    getBooksByAuthor(author)
        .then(result => {
            return res.status(200).json(result);
        })
        .catch(error => {
            return res.status(404).json({message: error.message});
        });
});

// Task 13 (Promise Callbacks): Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;

    getBooksByTitle(title)
        .then(result => {
            return res.status(200).json(result);
        })
        .catch(error => {
            return res.status(404).json({message: error.message});
        });
});

// Task 5 (Synchronous): Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({message: `Book with ISBN ${isbn} not found.`});
    }
});

module.exports.general = public_users;