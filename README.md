# Snap - Photo Sharing Application

Snap is a modern photo sharing application built with Next.js and MySQL, designed to allow users to share, discover, and vote on photos.

## Features

- User authentication (register, login, profile)
- Photo upload and management
- Photo viewing and discovery
- Voting system for photos
- Commenting system
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- MySQL database

## Setup and Installation

### Local Development

1. Clone the repository:
   ```
   git clone <repository-url>
   cd snap
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your-mysql-username
   DB_PASSWORD=your-mysql-password
   DB_NAME=snap_db

   # JWT Secret
   JWT_SECRET=your-secure-jwt-secret

   # Environment
   NODE_ENV=development
   ```

4. Create the database in MySQL:
   ```
   CREATE DATABASE snap_db;
   ```

5. Initialize the database:
   ```
   npm run init-db
   ```

6. Start the development server:
   ```
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Deployment to cPanel

1. Build the application:
   ```
   npm run build
   ```

2. Package the `.next`, `public`, `package.json`, `.env.local`, and any other necessary files.

3. Upload to your cPanel hosting:
   - Create a Node.js application in cPanel
   - Set the application path to your uploaded files
   - Configure the Node.js version (v16+)
   - Set the application URL
   - Configure environment variables in the Node.js app settings

4. Create the MySQL database in cPanel:
   - Create a new database in cPanel MySQL Databases
   - Create a new database user
   - Add the user to the database with all privileges
   - Update the `.env.local` file with the new database credentials

5. Initialize the database with the schema:
   - Import the `src/lib/schema.sql` file using phpMyAdmin

6. Start the Node.js application in cPanel.

## API Routes

The application provides the following API endpoints:

- **Authentication**
  - POST `/api/register` - Register a new user
  - POST `/api/auth` - Login a user

- **Photos**
  - GET `/api/photos` - Get all photos
  - POST `/api/photos` - Create a new photo
  - GET `/api/photos/:id` - Get a specific photo
  - PUT `/api/photos/:id` - Update a photo
  - DELETE `/api/photos/:id` - Delete a photo
  - POST `/api/photos/:id/vote` - Vote on a photo

- **Comments**
  - GET `/api/photos/:id/comments` - Get comments for a photo
  - POST `/api/photos/:id/comments` - Add a comment to a photo

## License

This project is licensed under the MIT License - see the LICENSE file for details. 