// Products Page JavaScript
let currentCategory = 'all';
let allProducts = [];

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(API.products.categories());
        const data = await response.json();
        
        if (data.success) {
            const categoryFilter = document.getElementById('category-filter');
            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load products
async function loadProducts(category = 'all') {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '<div class="loading">Loading products...</div>';
    
    try {
        const response = await fetch(API.products.list(category));
        const data = await response.json();
        
        if (data.success) {
            allProducts = data.products;
            displayProducts(data.products);
        } else {
            productsGrid.innerHTML = '<p>Failed to load products</p>';
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<p>Error loading products</p>';
    }
}

// Display products
function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p>No products found</p>';
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" onclick="viewProduct(${product.id})">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    <span class="product-stock">${product.stock} in stock</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Search products
async function searchProducts(query) {
    if (!query.trim()) {
        loadProducts(currentCategory);
        return;
    }
    
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '<div class="loading">Searching...</div>';
    
    try {
        const response = await fetch(API.products.search(query));
        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.products);
        } else {
            productsGrid.innerHTML = '<p>Failed to search products</p>';
        }
    } catch (error) {
        console.error('Error searching products:', error);
        productsGrid.innerHTML = '<p>Error searching products</p>';
    }
}

// View product details
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadCategories();
    loadProducts();
    
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            loadProducts(currentCategory);
        });
    }
    
    // Search
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            searchProducts(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchProducts(searchInput.value);
            }
        });
    }
});
