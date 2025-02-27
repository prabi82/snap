# Setting Up Your MongoDB Password

We're making progress! The MongoDB connection string format is now correct, but we need to set the right password in your `.env.local` file.

## Getting the Password

1. **Find Your MongoDB Atlas Password**
   - If you just created the database, the password should have been shown to you
   - If you need to reset your password:
     - Go to MongoDB Atlas (atlas.mongodb.com)
     - Navigate to "Database Access" under Security
     - Find your user (likely "snap")
     - Click "Edit" and then "Edit Password"
     - Generate a new password

2. **Update Your Connection String**
   - Open your `.env.local` file
   - Replace the `<db_password>` placeholder with your actual password:
     ```
     MONGODB_URI=mongodb+srv://snap:your_actual_password@snap.qw1lv.mongodb.net/?retryWrites=true&w=majority&appName=snap
     ```

3. **Test Your Connection**
   - Run the test script again:
     ```bash
     node test-mongo-connection.js
     ```

## Network Access Settings

If your connection is still failing, you may need to adjust your MongoDB Atlas Network Access settings:

1. Go to MongoDB Atlas
2. Navigate to "Network Access" under Security
3. Click "Add IP Address"
4. Choose one of these options:
   - Add your current IP address (more secure)
   - Add 0.0.0.0/0 to allow access from anywhere (less secure, but easier for testing)
5. Click "Confirm"

## Next Steps

Once your connection is working:

1. **Seed the database**:
   ```bash
   npm run seed-db
   ```

2. **Start your application**:
   ```bash
   npm run dev
   ``` 