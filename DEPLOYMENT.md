# Deploying Snap to cPanel

This guide provides detailed instructions for deploying the Snap photo sharing application to a cPanel hosting environment.

## Prerequisites

- A cPanel hosting account with Node.js support
- Access to phpMyAdmin or MySQL databases in cPanel
- FTP client (such as FileZilla) or cPanel File Manager

## Deployment Steps

### Step 1: Prepare the Application for Deployment

1. On your local machine, build the application:
   ```bash
   npm run build
   ```

2. Create a deployment package with the following files and folders:
   - `.next` folder (contains the built application)
   - `public` folder (static assets)
   - `package.json` and `package-lock.json`
   - `.env.local` (with production settings)
   - `next.config.js`
   - `src/lib/schema.sql` (for database setup)

### Step 2: Set Up the Database in cPanel

1. Log in to your cPanel account.
2. Navigate to "MySQL Databases" or "MariaDB Databases".
3. Create a new database (e.g., `username_snap_db`).
4. Create a new database user with a strong password.
5. Add the user to the database with all privileges.
6. Make note of the database name, username, and password.

### Step 3: Upload the Application

1. Connect to your cPanel hosting using FTP or use the File Manager.
2. Create a directory for your application (e.g., `snap`).
3. Upload all the files and folders from your deployment package to this directory.

### Step 4: Initialize the Database

1. Go to phpMyAdmin in your cPanel.
2. Select the database you created.
3. Click on the "Import" tab.
4. Upload and import the `schema.sql` file from the `src/lib` directory of your application.
5. Verify that the tables have been created correctly.

### Step 5: Set Up the Node.js Application in cPanel

1. In cPanel, navigate to "Setup Node.js App".
2. Click "Create Application".
3. Configure the application:
   - Application Mode: Production
   - Node.js Version: Select the latest available version (v16 or newer)
   - Application Root: Path to your application directory (e.g., `/home/username/snap`)
   - Application URL: Your domain or subdomain (e.g., `snap.yourdomain.com`)
   - Application Startup File: `node_modules/next/dist/bin/next start`
   - Passenger Mode: Enabled
4. Set up environment variables:
   - Click "Add Environment Variable" for each variable in your `.env.local` file
   - Make sure to update the database credentials with the ones created in Step 2
   - Example variables:
     ```
     DB_HOST=localhost
     DB_USER=username_snap_user
     DB_PASSWORD=your-password
     DB_NAME=username_snap_db
     JWT_SECRET=your-secure-jwt-secret
     NODE_ENV=production
     ```
5. Click "Create" to set up the application.

### Step 6: Configure Domain or Subdomain

1. In cPanel, go to "Domains" or "Subdomains".
2. Create a subdomain or configure an existing domain to point to your application directory.
3. Make sure the document root is set to the application directory.

### Step 7: Install Dependencies and Start the Application

1. In cPanel, go to "Terminal" or SSH into your server.
2. Navigate to your application directory:
   ```bash
   cd ~/snap
   ```
3. Install dependencies:
   ```bash
   npm install --production
   ```
4. Start the application:
   ```bash
   npm start
   ```

### Step 8: Test the Application

1. Open your domain or subdomain in a web browser.
2. Verify that the application is running correctly.
3. Test key functionality such as user registration, login, photo uploads, voting, and commenting.

## Troubleshooting

If you encounter issues with your deployment, check the following:

1. **Application not starting:**
   - Check the Node.js logs in cPanel
   - Verify that all dependencies are installed
   - Make sure the Node.js version is compatible

2. **Database connection errors:**
   - Verify database credentials in environment variables
   - Check that the database and tables exist
   - Ensure the database user has the correct privileges

3. **404 or 500 errors:**
   - Check the server logs
   - Verify the application URL and routing
   - Make sure the build was completed successfully

4. **Memory or performance issues:**
   - Adjust the memory limit for the Node.js application in cPanel
   - Consider optimizing database queries or image handling

## Maintenance

1. **Updating the application:**
   - Build the updated application locally
   - Upload the new build to your server
   - Restart the Node.js application

2. **Database backups:**
   - Regularly back up your database using cPanel's backup tools
   - Export your database from phpMyAdmin regularly

3. **Monitoring:**
   - Monitor server resources through cPanel statistics
   - Set up alerts for high resource usage or errors

## Security Considerations

1. Use HTTPS for your domain or subdomain
2. Regularly update dependencies to patch security vulnerabilities
3. Use strong, unique JWT secrets and database passwords
4. Implement rate limiting for API endpoints if needed
5. Validate and sanitize all user inputs 