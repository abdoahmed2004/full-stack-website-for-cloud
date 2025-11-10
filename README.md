# TechStore - Full Stack E-Commerce Website

A complete e-commerce store website with a modern frontend (HTML/CSS/JavaScript) and PHP backend, designed for cloud deployment on AWS.

## 🌟 Features

### Frontend
- **Multi-page website** with responsive design
  - Home/Products page with product catalog
  - Product details page
  - Shopping cart page
  - Checkout page
- **Product browsing**
  - Category filtering
  - Search functionality
  - Product grid with images and details
- **Shopping cart**
  - Add/remove products
  - Update quantities
  - Real-time price calculations
  - Session-based persistence
- **Checkout process**
  - Form validation
  - Discount code application
  - Order summary
  - Tax and shipping calculations

### Backend (PHP)
- **Product Management API**
  - List all products
  - Get product by ID
  - Search products
  - Filter by category
- **Cart Management API**
  - Session-based cart storage
  - Add/remove/update items
  - Stock validation
  - Cart validation before checkout
- **Order Processing API**
  - Form validation
  - Discount code validation
  - Tax calculation (8%)
  - Shipping calculation (free over $100)
  - Order confirmation
- **Business Logic**
  - Stock management
  - Discount codes (percentage and fixed)
  - Price calculations
  - Order totals

## 📁 Project Structure

```
.
├── frontend/                 # Frontend static files
│   ├── css/
│   │   └── styles.css       # Main stylesheet
│   ├── js/
│   │   ├── config.js        # API configuration
│   │   ├── cart.js          # Cart management
│   │   ├── products.js      # Products page logic
│   │   ├── product-details.js
│   │   ├── cart-page.js     # Cart page logic
│   │   └── checkout.js      # Checkout logic
│   ├── index.html           # Home/Products page
│   ├── product.html         # Product details page
│   ├── cart.html            # Shopping cart page
│   └── checkout.html        # Checkout page
├── backend/                 # PHP backend
│   ├── config.php          # Configuration and data
│   ├── products.php        # Product API endpoints
│   ├── cart.php            # Cart API endpoints
│   └── checkout.php        # Checkout API endpoint
├── aws/                     # AWS deployment files
│   ├── deploy-backend.sh   # Backend deployment script
│   ├── deploy-frontend.sh  # Frontend deployment script
│   └── s3-bucket-policy.json
└── DEPLOYMENT.md           # Detailed deployment guide
```

## 🚀 Quick Start

### Local Development

1. **Setup PHP Backend**:
   ```bash
   # Start PHP built-in server
   cd backend
   php -S localhost:8000
   ```

2. **Update Frontend Configuration**:
   Edit `frontend/js/config.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:8000';
   ```

3. **Serve Frontend**:
   ```bash
   # Using Python
   cd frontend
   python3 -m http.server 3000
   
   # Or using Node.js
   npx http-server -p 3000
   ```

4. **Open Browser**:
   Navigate to `http://localhost:3000`

### Available Discount Codes

Test the checkout with these discount codes:
- `SAVE10` - 10% off
- `SAVE20` - 20% off
- `FLAT15` - $15 off
- `WELCOME` - 5% off

## ☁️ AWS Deployment

### Prerequisites
- AWS Account
- AWS CLI installed and configured
- SSH key pair for EC2
- Basic knowledge of AWS services

### Option 1: Quick Deployment (Using Scripts)

1. **Deploy Backend to EC2**:
   ```bash
   # Update variables in aws/deploy-backend.sh
   ./aws/deploy-backend.sh
   ```

2. **Update Frontend Config**:
   Edit `frontend/js/config.js` with your EC2 IP:
   ```javascript
   const API_BASE_URL = 'http://YOUR_EC2_IP/api';
   ```

3. **Deploy Frontend to S3**:
   ```bash
   # Update bucket name in aws/deploy-frontend.sh
   ./aws/deploy-frontend.sh
   ```

### Option 2: Manual Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step instructions.

### Architecture

```
┌─────────────┐         ┌──────────────┐
│   AWS S3    │         │   AWS EC2    │
│  (Frontend) │ ──────► │  (Backend)   │
│   Static    │   API   │     PHP      │
│   Website   │  Calls  │    Apache    │
└─────────────┘         └──────────────┘
      │
      ▼
┌─────────────┐
│  CloudFront │
│    (CDN)    │
│  Optional   │
└─────────────┘
```

## 🛠️ Technology Stack

### Frontend
- HTML5
- CSS3 (Responsive Design)
- Vanilla JavaScript (ES6+)
- Local Storage for cart synchronization

### Backend
- PHP 7.4+
- Session management
- JSON API responses
- RESTful architecture

### AWS Services
- **EC2**: PHP backend hosting
- **S3**: Static website hosting
- **CloudFront** (optional): CDN for better performance
- **CloudWatch**: Monitoring and logging

## 📊 API Endpoints

### Products API
```
GET  /products.php?action=list&category={category}
GET  /products.php?action=get&id={id}
GET  /products.php?action=search&q={query}
GET  /products.php?action=categories
```

### Cart API
```
GET   /cart.php?action=get
POST  /cart.php?action=add
POST  /cart.php?action=update
POST  /cart.php?action=remove
POST  /cart.php?action=clear
GET   /cart.php?action=validate
```

### Checkout API
```
POST /checkout.php
```

## 🔒 Security Features

- Input validation on all forms
- PHP session security
- CORS headers configuration
- XSS protection
- Stock validation
- Price calculations server-side
- Secure session management

## 📱 Responsive Design

The website is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🧪 Testing

### Test Product Catalog
The application includes 10 sample products across 2 categories:
- Electronics (7 products)
- Accessories (3 products)

### Test Cart Operations
1. Add products to cart
2. Update quantities
3. Remove items
4. Apply discount codes
5. Complete checkout

### Test Validation
- Form validation on checkout
- Email format validation
- Phone number validation
- Stock availability checks
- Discount code validation

## 🐛 Troubleshooting

### Backend Issues
- Check PHP version: `php -v`
- Verify session directory permissions
- Check Apache error logs
- Verify CORS headers

### Frontend Issues
- Check browser console for errors
- Verify API_BASE_URL in config.js
- Clear browser cache
- Check network tab for API responses

### Deployment Issues
See [DEPLOYMENT.md](DEPLOYMENT.md) troubleshooting section

## 📈 Future Enhancements

- User authentication
- Order history
- Product reviews
- Wishlist functionality
- Payment gateway integration
- Email notifications
- Admin panel
- Database integration

## 📄 License

This project is available for educational and commercial use.

## 👥 Contributing

Feel free to submit issues and enhancement requests!

## 📧 Support

For questions or issues, please open a GitHub issue.

---

**Note**: This application uses in-memory storage (PHP sessions and arrays) for data persistence. No database is required. Session data is stored on the server and will be lost when the server restarts.