// Product Details Page JavaScript
let currentProduct = null;

// Get product ID from URL
function getProductIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load product details
async function loadProductDetails() {
    const productId = getProductIdFromUrl();
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    const detailsContainer = document.getElementById('product-details');
    detailsContainer.innerHTML = '<div class="loading">Loading product details...</div>';
    
    try {
        const response = await fetch(API.products.get(productId));
        const data = await response.json();
        
        if (data.success) {
            currentProduct = data.product;
            displayProductDetails(data.product);
        } else {
            detailsContainer.innerHTML = '<p>Product not found</p>';
        }
    } catch (error) {
        console.error('Error loading product details:', error);
        detailsContainer.innerHTML = '<p>Error loading product details</p>';
    }
}

// Display product details
function displayProductDetails(product) {
    const detailsContainer = document.getElementById('product-details');
    
    detailsContainer.innerHTML = `
        <div class="product-detail-container">
            <div>
                <img src="${product.image}" alt="${product.name}" class="product-detail-image">
            </div>
            <div class="product-detail-info">
                <h1>${product.name}</h1>
                <div class="product-detail-category">${product.category}</div>
                <div class="product-detail-price">${formatPrice(product.price)}</div>
                <p class="product-detail-description">${product.description}</p>
                <div class="product-detail-stock">
                    ${product.stock > 0 ? 
                        `<span style="color: #27ae60;">✓ In Stock (${product.stock} available)</span>` : 
                        '<span style="color: #e74c3c;">Out of Stock</span>'
                    }
                </div>
                ${product.stock > 0 ? `
                    <div class="quantity-selector">
                        <label for="quantity">Quantity:</label>
                        <input type="number" id="quantity" min="1" max="${product.stock}" value="1">
                    </div>
                    <button onclick="addToCartHandler()" class="btn btn-primary">Add to Cart</button>
                    <button onclick="window.location.href='index.html'" class="btn btn-secondary" style="margin-left: 1rem;">Back to Products</button>
                ` : `
                    <button onclick="window.location.href='index.html'" class="btn btn-secondary">Back to Products</button>
                `}
            </div>
        </div>
    `;
}

// Add to cart handler
async function addToCartHandler() {
    if (!currentProduct) return;
    
    const quantityInput = document.getElementById('quantity');
    const quantity = parseInt(quantityInput.value);
    
    if (quantity < 1 || quantity > currentProduct.stock) {
        showNotification(`Please enter a valid quantity (1-${currentProduct.stock})`, 'error');
        return;
    }
    
    const success = await cartManager.addToCart(currentProduct.id, quantity);
    
    if (success) {
        // Optionally redirect to cart or stay on page
        const goToCart = confirm('Product added to cart! Would you like to view your cart?');
        if (goToCart) {
            window.location.href = 'cart.html';
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
});
