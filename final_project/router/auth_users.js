const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let existUsers = users.filter((user) => {
    return user.username === username;
  });
  if (existUsers.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  let userExist = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (userExist.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Please provide Username and Password" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;

  if (!isbn || !review) {
    return res.status(400).json({ message: "ISBN and review are required" });
  }

  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update review
  book.reviews[username] = review;

  return res.status(200).json({
    message: `Review by '${username}' added/updated successfully`,
    reviews: book.reviews,
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({
      message: `Review by '${username}' deleted successfully`,
      reviews: book.reviews,
    });
  } else {
    return res.status(404).json({ message: "No review found by this user for the given book" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
