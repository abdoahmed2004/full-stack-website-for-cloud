<?php
// Start session for cart management
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// CORS headers for API access
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Product catalog - in-memory data
$GLOBALS['products'] = [
    [
        'id' => 1,
        'name' => 'Wireless Headphones',
        'category' => 'Electronics',
        'price' => 79.99,
        'description' => 'High-quality wireless headphones with noise cancellation',
        'image' => 'https://via.placeholder.com/300x300/4A90E2/fff?text=Headphones',
        'stock' => 15
    ],
    [
        'id' => 2,
        'name' => 'Smart Watch',
        'category' => 'Electronics',
        'price' => 199.99,
        'description' => 'Feature-rich smartwatch with fitness tracking',
        'image' => 'https://via.placeholder.com/300x300/50C878/fff?text=Watch',
        'stock' => 10
    ],
    [
        'id' => 3,
        'name' => 'Laptop Backpack',
        'category' => 'Accessories',
        'price' => 49.99,
        'description' => 'Durable backpack with laptop compartment',
        'image' => 'https://via.placeholder.com/300x300/FF6B6B/fff?text=Backpack',
        'stock' => 25
    ],
    [
        'id' => 4,
        'name' => 'USB-C Hub',
        'category' => 'Accessories',
        'price' => 34.99,
        'description' => 'Multi-port USB-C hub with HDMI and USB 3.0',
        'image' => 'https://via.placeholder.com/300x300/FFA500/fff?text=USB+Hub',
        'stock' => 30
    ],
    [
        'id' => 5,
        'name' => 'Wireless Mouse',
        'category' => 'Electronics',
        'price' => 29.99,
        'description' => 'Ergonomic wireless mouse with precision tracking',
        'image' => 'https://via.placeholder.com/300x300/9370DB/fff?text=Mouse',
        'stock' => 20
    ],
    [
        'id' => 6,
        'name' => 'Mechanical Keyboard',
        'category' => 'Electronics',
        'price' => 89.99,
        'description' => 'RGB mechanical keyboard with blue switches',
        'image' => 'https://via.placeholder.com/300x300/20B2AA/fff?text=Keyboard',
        'stock' => 12
    ],
    [
        'id' => 7,
        'name' => 'Phone Stand',
        'category' => 'Accessories',
        'price' => 15.99,
        'description' => 'Adjustable phone stand for desk',
        'image' => 'https://via.placeholder.com/300x300/FFD700/fff?text=Stand',
        'stock' => 40
    ],
    [
        'id' => 8,
        'name' => 'Bluetooth Speaker',
        'category' => 'Electronics',
        'price' => 59.99,
        'description' => 'Portable Bluetooth speaker with deep bass',
        'image' => 'https://via.placeholder.com/300x300/FF69B4/fff?text=Speaker',
        'stock' => 18
    ],
    [
        'id' => 9,
        'name' => 'Webcam HD',
        'category' => 'Electronics',
        'price' => 69.99,
        'description' => '1080p HD webcam with auto-focus',
        'image' => 'https://via.placeholder.com/300x300/8A2BE2/fff?text=Webcam',
        'stock' => 8
    ],
    [
        'id' => 10,
        'name' => 'Cable Organizer',
        'category' => 'Accessories',
        'price' => 12.99,
        'description' => 'Keep your cables neat and organized',
        'image' => 'https://via.placeholder.com/300x300/32CD32/fff?text=Organizer',
        'stock' => 50
    ]
];

// Discount codes - in-memory data
$GLOBALS['discount_codes'] = [
    'SAVE10' => ['type' => 'percentage', 'value' => 10],
    'SAVE20' => ['type' => 'percentage', 'value' => 20],
    'FLAT15' => ['type' => 'fixed', 'value' => 15],
    'WELCOME' => ['type' => 'percentage', 'value' => 5]
];

// Helper function to get product by ID
function getProductById($id) {
    foreach ($GLOBALS['products'] as $product) {
        if ($product['id'] == $id) {
            return $product;
        }
    }
    return null;
}

// Helper function to validate discount code
function validateDiscountCode($code) {
    $code = strtoupper(trim($code));
    if (isset($GLOBALS['discount_codes'][$code])) {
        return $GLOBALS['discount_codes'][$code];
    }
    return null;
}

// Helper function to calculate discount
function calculateDiscount($subtotal, $discount) {
    if ($discount['type'] === 'percentage') {
        return $subtotal * ($discount['value'] / 100);
    } else if ($discount['type'] === 'fixed') {
        return min($discount['value'], $subtotal);
    }
    return 0;
}
?>
