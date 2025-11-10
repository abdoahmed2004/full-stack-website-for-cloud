<?php
require_once 'config.php';

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode', 'country'];
$errors = [];

foreach ($required as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        $errors[] = ucfirst($field) . ' is required';
    }
}

// Email validation
if (isset($data['email']) && !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email format';
}

// Phone validation (basic)
if (isset($data['phone']) && !preg_match('/^[\d\s\-\+\(\)]{10,}$/', $data['phone'])) {
    $errors[] = 'Invalid phone number';
}

// Zip code validation (basic)
if (isset($data['zipCode']) && !preg_match('/^[\d\-\s]{3,}$/', $data['zipCode'])) {
    $errors[] = 'Invalid zip code';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'errors' => $errors
    ]);
    exit;
}

// Get cart data
if (!isset($_SESSION['cart']) || empty($_SESSION['cart'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Cart is empty'
    ]);
    exit;
}

// Calculate order totals
$cart = $_SESSION['cart'];
$subtotal = 0;
$orderItems = [];

foreach ($cart as $productId => $quantity) {
    $product = getProductById($productId);
    if (!$product) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => "Product with ID $productId not found"
        ]);
        exit;
    }
    
    // Check stock
    if ($quantity > $product['stock']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => "Insufficient stock for {$product['name']}"
        ]);
        exit;
    }
    
    $itemTotal = $product['price'] * $quantity;
    $subtotal += $itemTotal;
    
    $orderItems[] = [
        'productId' => $productId,
        'name' => $product['name'],
        'price' => $product['price'],
        'quantity' => $quantity,
        'total' => $itemTotal
    ];
}

// Apply discount if provided
$discount = 0;
$discountCode = isset($data['discountCode']) ? trim($data['discountCode']) : '';

if (!empty($discountCode)) {
    $discountInfo = validateDiscountCode($discountCode);
    if ($discountInfo) {
        $discount = calculateDiscount($subtotal, $discountInfo);
    }
}

// Calculate tax (8% as example)
$taxRate = 0.08;
$tax = ($subtotal - $discount) * $taxRate;

// Calculate shipping (free over $100, otherwise $10)
$shipping = ($subtotal - $discount) >= 100 ? 0 : 10;

// Calculate total
$total = $subtotal - $discount + $tax + $shipping;

// Generate order ID
$orderId = 'ORD-' . date('YmdHis') . '-' . rand(1000, 9999);

// Store order in session (simulating order storage)
if (!isset($_SESSION['orders'])) {
    $_SESSION['orders'] = [];
}

$order = [
    'orderId' => $orderId,
    'date' => date('Y-m-d H:i:s'),
    'customer' => [
        'firstName' => $data['firstName'],
        'lastName' => $data['lastName'],
        'email' => $data['email'],
        'phone' => $data['phone'],
        'address' => $data['address'],
        'city' => $data['city'],
        'state' => isset($data['state']) ? $data['state'] : '',
        'zipCode' => $data['zipCode'],
        'country' => $data['country']
    ],
    'items' => $orderItems,
    'subtotal' => $subtotal,
    'discount' => $discount,
    'discountCode' => $discountCode,
    'tax' => $tax,
    'shipping' => $shipping,
    'total' => $total,
    'status' => 'pending'
];

$_SESSION['orders'][$orderId] = $order;

// Clear the cart after successful order
$_SESSION['cart'] = [];

// Return order confirmation
echo json_encode([
    'success' => true,
    'message' => 'Order placed successfully',
    'order' => $order
]);
?>
