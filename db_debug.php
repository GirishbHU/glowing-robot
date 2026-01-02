<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- Debugging Database Configuration ---\n";
$config = config('database.connections.pgsql');
echo "Host: " . $config['host'] . "\n";
echo "Port: " . $config['port'] . "\n";
echo "Database: " . $config['database'] . "\n";
echo "Username: " . $config['username'] . "\n";
echo "Password: " . ($config['password'] === '' ? '(empty string)' : ($config['password'] === null ? '(null)' : '"' . $config['password'] . '"')) . "\n";
echo "-------------------------------------\n";

echo "Attempting connection with configured settings...\n";
try {
    $dsn = "pgsql:host={$config['host']};port={$config['port']};dbname={$config['database']}";
    $pdo = new PDO($dsn, $config['username'], $config['password']);
    echo "SUCCESS: Connected to database '{$config['database']}'!\n";
} catch (PDOException $e) {
    echo "FAILURE: " . $e->getMessage() . "\n";
}

if ($config['host'] === '127.0.0.1') {
    echo "\nAttempting connection with 'localhost' override...\n";
    try {
        $dsn = "pgsql:host=localhost;port={$config['port']};dbname={$config['database']}";
        $pdo = new PDO($dsn, $config['username'], $config['password']);
        echo "SUCCESS: Connected with localhost!\n";
    } catch (PDOException $e) {
        echo "FAILURE with localhost: " . $e->getMessage() . "\n";
    }
}
