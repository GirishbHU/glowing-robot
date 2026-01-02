<?php

$host = '127.0.0.1';
$port = '5432';
$username = 'postgres';
$password = 'postgres'; // Trying 'postgres' first as per history
$targetDb = 'postgres';

function tryCreateDb($host, $port, $username, $password, $targetDb) {
    echo "Attempting to create database '$targetDb' connecting as '$username' with password '$password'...\n";
    try {
        // Connect to template1 which should always exist
        $dsn = "pgsql:host=$host;port=$port;dbname=template1";
        $pdo = new PDO($dsn, $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Check if db exists
        $stmt = $pdo->prepare("SELECT 1 FROM pg_database WHERE datname = ?");
        $stmt->execute([$targetDb]);
        if ($stmt->fetch()) {
            echo "Database '$targetDb' already exists.\n";
            return true;
        }

        echo "Database '$targetDb' not found. Creating...\n";
        $pdo->exec("CREATE DATABASE \"$targetDb\"");
        echo "Database '$targetDb' created successfully.\n";
        return true;

    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage() . "\n";
        return false;
    }
}

if (!tryCreateDb($host, $port, $username, $password, $targetDb)) {
    echo "\nRetrying with password 'root'...\n";
    if (!tryCreateDb($host, $port, $username, 'root', $targetDb)) {
        echo "\nFailed to create database with both passwords.\n";
        exit(1);
    }
}
