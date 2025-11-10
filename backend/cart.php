<?php
require_once 'config.php';

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Initialize cart in session if not exists
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// Route requests
switch ($action) {
    case 'get':
        handleGetCart();
        break;
    case 'add':
        handleAddToCart();
        break;
    case 'update':
        handleUpdateCart();
        break;
    case 'remove':
        handleRemoveFromCart();
        break;
    case 'clear':
        handleClearCart();
        break;
    case 'validate':
        handleValidateCart();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
}

// Get current cart
function handleGetCart() {
    $cart = $_SESSION['cart'];
    $cartDetails = [];
    $subtotal = 0;
    
    foreach ($cart as $productId => $quantity) {
        $product = getProductById($productId);
        if ($product) {
            $itemTotal = $product['price'] * $quantity;
            $cartDetails[] = [
                'product' => $product,
                'quantity' => $quantity,
                'itemTotal' => $itemTotal
            ];
            $subtotal += $itemTotal;
        }
    }
    
    echo json_encode([
        'success' => true,
        'cart' => $cartDetails,
        'subtotal' => $subtotal,
        'itemCount' => array_sum($cart)
    ]);
}

// Add item to cart
function handleAddToCart() {
    global $method;
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $productId = isset($data['productId']) ? intval($data['productId']) : 0;
    $quantity = isset($data['quantity']) ? intval($data['quantity']) : 1;
    
    if ($productId <= 0 || $quantity <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid product ID or quantity']);
        return;
    }
    
    $product = getProductById($productId);
    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        return;
    }
    
    // Check stock availability
    $currentQuantity = isset($_SESSION['cart'][$productId]) ? $_SESSION['cart'][$productId] : 0;
    $newQuantity = $currentQuantity + $quantity;
    
    if ($newQuantity > $product['stock']) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Insufficient stock',
            'available' => $product['stock'],
            'requested' => $newQuantity
        ]);
        return;
    }
    
    $_SESSION['cart'][$productId] = $newQuantity;
    
    echo json_encode([
        'success' => true,
        'message' => 'Product added to cart',
        'cart' => $_SESSION['cart']
    ]);
}

// Update cart item quantity
function handleUpdateCart() {
    global $method;
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $productId = isset($data['productId']) ? intval($data['productId']) : 0;
    $quantity = isset($data['quantity']) ? intval($data['quantity']) : 0;
    
    if ($productId <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid product ID']);
        return;
    }
    
    if ($quantity <= 0) {
        // Remove item if quantity is 0 or negative
        unset($_SESSION['cart'][$productId]);
    } else {
        $product = getProductById($productId);
        if (!$product) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            return;
        }
        
        if ($quantity > $product['stock']) {
            http_response_code(400);
            echo json_encode([
                'error' => 'Insufficient stock',
                'available' => $product['stock']
            ]);
            return;
        }
        
        $_SESSION['cart'][$productId] = $quantity;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Cart updated',
        'cart' => $_SESSION['cart']
    ]);
}

// Remove item from cart
function handleRemoveFromCart() {
    global $method;
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    $productId = isset($data['productId']) ? intval($data['productId']) : 0;
    
    if ($productId <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid product ID']);
        return;
    }
    
    unset($_SESSION['cart'][$productId]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Product removed from cart',
        'cart' => $_SESSION['cart']
    ]);
}

// Clear entire cart
function handleClearCart() {
    global $method;
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }
    
    $_SESSION['cart'] = [];
    
    echo json_encode([
        'success' => true,
        'message' => 'Cart cleared'
    ]);
}

// Validate cart before checkout
function handleValidateCart() {
    $cart = $_SESSION['cart'];
    $errors = [];
    
    foreach ($cart as $productId => $quantity) {
        $product = getProductById($productId);
        if (!$product) {
            $errors[] = "Product with ID $productId not found";
        } else if ($quantity > $product['stock']) {
            $errors[] = "{$product['name']}: Only {$product['stock']} available, but {$quantity} requested";
        }
    }
    
    if (empty($errors)) {
        echo json_encode([
            'success' => true,
            'valid' => true,
            'message' => 'Cart is valid'
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'valid' => false,
            'errors' => $errors
        ]);
    }
}
?>
