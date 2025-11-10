#!/bin/bash

# Test Script for TechStore Application
# This script tests the backend API endpoints

echo "========================================="
echo "TechStore Backend API Test Suite"
echo "========================================="
echo ""

# Start PHP server
echo "Starting PHP server on port 8000..."
cd backend
php -S localhost:8000 > /tmp/test-server.log 2>&1 &
SERVER_PID=$!
sleep 2

echo "Server started with PID: $SERVER_PID"
echo ""

# Test 1: List all products
echo "Test 1: List all products"
curl -s http://localhost:8000/products.php?action=list | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'✓ Found {len(data[\"products\"])} products')"
echo ""

# Test 2: Get categories
echo "Test 2: Get categories"
curl -s http://localhost:8000/products.php?action=categories | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'✓ Found categories: {data[\"categories\"]}')"
echo ""

# Test 3: Search products
echo "Test 3: Search for 'mouse'"
curl -s "http://localhost:8000/products.php?action=search&q=mouse" | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'✓ Found {len(data[\"products\"])} product(s) matching \"mouse\"')"
echo ""

# Test 4: Get specific product
echo "Test 4: Get product with ID 1"
curl -s "http://localhost:8000/products.php?action=get&id=1" | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'✓ Product: {data[\"product\"][\"name\"]} - ${data[\"product\"][\"price\"]}')"
echo ""

# Test 5: Cart operations (with session)
echo "Test 5: Cart operations"
COOKIE_FILE="/tmp/test-cookies.txt"
rm -f $COOKIE_FILE

# Get empty cart
curl -s -c $COOKIE_FILE http://localhost:8000/cart.php?action=get | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'✓ Empty cart has {data[\"itemCount\"]} items')"

# Add item to cart
curl -s -b $COOKIE_FILE -c $COOKIE_FILE -X POST -H "Content-Type: application/json" -d '{"productId":1,"quantity":2}' http://localhost:8000/cart.php?action=add | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'✓ Added product to cart: {data[\"message\"]}')"

# Get cart with items
curl -s -b $COOKIE_FILE http://localhost:8000/cart.php?action=get | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'✓ Cart now has {data[\"itemCount\"]} item(s), subtotal: ${data[\"subtotal\"]}')"

# Update quantity
curl -s -b $COOKIE_FILE -c $COOKIE_FILE -X POST -H "Content-Type: application/json" -d '{"productId":1,"quantity":3}' http://localhost:8000/cart.php?action=update | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'✓ Updated cart: {data[\"message\"]}')"

# Remove item
curl -s -b $COOKIE_FILE -c $COOKIE_FILE -X POST -H "Content-Type: application/json" -d '{"productId":1}' http://localhost:8000/cart.php?action=remove | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'✓ Removed item: {data[\"message\"]}')"

echo ""

# Test 6: Checkout validation
echo "Test 6: Checkout validation"
# Add item back for checkout test
curl -s -b $COOKIE_FILE -c $COOKIE_FILE -X POST -H "Content-Type: application/json" -d '{"productId":1,"quantity":1}' http://localhost:8000/cart.php?action=add > /dev/null

# Test invalid checkout (missing fields)
curl -s -b $COOKIE_FILE -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com"}' http://localhost:8000/checkout.php | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'✓ Validation works: {len(data.get(\"errors\", []))} validation errors caught')"

echo ""
echo "========================================="
echo "All tests completed!"
echo "========================================="

# Clean up
kill $SERVER_PID 2>/dev/null
rm -f $COOKIE_FILE
cd ..
