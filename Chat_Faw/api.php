<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Load .env configuration if exists, otherwise use defaults
$env_file = __DIR__ . '/.env';
$db_host = 'localhost';
$db_user = 'root';
$db_pass = '';
$db_name = 'faw';

if (file_exists($env_file)) {
    $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') && !str_starts_with($line, '#')) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            if ($key === 'DB_HOST') $db_host = $value;
            if ($key === 'DB_USER') $db_user = $value;
            if ($key === 'DB_PASS') $db_pass = $value;
            if ($key === 'DB_NAME') $db_name = $value;
        }
    }
}

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
$action = $_REQUEST['action'] ?? '';

// 🔥 Auto-clean old requests (12 hours)
$conn->query("
    DELETE FROM requests
    WHERE created_at < NOW() - INTERVAL 12 HOUR
");

/* =========================
   CREATE REQUEST
========================= */
if ($action === 'create_request') {
    $desc = $_POST['description'] ?? '';
    
    if (!$desc || strlen(trim($desc)) === 0) {
        echo json_encode(['error' => 'Description cannot be empty']);
        exit;
    }
    
    $stmt = $conn->prepare("INSERT INTO requests (description) VALUES (?)");
    $stmt->bind_param("s", $desc);
    
    if ($stmt->execute()) {
        echo json_encode(['request_id' => $stmt->insert_id]);
    } else {
        echo json_encode(['error' => 'Failed to create request']);
    }
    $stmt->close();
    exit;
}

/* =========================
   GET REQUESTS (SELLER)
========================= */
if ($action === 'get_requests') {
    $res = $conn->query("
        SELECT id, description, created_at
        FROM requests
        ORDER BY created_at DESC
    ");
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
    exit;
}

/* =========================
   ADD OFFER
========================= */
if ($action === 'add_offer') {
    $request_id = isset($_POST['request_id']) ? (int)$_POST['request_id'] : 0;
    $seller_name = $_POST['seller_name'] ?? '';
    $food_name = $_POST['food_name'] ?? '';
    $price = isset($_POST['price']) ? (int)$_POST['price'] : 0;
    $contact = $_POST['contact'] ?? '';
    
    // Validate inputs
    if (!$request_id || !$seller_name || !$food_name || !$price || !$contact) {
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    
    $stmt = $conn->prepare("
        INSERT INTO offers (request_id, seller_name, food_name, price, contact)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("issis", $request_id, $seller_name, $food_name, $price, $contact);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'ok', 'offer_id' => $stmt->insert_id]);
    } else {
        echo json_encode(['error' => 'Failed to add offer']);
    }
    $stmt->close();
    exit;
}

/* =========================
   GET OFFERS (BUYER)
========================= */
if ($action === 'get_offers') {
    $id = (int) $_GET['request_id'];
    $res = $conn->query("SELECT * FROM offers WHERE request_id = $id");
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
    exit;
}


/* =========================
   GET HABITS (SELLER)
========================= */
if ($action === 'get_habits') {

    $res = $conn->query("
        SELECT avg_price, last_food, cheapest_count, total_orders
        FROM user_habits
        LIMIT 1
    ");

    if ($row = $res->fetch_assoc()) {
        echo json_encode($row);
    } else {
        echo json_encode(null);
    }
    exit;
}


/* =========================
   SAVE HABIT
========================= */
if ($action === 'save_habit') {

    $food  = $_POST['food_name'] ?? '';
    $price = isset($_POST['price']) ? (int)$_POST['price'] : 0;

    if (!$food || !$price) {
        echo json_encode(["error" => "Missing data"]);
        exit;
    }

    $res = $conn->query("SELECT * FROM user_habits LIMIT 1");

    if ($row = $res->fetch_assoc()) {
        $avg = $row['avg_price']
            ? round(($row['avg_price'] * 2 + $price) / 3)
            : $price;

        $stmt = $conn->prepare(
            "UPDATE user_habits SET avg_price=?, last_food=?"
        );
        $stmt->bind_param("is", $avg, $food);
        $stmt->execute();
    } else {
        $stmt = $conn->prepare(
            "INSERT INTO user_habits (avg_price, last_food)
             VALUES (?, ?)"
        );
        $stmt->bind_param("is", $price, $food);
        $stmt->execute();
    }

    echo json_encode(["success" => true]);
    exit;
}

/* =========================
   GET HABITS
========================= */
if ($action === 'save_habit') {

    $price = (int) ($_POST['price'] ?? 0);
    $food  = $_POST['food_name'] ?? '';
    $is_cheapest = (int) ($_POST['is_cheapest'] ?? 0);

    $res = $conn->query("SELECT * FROM user_habits LIMIT 1");

    if ($row = $res->fetch_assoc()) {

        $newAvg = round(($row['avg_price'] * $row['total_orders'] + $price)
                        / ($row['total_orders'] + 1));

        $stmt = $conn->prepare("
            UPDATE user_habits
            SET avg_price=?,
                last_food=?,
                cheapest_count = cheapest_count + ?,
                total_orders = total_orders + 1
        ");
        $stmt->bind_param("isii", $newAvg, $food, $is_cheapest);
        $stmt->execute();

    } else {
        $stmt = $conn->prepare("
            INSERT INTO user_habits
            (avg_price, last_food, cheapest_count, total_orders)
            VALUES (?, ?, ?, 1)
        ");
        $stmt->bind_param("isi", $price, $food, $is_cheapest);
        $stmt->execute();
    }

    echo json_encode(["success" => true]);
    exit;
}
