// Checkout Page JavaScript
let checkoutCart = null;
let appliedDiscount = null;

// Load order summary
async function loadOrderSummary() {
    checkoutCart = await cartManager.getCart();
    
    if (!checkoutCart || !checkoutCart.cart || checkoutCart.cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'index.html';
        return;
    }
    
    displayOrderItems(checkoutCart.cart);
    updateOrderSummary();
}

// Display order items
function displayOrderItems(items) {
    const orderItems = document.getElementById('order-items');
    
    orderItems.innerHTML = items.map(item => `
        <div class="order-item">
            <div>
                <div class="order-item-name">${item.product.name}</div>
                <div class="order-item-quantity">Qty: ${item.quantity} × ${formatPrice(item.product.price)}</div>
            </div>
            <div>${formatPrice(item.itemTotal)}</div>
        </div>
    `).join('');
}

// Update order summary
function updateOrderSummary() {
    const subtotal = checkoutCart.subtotal;
    let discount = 0;
    
    if (appliedDiscount) {
        if (appliedDiscount.type === 'percentage') {
            discount = subtotal * (appliedDiscount.value / 100);
        } else if (appliedDiscount.type === 'fixed') {
            discount = Math.min(appliedDiscount.value, subtotal);
        }
    }
    
    const taxRate = 0.08;
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * taxRate;
    const shipping = afterDiscount >= 100 ? 0 : 10;
    const total = afterDiscount + tax + shipping;
    
    document.getElementById('summary-subtotal').textContent = formatPrice(subtotal);
    document.getElementById('summary-tax').textContent = formatPrice(tax);
    document.getElementById('summary-shipping').textContent = shipping === 0 ? 'FREE' : formatPrice(shipping);
    document.getElementById('summary-total').textContent = formatPrice(total);
    
    if (discount > 0) {
        document.getElementById('discount-row').style.display = 'flex';
        document.getElementById('summary-discount').textContent = '-' + formatPrice(discount);
    } else {
        document.getElementById('discount-row').style.display = 'none';
    }
}

// Apply discount code
async function applyDiscount() {
    const discountCodeInput = document.getElementById('discountCode');
    const discountMessage = document.querySelector('.discount-message');
    const code = discountCodeInput.value.trim();
    
    if (!code) {
        discountMessage.textContent = 'Please enter a discount code';
        discountMessage.className = 'discount-message error';
        return;
    }
    
    // Validate discount code with backend
    // For now, we'll use the common codes from config.php
    const validCodes = {
        'SAVE10': { type: 'percentage', value: 10 },
        'SAVE20': { type: 'percentage', value: 20 },
        'FLAT15': { type: 'fixed', value: 15 },
        'WELCOME': { type: 'percentage', value: 5 }
    };
    
    const upperCode = code.toUpperCase();
    if (validCodes[upperCode]) {
        appliedDiscount = validCodes[upperCode];
        discountMessage.textContent = `Discount applied: ${upperCode}`;
        discountMessage.className = 'discount-message success';
        updateOrderSummary();
    } else {
        discountMessage.textContent = 'Invalid discount code';
        discountMessage.className = 'discount-message error';
        appliedDiscount = null;
        updateOrderSummary();
    }
}

// Validate form
function validateForm() {
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    const errors = [];
    
    // Required fields
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode', 'country'];
    required.forEach(field => {
        const value = formData.get(field);
        if (!value || !value.trim()) {
            errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
    });
    
    // Email validation
    const email = formData.get('email');
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.push('Invalid email format');
    }
    
    // Phone validation
    const phone = formData.get('phone');
    if (phone && !phone.match(/^[\d\s\-\+\(\)]{10,}$/)) {
        errors.push('Invalid phone number');
    }
    
    return errors;
}

// Handle form submission
async function handleCheckout(e) {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    const formErrors = document.getElementById('form-errors');
    
    if (errors.length > 0) {
        formErrors.innerHTML = '<ul>' + errors.map(err => `<li>${err}</li>`).join('') + '</ul>';
        formErrors.style.display = 'block';
        return;
    }
    
    formErrors.style.display = 'none';
    
    // Gather form data
    const form = document.getElementById('checkout-form');
    const formData = new FormData(form);
    
    const orderData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        country: formData.get('country'),
        discountCode: formData.get('discountCode')
    };
    
    // Submit order
    try {
        const response = await fetch(API.checkout(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success modal
            showOrderSuccess(data.order);
        } else {
            if (data.errors) {
                formErrors.innerHTML = '<ul>' + data.errors.map(err => `<li>${err}</li>`).join('') + '</ul>';
            } else {
                formErrors.innerHTML = data.error || 'Failed to place order';
            }
            formErrors.style.display = 'block';
        }
    } catch (error) {
        console.error('Error placing order:', error);
        formErrors.innerHTML = 'An error occurred while placing your order. Please try again.';
        formErrors.style.display = 'block';
    }
}

// Show order success modal
function showOrderSuccess(order) {
    const modal = document.getElementById('success-modal');
    const orderDetails = document.getElementById('order-details');
    
    orderDetails.innerHTML = `
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
        <p><strong>Total:</strong> ${formatPrice(order.total)}</p>
        <p><strong>Email:</strong> ${order.customer.email}</p>
    `;
    
    modal.style.display = 'flex';
    
    // Update cart count
    cartManager.updateCartCount();
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadOrderSummary();
    
    // Discount code
    const applyDiscountBtn = document.getElementById('apply-discount-btn');
    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', applyDiscount);
    }
    
    // Form submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
});
