const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res.status(200).json({ message: "User successfully registered." });
    } else {
      return res.status(400).json({ message: "User already exists!" });
    }
  }

  return res.status(400).json({ message: "Please provide Username and Password" });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        resolve(books);
      });
    };

    const bookList = await getBooks();
    return res.status(200).json(bookList);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const { isbn } = req.params;

  const getBookByISBN = () => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject("Book not found");
      }
    });
  };

  try {
    const book = await getBookByISBN();
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: "Could not find the book for the given ISBN." });
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  const { author } = req.params;

  const getBooksByAuthor = () => {
    return new Promise((resolve, reject) => {
      const result = Object.values(books).filter((book) => book.author === author);
      if (result.length > 0) {
        resolve(result);
      } else {
        reject("No books found for the given author.");
      }
    });
  };

  try {
    const booksByAuthor = await getBooksByAuthor();
    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Get all books based on title
public_users.get("/title/:title", async (req, res) => {
  const { title } = req.params;

  const getBooksByTitle = () => {
    return new Promise((resolve, reject) => {
      const result = Object.values(books).filter((book) => book.title === title);
      if (result.length > 0) {
        resolve(result);
      } else {
        reject("No books found with the given title.");
      }
    });
  };

  try {
    const booksByTitle = await getBooksByTitle();
    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
