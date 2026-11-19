const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies and serve static frontend files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data store
let books = [
  { id: 1, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', price: 450 },
  { id: 2, title: 'Clean Code', author: 'Robert C. Martin', price: 520 }
];
let nextId = 3;

// 1. GET /books - Retrieve all books
app.get('/books', (req, res) => {
  res.status(200).json(books);
});

// 2. GET /books/:id - Retrieve a particular book by ID
app.get('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = books.find(b => b.id === id);

  if (!book) {
    return res.status(404).json({ message: `Book with ID ${id} not found.` });
  }
  res.status(200).json(book);
});

// 3. POST /books - Add a new book
app.post('/books', (req, res) => {
  const { title, author, price } = req.body;

  if (!title || !author || price === undefined || isNaN(price) || Number(price) < 0) {
    return res.status(400).json({ message: 'Please provide valid title, author, and price.' });
  }

  const newBook = {
    id: nextId++,
    title: title.trim(),
    author: author.trim(),
    price: Number(price)
  };

  books.push(newBook);
  res.status(201).json({ message: 'Book added successfully!', book: newBook });
});

// 4. PUT /books/:id - Update an existing book
app.put('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, author, price } = req.body;
  const bookIndex = books.findIndex(b => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ message: `Book with ID ${id} not found.` });
  }

  if (!title || !author || price === undefined || isNaN(price) || Number(price) < 0) {
    return res.status(400).json({ message: 'Please provide valid title, author, and price.' });
  }

  books[bookIndex] = {
    id,
    title: title.trim(),
    author: author.trim(),
    price: Number(price)
  };

  res.status(200).json({ message: 'Book updated successfully!', book: books[bookIndex] });
});

// 5. DELETE /books/:id - Delete a book
app.delete('/books/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const bookIndex = books.findIndex(b => b.id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ message: `Book with ID ${id} not found.` });
  }

  const deletedBook = books.splice(bookIndex, 1);
  res.status(200).json({ message: 'Book deleted successfully!', book: deletedBook[0] });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
