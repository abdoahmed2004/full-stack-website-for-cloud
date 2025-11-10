// API Configuration
const API_BASE_URL = '../backend';

// API endpoints
const API = {
    products: {
        list: (category = 'all') => `${API_BASE_URL}/products.php?action=list&category=${category}`,
        get: (id) => `${API_BASE_URL}/products.php?action=get&id=${id}`,
        search: (query) => `${API_BASE_URL}/products.php?action=search&q=${encodeURIComponent(query)}`,
        categories: () => `${API_BASE_URL}/products.php?action=categories`
    },
    cart: {
        get: () => `${API_BASE_URL}/cart.php?action=get`,
        add: () => `${API_BASE_URL}/cart.php?action=add`,
        update: () => `${API_BASE_URL}/cart.php?action=update`,
        remove: () => `${API_BASE_URL}/cart.php?action=remove`,
        clear: () => `${API_BASE_URL}/cart.php?action=clear`,
        validate: () => `${API_BASE_URL}/cart.php?action=validate`
    },
    checkout: () => `${API_BASE_URL}/checkout.php`
};

// Utility functions
const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
};

const showNotification = (message, type = 'success') => {
    // Simple alert for now - can be enhanced with a better UI
    alert(message);
};
