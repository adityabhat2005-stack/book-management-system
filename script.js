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

// Show status/error messages
function showMessage(text, type = 'success') {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  setTimeout(() => {
    messageBox.className = 'message hidden';
  }, 4000);
}

// Fetch and render all books
async function fetchBooks() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to load books');
    const books = await res.json();
    renderBooks(books);
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

// Render book rows into table
function renderBooks(books) {
  bookList.innerHTML = '';
  if (books.length === 0) {
    bookList.innerHTML = '<tr><td colspan="5" style="text-align:center;">No books found.</td></tr>';
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

// Add or Update book on form submit
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
    if (!res.ok) throw new Error(data.message || 'Operation failed');

    showMessage(data.message, 'success');
    resetForm();
    fetchBooks();
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

// Populate form for editing
function startEdit(id, title, author, price) {
  bookIdInput.value = id;
  titleInput.value = title;
  authorInput.value = author;
  priceInput.value = price;
  formTitle.textContent = `Edit Book (ID: ${id})`;
  submitBtn.textContent = 'Update Book';
  cancelBtn.classList.remove('hidden');
}

// Reset form to Add mode
function resetForm() {
  bookForm.reset();
  bookIdInput.value = '';
  formTitle.textContent = 'Add New Book';
  submitBtn.textContent = 'Add Book';
  cancelBtn.classList.add('hidden');
}

cancelBtn.addEventListener('click', resetForm);

// Delete a book
async function deleteBook(id) {
  if (!confirm(`Are you sure you want to delete book ID ${id}?`)) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete book');

    showMessage(data.message, 'success');
    fetchBooks();
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

// Find a single book by ID (GET /books/:id)
searchBtn.addEventListener('click', async () => {
  const id = searchIdInput.value;
  if (!id) return showMessage('Enter a valid Book ID to search.', 'error');

  try {
    const res = await fetch(`${API_URL}/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Book not found');

    renderBooks([data]);
    showMessage(`Showing book ID ${id}`, 'success');
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

resetBtn.addEventListener('click', () => {
  searchIdInput.value = '';
  fetchBooks();
});

// Initial load
fetchBooks();
