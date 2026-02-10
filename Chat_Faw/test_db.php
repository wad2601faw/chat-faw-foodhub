<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Load .env if exists, fallback to defaults
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

// Attempt connection
$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);

if ($conn->connect_error) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => $conn->connect_error,
        'config' => [
            'host' => $db_host,
            'user' => $db_user,
            'database' => $db_name
        ]
    ]);
} else {
    echo json_encode([
        'status' => 'success',
        'message' => 'Connected to database successfully',
        'config' => [
            'host' => $db_host,
            'user' => $db_user,
            'database' => $db_name
        ]
    ]);
    $conn->close();
}
?>
