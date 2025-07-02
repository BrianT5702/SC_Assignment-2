// index.js - Bookstore Inventory Main Logic

// --- Constants ---
const API_URL = '/books';
const THEME_KEY = 'theme';

// --- State ---
let allBooks = [];
let filteredBooks = [];
let sortState = { key: 'title', dir: 'asc' };

// --- DOM Elements ---
const themeToggle = document.getElementById('theme-toggle');
const searchBar = document.getElementById('search-bar');
const dashboardBooks = document.getElementById('dashboard-total-books');
const dashboardStock = document.getElementById('dashboard-total-stock');
const dashboardValue = document.getElementById('dashboard-total-value');
const inventoryBody = document.querySelector('#inventory-table tbody');
const sellBody = document.querySelector('#sell-table tbody');
const inventoryEmpty = document.getElementById('inventory-empty');
const sellEmpty = document.getElementById('sell-empty');
const noResults = document.getElementById('no-results');
const loadingOverlay = document.getElementById('loading-overlay');

// --- Theme ---
function setTheme(dark) {
    if (dark) {
        document.body.classList.add('theme-dark');
        themeToggle.checked = true;
        localStorage.setItem(THEME_KEY, 'dark');
        // Table and card dark classes
        document.querySelectorAll('.table').forEach(t => t.classList.add('table-dark'));
        document.querySelectorAll('.card').forEach(c => c.classList.add('bg-dark', 'text-white'));
        document.querySelectorAll('.table-light').forEach(th => th.classList.add('bg-dark', 'text-white'));
        document.querySelectorAll('thead').forEach(thead => thead.classList.add('bg-dark', 'text-white'));
        document.querySelectorAll('th').forEach(th => th.classList.add('bg-dark', 'text-white'));
        // Search bar
        if (searchBar) {
            searchBar.classList.add('bg-dark', 'text-white');
            searchBar.style.setProperty('color', '#fff', 'important');
            searchBar.style.setProperty('background-color', '#23272b', 'important');
            searchBar.style.setProperty('border-color', '#495057', 'important');
        }
    } else {
        document.body.classList.remove('theme-dark');
        themeToggle.checked = false;
        localStorage.setItem(THEME_KEY, 'light');
        // Remove dark classes
        document.querySelectorAll('.table').forEach(t => t.classList.remove('table-dark'));
        document.querySelectorAll('.card').forEach(c => c.classList.remove('bg-dark', 'text-white'));
        document.querySelectorAll('.table-light').forEach(th => th.classList.remove('bg-dark', 'text-white'));
        document.querySelectorAll('thead').forEach(thead => thead.classList.remove('bg-dark', 'text-white'));
        document.querySelectorAll('th').forEach(th => th.classList.remove('bg-dark', 'text-white'));
        // Search bar
        if (searchBar) {
            searchBar.classList.remove('bg-dark', 'text-white');
            searchBar.style.removeProperty('color');
            searchBar.style.removeProperty('background-color');
            searchBar.style.removeProperty('border-color');
        }
    }
}
function initTheme() {
    setTheme(localStorage.getItem(THEME_KEY) === 'dark');
    themeToggle.onchange = () => setTheme(themeToggle.checked);
}

// --- Sorting ---
function sortBooks(books) {
    const { key, dir } = sortState;
    const direction = dir === 'asc' ? 1 : -1;
    return books.slice().sort((a, b) => {
        if (key === 'price' || key === 'quantity') {
            return (a[key] - b[key]) * direction;
        } else {
            return a[key].localeCompare(b[key], undefined, { sensitivity: 'base' }) * direction;
        }
    });
}
function updateSortIndicators() {
    document.querySelectorAll('.sortable').forEach(th => {
        const key = th.getAttribute('data-sort');
        const indicator = th.querySelector('.sort-indicator');
        if (key === sortState.key) {
            indicator.textContent = sortState.dir === 'asc' ? '▲' : '▼';
        } else {
            indicator.textContent = '';
        }
    });
}
function initSorting() {
    document.querySelectorAll('.sortable').forEach(th => {
        th.onclick = function() {
            const key = this.getAttribute('data-sort');
            if (sortState.key === key) {
                sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
            } else {
                sortState.key = key;
                sortState.dir = 'asc';
            }
            renderBooks();
        };
    });
}

// --- Search/Filter ---
function filterBooks() {
    const query = searchBar.value.trim().toLowerCase();
    if (!query) {
        filteredBooks = allBooks;
    } else {
        filteredBooks = allBooks.filter(book =>
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query)
        );
    }
}
function initSearch() {
    searchBar.addEventListener('input', () => {
        filterBooks();
        renderBooks();
    });
}

// --- Rendering ---
function renderDashboard() {
    dashboardBooks.textContent = filteredBooks.length;
    let totalStock = 0, totalValue = 0;
    filteredBooks.forEach(book => {
        totalStock += book.quantity;
        totalValue += book.price * book.quantity;
    });
    dashboardStock.textContent = totalStock;
    dashboardValue.textContent = `RM ${totalValue.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
}
function renderTables() {
    inventoryBody.innerHTML = '';
    sellBody.innerHTML = '';
    inventoryEmpty.style.display = filteredBooks.length === 0 && !searchBar.value ? '' : 'none';
    sellEmpty.style.display = filteredBooks.length === 0 && !searchBar.value ? '' : 'none';
    noResults.style.display = filteredBooks.length === 0 && searchBar.value ? '' : 'none';
    const sorted = sortBooks(filteredBooks);
    updateSortIndicators();
    sorted.forEach(book => {
        // Inventory row
        const row1 = document.createElement('tr');
        row1.innerHTML = `
            <td><a href="#" class="book-title-link" data-id="${book.id}" tabindex="0">${book.title}</a></td>
            <td>${book.author}</td>
            <td>${book.price}</td>
            <td>${book.quantity}</td>
            <td class="actions">
                <button class="btn btn-warning btn-sm me-1" onclick="editBook(${book.id})">Edit</button>
                <button class="btn btn-success btn-sm me-1" onclick="addStock(${book.id})">Add Stock</button>
                <button class="btn btn-danger btn-sm" onclick="deleteBook(${book.id})">Delete</button>
            </td>
        `;
        inventoryBody.appendChild(row1);
        // Sell row
        const row2 = document.createElement('tr');
        row2.innerHTML = `
            <td><a href="#" class="book-title-link" data-id="${book.id}" tabindex="0">${book.title}</a></td>
            <td>${book.author}</td>
            <td>${book.price}</td>
            <td>${book.quantity}</td>
            <td class="actions">
                <button class="btn btn-secondary btn-sm me-1" onclick="sellBook(${book.id})">Sell</button>
            </td>
        `;
        sellBody.appendChild(row2);
    });
    attachTitleLinkHandlers();
}
function renderBooks() {
    renderDashboard();
    renderTables();
}

// --- Loading ---
function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

// --- Book Fetch ---
function fetchBooks() {
    showLoading(true);
    fetch(API_URL)
        .then(res => res.json())
        .then(books => {
            allBooks = books;
            filterBooks();
            renderBooks();
            showLoading(false);
        })
        .catch(() => {
            showLoading(false);
        });
}

// --- Title Link Handlers ---
function attachTitleLinkHandlers() {
    document.querySelectorAll('.book-title-link').forEach(link => {
        link.onclick = function(e) {
            e.preventDefault();
            const id = this.getAttribute('data-id');
            window.viewBook(id);
        };
        link.onkeydown = function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const id = this.getAttribute('data-id');
                window.viewBook(id);
            }
        };
    });
}

// --- Global Button Handlers ---
window.editBook = function(id) {
    // Fetch book and open edit modal (reuse your previous logic or modal code)
    fetch(`${API_URL}/${id}`)
        .then(async res => {
            if (!res.ok) {
                showToast('Book not found', true);
                return;
            }
            return res.json();
        })
        .then(book => {
            if (!book) return;
            document.getElementById('book-id').value = book.id;
            document.getElementById('title').value = book.title;
            document.getElementById('author').value = book.author;
            document.getElementById('price').value = book.price;
            document.getElementById('quantity').value = book.quantity;
            window.editingId = book.id;
            if (window.openModal) window.openModal(true);
        });
};
window.addStock = function(id) {
    if (window.stockBookId && window.stockModal) {
        stockBookId.value = id;
        stockAmount.value = '';
        window.stockAction = 'add';
        stockModalTitle.textContent = 'Add Stock';
        stockLabel.textContent = 'Amount to Add';
        stockSubmitBtn.textContent = 'Add';
        stockModal.show();
    }
};
window.sellBook = function(id) {
    if (window.stockBookId && window.stockModal) {
        stockBookId.value = id;
        stockAmount.value = '';
        window.stockAction = 'sell';
        stockModalTitle.textContent = 'Sell Book';
        stockLabel.textContent = 'Amount to Sell';
        stockSubmitBtn.textContent = 'Sell';
        stockModal.show();
    }
};
window.deleteBook = function(id) {
    // Bootstrap modal for confirmation (reuse your previous logic)
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal fade';
    confirmModal.tabIndex = -1;
    confirmModal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirm Delete</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete this book?</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-danger" id="confirm-delete-btn">Delete</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(confirmModal);
    const bsModal = new bootstrap.Modal(confirmModal);
    let showDeleteSuccess = false;
    bsModal.show();
    confirmModal.querySelector('#confirm-delete-btn').onclick = function() {
        fetch(`${API_URL}/${id}`, { method: 'DELETE' })
            .then(async res => {
                bsModal.hide();
                confirmModal.remove();
                if (res.status === 204) {
                    showDeleteSuccess = true;
                    fetchBooks();
                } else {
                    showToast('Failed to delete book', true);
                }
            });
    };
    confirmModal.addEventListener('hidden.bs.modal', () => {
        confirmModal.remove();
        if (showDeleteSuccess) {
            showToast('Book deleted successfully');
        }
    });
};
window.viewBook = function(id) {
    // Fetch book and show view modal (reuse your previous logic)
    fetch(`${API_URL}/${id}`)
        .then(async res => {
            if (!res.ok) {
                showToast('Book not found', true);
                return;
            }
            return res.json();
        })
        .then(book => {
            if (!book) return;
            const viewModalBody = document.getElementById('view-modal-body');
            viewModalBody.innerHTML = `
                <dl class="row mb-0">
                    <dt class="col-sm-4">ID</dt><dd class="col-sm-8">${book.id}</dd>
                    <dt class="col-sm-4">Title</dt><dd class="col-sm-8">${book.title}</dd>
                    <dt class="col-sm-4">Author</dt><dd class="col-sm-8">${book.author}</dd>
                    <dt class="col-sm-4">Price</dt><dd class="col-sm-8">${book.price}</dd>
                    <dt class="col-sm-4">Quantity</dt><dd class="col-sm-8">${book.quantity}</dd>
                </dl>
            `;
            if (window.viewModal) window.viewModal.show();
        });
};

// --- Toast Notification ---
function showToast(message, isError = false) {
    const toastEl = document.getElementById('feedback-toast');
    const toastBody = document.getElementById('toast-body');
    toastBody.textContent = message;
    toastEl.classList.toggle('text-bg-danger', isError);
    toastEl.classList.toggle('text-bg-primary', !isError);
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    // Modal and form variables for global access
    window.openModal = function(isEdit = false) {
        if (!window._bookModal) {
            window._bookModal = new bootstrap.Modal(document.getElementById('book-modal'));
        }
        const modalTitle = document.getElementById('modal-title');
        const submitBtn = document.getElementById('submit-btn');
        if (isEdit) {
            modalTitle.textContent = 'Edit Book';
            submitBtn.textContent = 'Update Book';
        } else {
            modalTitle.textContent = 'Add Book';
            submitBtn.textContent = 'Add Book';
        }
        window._bookModal.show();
    };
    window.stockBookId = document.getElementById('stock-book-id');
    window.stockModal = new bootstrap.Modal(document.getElementById('stock-modal'));
    window.stockAmount = document.getElementById('stock-amount');
    window.stockModalTitle = document.getElementById('stock-modal-title');
    window.stockLabel = document.getElementById('stock-label');
    window.stockSubmitBtn = document.getElementById('stock-submit-btn');
    window.stockForm = document.getElementById('stock-form');
    window.viewModal = new bootstrap.Modal(document.getElementById('view-modal'));
    window.editingId = null;
    window.stockAction = 'add';
    // Modal close/cancel logic
    document.getElementById('close-modal').onclick = () => window._bookModal.hide();
    document.getElementById('cancel-edit').onclick = () => window._bookModal.hide();
    document.getElementById('close-stock-modal').onclick = () => window.stockModal.hide();
    document.getElementById('cancel-stock').onclick = () => window.stockModal.hide();
    document.getElementById('close-view-modal').onclick = () => window.viewModal.hide();
    // Stock form submit logic
    window.stockForm.onsubmit = function(e) {
        e.preventDefault();
        const id = window.stockBookId.value;
        const amount = parseInt(window.stockAmount.value);
        if (amount < 1) {
            showToast('Amount must be at least 1', true);
            return;
        }
        let endpoint = `${API_URL}/${id}/` + (window.stockAction === 'add' ? 'add-stock' : 'sell');
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        }).then(async res => {
            window.stockModal.hide();
            if (res.ok) {
                showToast(window.stockAction === 'add' ? 'Stock added successfully' : 'Book sold successfully');
                fetchBooks();
            } else {
                showToast(await res.text(), true);
            }
        });
    };
    // Book form submit logic
    const form = document.getElementById('book-form');
    form.onsubmit = function(e) {
        e.preventDefault();
        let valid = true;
        ['title','author','price','quantity'].forEach(id => {
            const input = document.getElementById(id);
            if (!input.value || (input.type === 'number' && input.value < 0)) {
                input.classList.add('is-invalid');
                valid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });
        if (!valid) return;
        const book = {
            title: document.getElementById('title').value,
            author: document.getElementById('author').value,
            price: parseFloat(document.getElementById('price').value),
            quantity: parseInt(document.getElementById('quantity').value)
        };
        if (window.editingId) {
            fetch(`${API_URL}/${window.editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(book)
            }).then(async res => {
                window._bookModal.hide();
                if (res.ok) {
                    showToast('Book updated successfully');
                    fetchBooks();
                } else {
                    showToast(await res.text(), true);
                }
            });
        } else {
            fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(book)
            }).then(async res => {
                window._bookModal.hide();
                if (res.ok) {
                    showToast('Book added successfully');
                    fetchBooks();
                } else {
                    showToast(await res.text(), true);
                }
            });
        }
    };
    // Add Book button logic
    const openModalBtn = document.getElementById('open-modal-btn');
    if (openModalBtn) {
        openModalBtn.onclick = () => {
            window.editingId = null;
            window.openModal(false);
        };
    }
    // Init rest
    initTheme();
    initSorting();
    initSearch();
    fetchBooks();
}); 