<?php
require_once 'config.php';

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Route requests
switch ($action) {
    case 'list':
        handleListProducts();
        break;
    case 'get':
        handleGetProduct();
        break;
    case 'search':
        handleSearchProducts();
        break;
    case 'categories':
        handleGetCategories();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
}

// List all products with optional filtering
function handleListProducts() {
    $category = isset($_GET['category']) ? $_GET['category'] : '';
    $products = $GLOBALS['products'];
    
    // Filter by category if provided
    if ($category && $category !== 'all') {
        $products = array_filter($products, function($product) use ($category) {
            return $product['category'] === $category;
        });
    }
    
    echo json_encode([
        'success' => true,
        'products' => array_values($products)
    ]);
}

// Get a single product by ID
function handleGetProduct() {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid product ID']);
        return;
    }
    
    $product = getProductById($id);
    
    if ($product) {
        echo json_encode([
            'success' => true,
            'product' => $product
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
    }
}

// Search products by name or description
function handleSearchProducts() {
    $query = isset($_GET['q']) ? strtolower(trim($_GET['q'])) : '';
    
    if (empty($query)) {
        echo json_encode([
            'success' => true,
            'products' => []
        ]);
        return;
    }
    
    $results = array_filter($GLOBALS['products'], function($product) use ($query) {
        return strpos(strtolower($product['name']), $query) !== false ||
               strpos(strtolower($product['description']), $query) !== false;
    });
    
    echo json_encode([
        'success' => true,
        'products' => array_values($results)
    ]);
}

// Get all available categories
function handleGetCategories() {
    $categories = array_unique(array_map(function($product) {
        return $product['category'];
    }, $GLOBALS['products']));
    
    echo json_encode([
        'success' => true,
        'categories' => array_values($categories)
    ]);
}
?>
