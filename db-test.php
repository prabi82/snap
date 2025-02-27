<?php
/**
 * Database Connection Test Script
 * 
 * Access this file through your web browser to test the database connection.
 * Example: https://snap.onlyoman.com/db-test.php
 * 
 * IMPORTANT: Remove this file after testing for security reasons.
 */

// Only display errors when explicitly requested
$showErrors = isset($_GET['show_errors']) && $_GET['show_errors'] === 'true';
if (!$showErrors) {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Load environment variables
$envFile = '.env.local';
$env = [];

if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) {
            continue;
        }
        list($name, $value) = explode('=', $line, 2);
        $env[trim($name)] = trim($value);
    }
}

// Database configuration
$dbHost = $env['DB_HOST'] ?? 'localhost';
$dbUser = $env['DB_USER'] ?? '';
$dbPassword = $env['DB_PASSWORD'] ?? '';
$dbName = $env['DB_NAME'] ?? '';

// Start output buffering
ob_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database Connection Test</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #3B82F6;
            border-bottom: 2px solid #3B82F6;
            padding-bottom: 10px;
        }
        .card {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            padding: 20px;
            margin-bottom: 20px;
        }
        .success {
            background-color: #d1fae5;
            border-left: 4px solid #10B981;
            padding: 10px 15px;
        }
        .error {
            background-color: #fee2e2;
            border-left: 4px solid #ef4444;
            padding: 10px 15px;
        }
        .warning {
            background-color: #ffedd5;
            border-left: 4px solid #f59e0b;
            padding: 10px 15px;
        }
        .info {
            background-color: #e0f2fe;
            border-left: 4px solid #3B82F6;
            padding: 10px 15px;
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        table, th, td {
            border: 1px solid #e5e7eb;
        }
        th, td {
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background-color: #f9fafb;
        }
        .footer {
            margin-top: 30px;
            font-size: 0.8rem;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>
<body>
    <h1>Snap Database Connection Test</h1>
    
    <div class="warning">
        <strong>Security Notice:</strong> This page displays sensitive configuration information. 
        Delete this file from your server after testing.
    </div>
    
    <div class="card">
        <h2>Environment Configuration</h2>
        <table>
            <tr>
                <th>Setting</th>
                <th>Value</th>
            </tr>
            <tr>
                <td>Database Host</td>
                <td><?= htmlspecialchars($dbHost) ?></td>
            </tr>
            <tr>
                <td>Database Name</td>
                <td><?= htmlspecialchars($dbName) ?></td>
            </tr>
            <tr>
                <td>Database User</td>
                <td><?= htmlspecialchars($dbUser) ?></td>
            </tr>
            <tr>
                <td>Password</td>
                <td><?= !empty($dbPassword) ? '******' : '<span style="color: red">Not set</span>' ?></td>
            </tr>
            <tr>
                <td>PHP Version</td>
                <td><?= phpversion() ?></td>
            </tr>
        </table>
    </div>
    
    <div class="card">
        <h2>Connection Test Results</h2>
        <?php
        // Test MySQL connection
        $connection = false;
        $error = '';
        $userCount = 0;
        
        try {
            $connection = new mysqli($dbHost, $dbUser, $dbPassword, $dbName);
            
            if ($connection->connect_error) {
                throw new Exception($connection->connect_error);
            }
            
            // Test query execution
            $result = $connection->query("SELECT COUNT(*) as count FROM users");
            if ($result) {
                $row = $result->fetch_assoc();
                $userCount = $row['count'];
            }
        } catch (Exception $e) {
            $error = $e->getMessage();
        }
        
        if ($connection && !$error) {
            echo '<div class="success">';
            echo '<strong>✅ Connection successful!</strong>';
            echo '<p>Successfully connected to the MySQL database.</p>';
            echo '</div>';
            
            echo '<div class="info">';
            echo "<p>Database contains <strong>{$userCount}</strong> users.</p>";
            echo '</div>';
            
            // Check if tables exist
            $tables = ['users', 'photos', 'comments'];
            echo '<h3>Database Tables</h3>';
            echo '<table>';
            echo '<tr><th>Table</th><th>Status</th><th>Row Count</th></tr>';
            
            foreach ($tables as $table) {
                $tableExists = $connection->query("SHOW TABLES LIKE '{$table}'");
                $exists = $tableExists->num_rows > 0;
                
                $rowCount = 0;
                if ($exists) {
                    $countResult = $connection->query("SELECT COUNT(*) as count FROM {$table}");
                    $rowCount = $countResult ? $countResult->fetch_assoc()['count'] : 0;
                }
                
                echo '<tr>';
                echo '<td>' . htmlspecialchars($table) . '</td>';
                echo '<td>' . ($exists ? '<span style="color: green">Exists</span>' : '<span style="color: red">Missing</span>') . '</td>';
                echo '<td>' . ($exists ? $rowCount : 'N/A') . '</td>';
                echo '</tr>';
            }
            
            echo '</table>';
            
        } else {
            echo '<div class="error">';
            echo '<strong>❌ Connection failed!</strong>';
            echo '<p>Error: ' . htmlspecialchars($error) . '</p>';
            
            if ($showErrors) {
                echo '<p>Common issues:</p>';
                echo '<ul>';
                echo '<li>Check your .env.local file for correct credentials</li>';
                echo '<li>Verify the database user has permission to access the database</li>';
                echo '<li>Ensure the database exists and is properly configured</li>';
                echo '<li>Check if your server\'s MySQL service is running</li>';
                echo '</ul>';
            } else {
                echo '<p>For more detailed error information, <a href="?show_errors=true">click here</a>.</p>';
            }
            
            echo '</div>';
        }
        
        // Close connection
        if ($connection && !$error) {
            $connection->close();
        }
        ?>
    </div>
    
    <div class="footer">
        <p>Snap Photo Sharing Application - Database Test Script</p>
        <p>Generated on <?= date('Y-m-d H:i:s') ?></p>
    </div>
</body>
</html>
<?php
// Send the output
ob_end_flush();
?> 