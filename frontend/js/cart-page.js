// Cart Page JavaScript
let cartData = null;

// Load cart
async function loadCart() {
    const cartSection = document.getElementById('cart-section');
    const emptyCart = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');
    
    cartSection.innerHTML = '<div class="loading">Loading cart...</div>';
    
    cartData = await cartManager.getCart();
    
    if (!cartData || !cartData.cart || cartData.cart.length === 0) {
        cartSection.style.display = 'none';
        emptyCart.style.display = 'block';
        cartContent.style.display = 'none';
        return;
    }
    
    cartSection.style.display = 'none';
    emptyCart.style.display = 'none';
    cartContent.style.display = 'block';
    
    displayCartItems(cartData.cart);
    updateCartSummary(cartData.subtotal);
}

// Display cart items
function displayCartItems(items) {
    const cartItems = document.getElementById('cart-items');
    
    cartItems.innerHTML = items.map(item => `
        <div class="cart-item" data-product-id="${item.product.id}">
            <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h3>${item.product.name}</h3>
                <p>${item.product.category}</p>
                <p>Price: ${formatPrice(item.product.price)}</p>
            </div>
            <div class="cart-item-quantity">
                <input type="number" 
                       value="${item.quantity}" 
                       min="1" 
                       max="${item.product.stock}"
                       onchange="updateItemQuantity(${item.product.id}, this.value)">
            </div>
            <div class="cart-item-price">
                <div class="price">${formatPrice(item.itemTotal)}</div>
                <button class="cart-item-remove" onclick="removeItem(${item.product.id})">Remove</button>
            </div>
        </div>
    `).join('');
}

// Update cart summary
function updateCartSummary(subtotal) {
    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const shipping = subtotal >= 100 ? 0 : 10;
    const total = subtotal + tax + shipping;
    
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('tax').textContent = formatPrice(tax);
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
    document.getElementById('total').textContent = formatPrice(total);
}

// Update item quantity
async function updateItemQuantity(productId, quantity) {
    quantity = parseInt(quantity);
    
    if (quantity < 1) {
        removeItem(productId);
        return;
    }
    
    const success = await cartManager.updateQuantity(productId, quantity);
    if (success) {
        await loadCart();
    }
}

// Remove item from cart
async function removeItem(productId) {
    if (!confirm('Are you sure you want to remove this item?')) {
        return;
    }
    
    const success = await cartManager.removeFromCart(productId);
    if (success) {
        await loadCart();
    }
}

// Clear cart
async function clearCartHandler() {
    if (!confirm('Are you sure you want to clear your cart?')) {
        return;
    }
    
    const success = await cartManager.clearCart();
    if (success) {
        await loadCart();
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCartHandler);
    }
});
