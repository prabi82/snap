# MongoDB Atlas Connection Guide

## Connection Issues Detected

There appears to be an issue with the MongoDB Atlas connection string. The error message suggests that we can't resolve the hostname in the connection string.

## Steps to Get the Correct Connection String

1. **Log in to MongoDB Atlas** (atlas.mongodb.com)

2. **Find Your Cluster**
   - Click on your cluster in the Clusters dashboard

3. **Connect to Your Cluster**
   - Click the "Connect" button for your cluster
   - Select "Connect your application"
   - Choose "Node.js" and the appropriate version

4. **Copy the Exact Connection String**
   - Make sure to copy the entire connection string
   - It should look something like this:
     ```
     mongodb+srv://<username>:<password>@<cluster-name>.<identifier>.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your actual credentials

5. **Update Your `.env.local` File**
   - Add the connection string to your `.env.local` file:
     ```
     MONGODB_URI=your_connection_string_here
     MONGODB_DB_NAME=snap
     ```

6. **Check Network Settings**
   - In MongoDB Atlas, go to "Network Access"
   - Add your current IP address or use "0.0.0.0/0" for access from anywhere (less secure)

## Debugging Tips

1. **Test Network Connectivity**
   - The "querySrv ENOTFOUND" error suggests DNS resolution issues
   - This could be due to:
     a. Incorrect hostname in the connection string
     b. Network/firewall restrictions
     c. DNS resolution issues on your network

2. **Test a Simple MongoDB URI**
   - If you still have issues, try the old-style MongoDB URI:
     ```
     mongodb://<username>:<password>@<primary-shard>.mongodb.net:27017,<secondary-shard>.mongodb.net:27017/<database>?ssl=true&replicaSet=<replica-set>&authSource=admin&retryWrites=true
     ```

3. **Check for Typos**
   - Ensure there are no typing errors in the hostname

## Next Steps

Once you have the correct connection string, update your `.env.local` file and run:

```bash
node test-mongo-connection.js
```

If the connection is successful, proceed with seeding the database:

```bash
npm run seed-db
``` 