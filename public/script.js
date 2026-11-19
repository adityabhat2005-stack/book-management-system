const API_URL = '/books';

const bookForm = document.getElementById('book-form');
const formTitle = document.getElementById('form-title');
const bookIdInput = document.getElementById('book-id');
const titleInput = document.getElementById('title');
const authorInput = document.getElementById('author');
const priceInput = document.getElementById('price');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const bookList = document.getElementById('book-list');
const messageBox = document.getElementById('message-box');

const searchIdInput = document.getElementById('search-id');
const searchBtn = document.getElementById('search-btn');
const resetBtn = document.getElementById('reset-btn');

// Display notification messages
function showMessage(text, type = 'success') {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  setTimeout(() => {
    messageBox.className = 'message hidden';
  }, 4000);
}

// Fetch all books (GET /books)
async function fetchBooks() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch books from server.');
    const books = await res.json();
    renderBooks(books);
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

// Dynamically render books into the table
function renderBooks(books) {
  bookList.innerHTML = '';
  if (books.length === 0) {
    bookList.innerHTML = '<tr><td colspan="5" style="text-align:center;">No books available.</td></tr>';
    return;
  }

  books.forEach(book => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${book.id}</td>
      <td>${book.title}</td>
      <td>${book.author}</td>
      <td>₹${Number(book.price).toFixed(2)}</td>
      <td>
        <button class="edit-btn" onclick="startEdit(${book.id}, '${book.title.replace(/'/g, "\\'")}', '${book.author.replace(/'/g, "\\'")}', ${book.price})">Edit</button>
        <button class="delete-btn" onclick="deleteBook(${book.id})">Delete</button>
      </td>
    `;
    bookList.appendChild(row);
  });
}

// Add (POST /books) or Update (PUT /books/:id)
bookForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = bookIdInput.value;
  const bookData = {
    title: titleInput.value,
    author: authorInput.value,
    price: parseFloat(priceInput.value)
  };

  try {
    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Operation failed.');

    showMessage(data.message, 'success');
    resetForm();
    fetchBooks();
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

// Load selected book into form for editing
function startEdit(id, title, author, price) {
  bookIdInput.value = id;
  titleInput.value = title;
  authorInput.value = author;
  priceInput.value = price;
  formTitle.textContent = `Edit Book (ID: ${id})`;
  submitBtn.textContent = 'Update Book';
  cancelBtn.classList.remove('hidden');
}

// Reset form back to Add mode
function resetForm() {
  bookForm.reset();
  bookIdInput.value = '';
  formTitle.textContent = 'Add New Book';
  submitBtn.textContent = 'Add Book';
  cancelBtn.classList.add('hidden');
}

cancelBtn.addEventListener('click', resetForm);

// Delete a book (DELETE /books/:id)
async function deleteBook(id) {
  if (!confirm(`Delete book with ID ${id}?`)) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete book.');

    showMessage(data.message, 'success');
    fetchBooks();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

// Search book by ID (GET /books/:id)
searchBtn.addEventListener('click', async () => {
  const id = searchIdInput.value;
  if (!id) return showMessage('Please enter a Book ID.', 'error');

  try {
    const res = await fetch(`${API_URL}/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Book not found.');

    renderBooks([data]);
    showMessage(`Found Book ID ${id}`, 'success');
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

resetBtn.addEventListener('click', () => {
  searchIdInput.value = '';
  fetchBooks();
});

// Load books when page opens
fetchBooks();
