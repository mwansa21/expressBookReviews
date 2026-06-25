const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Check if username already exists
const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

// Return all books
const getAllBooks = async () => {
  return books;
};

// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required.",
    });
  }

  if (doesExist(username)) {
    return res.status(409).json({
      message: "User already exists.",
    });
  }

  users.push({
    username,
    password,
  });

  return res.status(201).json({
    message: "User successfully registered. Please login.",
  });
});

// Get all books
public_users.get("/", async (req, res) => {
  try {
    const allBooks = await getAllBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    console.error("Error retrieving books:", error);

    return res.status(500).json({
      message: "Unable to retrieve books.",
      error: error.message,
    });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;

    const book = books[isbn];

    if (!book) {
      return res.status(404).json({
        message: "ISBN not found.",
      });
    }

    return res.status(200).json(book);
  } catch (error) {
    console.error("Error retrieving book by ISBN:", error);

    return res.status(500).json({
      message: "An unexpected error occurred while retrieving the book.",
      error: error.message,
    });
  }
});

// Get book details based on author (Question 11)
public_users.get("/author/:author", async (req, res) => {
  try {
    const author = req.params.author;

    if (!author) {
      return res.status(400).json({
        message: "Author name is required.",
      });
    }

    if (!books || Object.keys(books).length === 0) {
      return res.status(500).json({
        message: "Book database is unavailable.",
      });
    }

    const matchingBooks = Object.values(books).filter(
      (book) =>
        book.author &&
        book.author.toLowerCase() === author.toLowerCase()
    );

    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    }

    return res.status(404).json({
      message: "No books found by that author.",
    });
  } catch (error) {
    console.error("Error retrieving books by author:", error);

    return res.status(500).json({
      message: "An unexpected error occurred while retrieving books by author.",
      error: error.message,
    });
  }
});

// Get book details based on title
public_users.get("/title/:title", async (req, res) => {
  try {
    const title = req.params.title;

    const matchingBook = Object.values(books).find(
      (book) =>
        book.title &&
        book.title.toLowerCase() === title.toLowerCase()
    );

    if (!matchingBook) {
      return res.status(404).json({
        message: "Title not found.",
      });
    }

    return res.status(200).json(matchingBook);
  } catch (error) {
    console.error("Error retrieving book by title:", error);

    return res.status(500).json({
      message: "An unexpected error occurred while retrieving the book.",
      error: error.message,
    });
  }
});

// Get book reviews
public_users.get("/review/:isbn", (req, res) => {
  try {
    const isbn = req.params.isbn;

    const book = books[isbn];

    if (!book) {
      return res.status(404).json({
        message: "ISBN not found.",
      });
    }

    return res.status(200).json(book.reviews);
  } catch (error) {
    console.error("Error retrieving reviews:", error);

    return res.status(500).json({
      message: "An unexpected error occurred while retrieving reviews.",
      error: error.message,
    });
  }
});

module.exports.general = public_users;
