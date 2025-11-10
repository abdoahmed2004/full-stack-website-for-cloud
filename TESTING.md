# Local Testing Guide

This guide will help you test the TechStore application locally before deploying to AWS.

## Prerequisites

- PHP 7.4 or higher
- Python 3 (for serving frontend) OR Node.js
- A web browser

## Step 1: Start the Backend Server

Open a terminal and navigate to the backend directory:

```bash
cd backend
php -S localhost:8000
```

This will start the PHP development server on port 8000. You should see output like:
```
[Sat Jan 10 19:00:00 2025] PHP 7.4.x Development Server (http://localhost:8000) started
```

Keep this terminal open.

## Step 2: Configure Frontend

In a new terminal, update the frontend API configuration:

```bash
# Edit frontend/js/config.js
# Change API_BASE_URL to:
const API_BASE_URL = 'http://localhost:8000';
```

## Step 3: Start the Frontend Server

### Option A: Using Python

```bash
cd frontend
python3 -m http.server 3000
```

### Option B: Using Node.js

```bash
cd frontend
npx http-server -p 3000
```

## Step 4: Open in Browser

Navigate to: `http://localhost:3000`

## Testing Checklist

### Home/Products Page
- [ ] Products load and display correctly
- [ ] Search functionality works (try searching "mouse" or "keyboard")
- [ ] Category filter works (try "Electronics" or "Accessories")
- [ ] Click on a product to view details

### Product Details Page
- [ ] Product information displays correctly
- [ ] Quantity selector works
- [ ] "Add to Cart" button works
- [ ] Cart count updates in navigation
- [ ] Back to Products button works

### Shopping Cart Page
- [ ] Added items appear in cart
- [ ] Can update quantities
- [ ] Can remove items
- [ ] Subtotal calculates correctly
- [ ] Tax calculation (8%) is correct
- [ ] Shipping is $10 (or FREE if subtotal >= $100)
- [ ] Total is calculated correctly

### Checkout Page
- [ ] Order summary displays cart items
- [ ] Form validation works (try submitting empty form)
- [ ] Email validation works (try invalid email)
- [ ] Phone validation works
- [ ] Discount codes work:
  - `SAVE10` - 10% off
  - `SAVE20` - 20% off
  - `FLAT15` - $15 off
  - `WELCOME` - 5% off
- [ ] Order can be placed successfully
- [ ] Success modal displays order details
- [ ] Cart is cleared after successful order

## Test Data

### Sample Products
The system includes 10 products:
1. Wireless Headphones ($79.99)
2. Smart Watch ($199.99)
3. Laptop Backpack ($49.99)
4. USB-C Hub ($34.99)
5. Wireless Mouse ($29.99)
6. Mechanical Keyboard ($89.99)
7. Phone Stand ($15.99)
8. Bluetooth Speaker ($59.99)
9. Webcam HD ($69.99)
10. Cable Organizer ($12.99)

### Discount Codes
- `SAVE10` - 10% discount
- `SAVE20` - 20% discount
- `FLAT15` - $15 flat discount
- `WELCOME` - 5% discount

### Test Scenarios

#### Scenario 1: Simple Purchase
1. Add Wireless Mouse ($29.99) to cart
2. Go to cart
3. Proceed to checkout
4. Fill in form and submit
5. Verify: Subtotal: $29.99, Tax: $2.40, Shipping: $10.00, Total: $42.39

#### Scenario 2: Free Shipping
1. Add Smart Watch ($199.99) to cart
2. Go to checkout
3. Verify: Shipping is FREE (subtotal > $100)

#### Scenario 3: Discount Code
1. Add Laptop Backpack ($49.99) to cart
2. Go to checkout
3. Apply discount code "SAVE10"
4. Verify: Discount of $5.00 is applied

#### Scenario 4: Stock Validation
1. Try to add more than available stock
2. Verify error message appears

## Backend API Testing

You can also test the API directly using curl:

```bash
# List all products
curl http://localhost:8000/products.php?action=list

# Get product by ID
curl http://localhost:8000/products.php?action=get&id=1

# Search products
curl "http://localhost:8000/products.php?action=search&q=mouse"

# Get categories
curl http://localhost:8000/products.php?action=categories

# Get cart (with session)
curl -c cookies.txt http://localhost:8000/cart.php?action=get

# Add to cart (with session)
curl -b cookies.txt -c cookies.txt -X POST -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}' \
  http://localhost:8000/cart.php?action=add
```

## Browser Developer Tools

### Console
Open browser console (F12) to see:
- API request/response logs
- Any JavaScript errors
- Network requests

### Network Tab
Check the Network tab to see:
- API calls being made
- Response status codes
- Request/response data

### Application Tab
Check the Application tab to see:
- Session cookies
- localStorage data (if any)

## Common Issues

### CORS Errors
If you see CORS errors in the browser console:
- Make sure you're accessing the frontend through the HTTP server (not file://)
- Check that the backend is running
- Verify API_BASE_URL in config.js is correct

### Session Issues
If cart items don't persist:
- Make sure cookies are enabled
- Check that you're using the same browser for all requests
- PHP sessions should work automatically with the built-in server

### Port Already in Use
If port 8000 or 3000 is already in use:
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill
lsof -ti:3000 | xargs kill
```

## Performance Testing

### Load Testing
To test with multiple products in cart:
1. Add 5+ different products
2. Verify cart calculations are correct
3. Test checkout with full cart

### Search Performance
1. Search for common terms
2. Search for partial matches
3. Search for non-existent items

## Next Steps

Once local testing is complete:
1. Review the code for any bugs or issues
2. Update frontend/js/config.js with your AWS EC2 IP
3. Follow DEPLOYMENT.md for AWS deployment
4. Test again after deployment

## Troubleshooting

If something doesn't work:
1. Check browser console for errors
2. Check PHP server output for errors
3. Verify all files are in correct locations
4. Clear browser cache and cookies
5. Restart both servers

## Success Criteria

The application is ready for deployment when:
- ✓ All pages load without errors
- ✓ Products display correctly
- ✓ Search and filtering work
- ✓ Cart operations work (add/update/remove)
- ✓ Checkout process completes successfully
- ✓ Discount codes apply correctly
- ✓ Form validation works
- ✓ No console errors
- ✓ Session persists across pages
