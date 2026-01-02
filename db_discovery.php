<?php

$users = ['postgres', 'root', 'giris'];
$passwords = ['', 'postgres', 'root', 'password', 'admin', 'secret'];
$hosts = ['127.0.0.1']; // 'localhost' usually resolves to ::1 on windows which we know fails

echo "Starting connection discovery...\n";

foreach ($hosts as $host) {
    foreach ($users as $user) {
        foreach ($passwords as $pass) {
            echo "Trying Host: $host, User: $user, Pass: " . ($pass === '' ? '(empty)' : $pass) . " ... ";
            
            try {
                // Connect to template1 to avoid "database does not exist" error for custom dbs
                $dsn = "pgsql:host=$host;port=5432;dbname=template1";
                $pdo = new PDO($dsn, $user, $pass);
                echo "SUCCESS! Connected.\n";
                // If success, we found it.
                echo "!!! FOUND WORKING CREDENTIALS !!!\n";
                echo "Host: $host\nUser: $user\nPass: $pass\n";
                exit(0);
            } catch (PDOException $e) {
                $msg = $e->getMessage();
                if (strpos($msg, 'password authentication failed') !== false) {
                    echo "Auth Failed.\n";
                } elseif (strpos($msg, 'no password supplied') !== false) {
                    echo "No Password Supplied (Server requires one).\n";
                } elseif (strpos($msg, 'does not exist') !== false) {
                    echo "Auth OK (Database missing).\n";
                    // If we get here, Auth worked!
                     echo "!!! FOUND WORKING CREDENTIALS (DB Missing) !!!\n";
                    echo "Host: $host\nUser: $user\nPass: $pass\n";
                    exit(0);
                } else {
                    echo "Error: " . substr($msg, 0, 50) . "...\n";
                }
            }
        }
    }
}
echo "Discovery finished. No working combination found.\n";
