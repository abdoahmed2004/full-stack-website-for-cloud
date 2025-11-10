// Cart Management - Syncs with backend session
class CartManager {
    constructor() {
        this.cartCount = 0;
        this.updateCartCount();
    }

    async updateCartCount() {
        try {
            const response = await fetch(API.cart.get());
            const data = await response.json();
            
            if (data.success) {
                this.cartCount = data.itemCount || 0;
                this.updateCartBadge();
            }
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }

    updateCartBadge() {
        const badges = document.querySelectorAll('#cart-count');
        badges.forEach(badge => {
            badge.textContent = this.cartCount;
        });
    }

    async addToCart(productId, quantity = 1) {
        try {
            const response = await fetch(API.cart.add(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity })
            });

            const data = await response.json();

            if (data.success) {
                await this.updateCartCount();
                showNotification('Product added to cart!', 'success');
                return true;
            } else {
                showNotification(data.error || 'Failed to add to cart', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Failed to add to cart', 'error');
            return false;
        }
    }

    async updateQuantity(productId, quantity) {
        try {
            const response = await fetch(API.cart.update(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId, quantity })
            });

            const data = await response.json();

            if (data.success) {
                await this.updateCartCount();
                return true;
            } else {
                showNotification(data.error || 'Failed to update cart', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            showNotification('Failed to update cart', 'error');
            return false;
        }
    }

    async removeFromCart(productId) {
        try {
            const response = await fetch(API.cart.remove(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ productId })
            });

            const data = await response.json();

            if (data.success) {
                await this.updateCartCount();
                showNotification('Product removed from cart', 'success');
                return true;
            } else {
                showNotification(data.error || 'Failed to remove from cart', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            showNotification('Failed to remove from cart', 'error');
            return false;
        }
    }

    async clearCart() {
        try {
            const response = await fetch(API.cart.clear(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                await this.updateCartCount();
                showNotification('Cart cleared', 'success');
                return true;
            } else {
                showNotification(data.error || 'Failed to clear cart', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            showNotification('Failed to clear cart', 'error');
            return false;
        }
    }

    async getCart() {
        try {
            const response = await fetch(API.cart.get());
            const data = await response.json();
            
            if (data.success) {
                return data;
            } else {
                console.error('Failed to get cart:', data.error);
                return null;
            }
        } catch (error) {
            console.error('Error getting cart:', error);
            return null;
        }
    }
}

// Initialize global cart manager
const cartManager = new CartManager();
