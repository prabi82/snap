<?php
// MySQL Connection Diagnostic Tool
// This file helps diagnose MySQL connection issues
// Upload to your cPanel server and access via browser

// Database credentials
$host = 'localhost'; // Using localhost to test local connection
$remote_host = '109.203.109.118'; // Test external connection too
$user = 'onlyoman_snap';
$pass = '1v(hiCel+j0G';
$db = 'onlyoman_snap';

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Basic styling
echo '<style>
body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
h1, h2 { color: #333; }
.success { color: green; font-weight: bold; }
.error { color: red; font-weight: bold; }
.warning { color: orange; font-weight: bold; }
.info { background: #f0f0f0; padding: 10px; border-radius: 5px; margin: 10px 0; }
.container { max-width: 800px; margin: 0 auto; }
hr { margin: 20px 0; border: 0; border-top: 1px solid #ddd; }
</style>';

echo '<div class="container">';
echo '<h1>MySQL Connection Diagnostic</h1>';
echo '<p>This script helps diagnose MySQL connection issues.</p>';

// Function to test MySQL connection
function testMySQLConnection($host, $user, $pass, $db) {
    echo "<h2>Testing connection to: $host</h2>";
    
    try {
        $conn = new mysqli($host, $user, $pass, $db);
        
        if ($conn->connect_error) {
            echo "<p class='error'>Connection failed: " . $conn->connect_error . "</p>";
            return false;
        }
        
        echo "<p class='success'>Connection successful!</p>";
        
        // Check if we can run queries
        echo "<h3>Checking database queries:</h3>";
        $result = $conn->query("SHOW TABLES");
        
        if ($result === false) {
            echo "<p class='error'>Failed to execute query: " . $conn->error . "</p>";
        } else {
            echo "<p class='success'>Query executed successfully!</p>";
            
            // Display tables
            echo "<p>Found " . $result->num_rows . " tables:</p>";
            echo "<ul>";
            while ($row = $result->fetch_array()) {
                echo "<li>" . $row[0] . "</li>";
            }
            echo "</ul>";
        }
        
        $conn->close();
        return true;
    } catch (Exception $e) {
        echo "<p class='error'>Exception: " . $e->getMessage() . "</p>";
        return false;
    }
}

// Test local connection
$local_success = testMySQLConnection($host, $user, $pass, $db);

echo "<hr>";

// Test remote connection
$remote_success = testMySQLConnection($remote_host, $user, $pass, $db);

echo "<hr>";

// Check MySQL configuration
echo "<h2>MySQL Server Configuration</h2>";

if ($local_success) {
    try {
        $conn = new mysqli($host, $user, $pass, $db);
        
        // Check if MySQL is configured to allow remote connections
        echo "<h3>Checking bind-address configuration:</h3>";
        $result = $conn->query("SHOW VARIABLES LIKE 'bind_address'");
        
        if ($row = $result->fetch_assoc()) {
            echo "<p>bind_address is set to: <strong>" . $row['Value'] . "</strong></p>";
            
            if ($row['Value'] == '127.0.0.1' || $row['Value'] == 'localhost') {
                echo "<p class='error'>MySQL is configured to listen only on localhost!</p>";
                echo "<p>This prevents remote connections. Contact your hosting provider to change this to '0.0.0.0' or your server's IP.</p>";
            } else if ($row['Value'] == '0.0.0.0' || $row['Value'] == '::') {
                echo "<p class='success'>MySQL is configured to accept connections from any address!</p>";
            } else {
                echo "<p class='warning'>MySQL is configured to listen only on specific IP address(es).</p>";
                echo "<p>Make sure your server's external IP is included.</p>";
            }
        } else {
            echo "<p class='warning'>Could not determine bind_address setting.</p>";
        }
        
        // Check for skip-networking
        echo "<h3>Checking skip-networking:</h3>";
        $result = $conn->query("SHOW VARIABLES LIKE 'skip_networking'");
        
        if ($row = $result->fetch_assoc()) {
            echo "<p>skip_networking is set to: <strong>" . $row['Value'] . "</strong></p>";
            
            if ($row['Value'] == 'ON') {
                echo "<p class='error'>skip_networking is ON! This prevents all remote connections.</p>";
                echo "<p>Contact your hosting provider to disable this option.</p>";
            } else {
                echo "<p class='success'>skip_networking is OFF. Remote connections are allowed.</p>";
            }
        } else {
            echo "<p class='warning'>Could not determine skip_networking setting.</p>";
        }
        
        // Check user grants
        echo "<h3>Checking user privileges:</h3>";
        $escaped_user = $conn->real_escape_string($user);
        $result = $conn->query("SHOW GRANTS FOR '$escaped_user'@'%'");
        
        if ($result === false) {
            echo "<p class='warning'>Could not check grants for user '$user'@'%'. This may mean the user is not configured for remote access.</p>";
            
            // Try with localhost
            $result = $conn->query("SHOW GRANTS FOR '$escaped_user'@'localhost'");
            if ($result !== false) {
                echo "<p class='error'>User '$user' is only configured for local connections (from 'localhost').</p>";
                echo "<p>Use cPanel's MySQL Remote Access or MySQL Databases tool to add remote access for this user.</p>";
            } else {
                echo "<p class='error'>Could not determine user privileges. Check your cPanel MySQL configuration.</p>";
            }
        } else {
            echo "<p class='success'>User '$user' is configured for remote access from any host ('%')!</p>";
            echo "<p>Privileges:</p>";
            echo "<ul>";
            while ($row = $result->fetch_array()) {
                echo "<li>" . htmlspecialchars($row[0]) . "</li>";
            }
            echo "</ul>";
        }
        
        $conn->close();
    } catch (Exception $e) {
        echo "<p class='error'>Exception while checking configuration: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p class='error'>Could not check MySQL configuration because local connection failed.</p>";
}

echo "<hr>";

// Environment information
echo "<h2>Environment Information</h2>";
echo "<div class='info'>";
echo "<p><strong>Server IP:</strong> " . $_SERVER['SERVER_ADDR'] . "</p>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
echo "<p><strong>Web Server:</strong> " . $_SERVER['SERVER_SOFTWARE'] . "</p>";

// Check if firewall might be blocking
if ($local_success && !$remote_success) {
    echo "<p class='warning'><strong>Possible firewall issue:</strong> The database is accessible locally but not remotely.</p>";
    echo "<p>This suggests a firewall may be blocking port 3306 or MySQL might be configured to only accept local connections.</p>";
}

echo "</div>";

// Recommendations
echo "<h2>Recommendations</h2>";
echo "<ul>";

if (!$local_success) {
    echo "<li class='error'>Fix the local database connection issues first.</li>";
    echo "<li>Check your database credentials and make sure the database exists.</li>";
}

if ($local_success && !$remote_success) {
    echo "<li>Contact your hosting provider to ensure port 3306 is open on the firewall.</li>";
    echo "<li>Verify MySQL is configured to accept remote connections (bind-address = 0.0.0.0).</li>";
    echo "<li>Make sure you have created a MySQL user with proper remote access (user@'%').</li>";
}

echo "</ul>";

// Security notice
echo "<div class='info'>";
echo "<p><strong>Security notice:</strong> This script displays sensitive information. Delete it after use!</p>";
echo "<p>Self-delete: <a href='?delete=yes'>Click here to delete this file</a></p>";
echo "</div>";

// Self-delete mechanism
if (isset($_GET['delete']) && $_GET['delete'] == 'yes') {
    echo "<div class='info'>";
    if (unlink(__FILE__)) {
        echo "<p class='success'>This file has been deleted for security.</p>";
    } else {
        echo "<p class='error'>Failed to delete this file. Please delete it manually.</p>";
    }
    echo "</div>";
}

echo '</div>';
?> 