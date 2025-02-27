# Snap Production Branch

This branch contains only the files needed for deploying the Snap application to production environments.

## Branch Purpose

The production branch is designed to:

1. Contain only the necessary files for production deployment
2. Include the built `.next` directory (which is ignored in the main branch)
3. Exclude development-only files and configurations
4. Be ready for direct deployment to the hosting environment (snap.onlyoman.com)

## Deployment Files

The following files are included in this branch:

- `.next/` - Built Next.js application (compiled code)
- `package.json` and `package-lock.json` - Dependencies
- `next.config.js` - Next.js configuration
- `server.js` - Custom production server
- `src/lib/schema.sql` - Database schema
- `.env.local.example` - Template for environment variables (actual `.env.local` should be created on the server)

## Deployment Instructions

1. Clone this branch to your local machine:
   ```
   git clone -b production https://github.com/yourusername/snap.git snap-production
   ```

2. Upload the files to your cPanel hosting (snap.onlyoman.com):
   - You can zip and upload the entire directory
   - Or use Git to deploy directly if your hosting supports it

3. On the server:
   - Create `.env.local` from the template
   - Install production dependencies: `npm install --production`
   - Set up the database using the schema
   - Start the application: `node server.js`

## Important Notes

- Never commit sensitive information like API keys or database passwords
- The `.env.local` file should be created manually on the server
- Make sure to build the application locally before committing to this branch
- Use `git checkout production && git merge main --no-commit --no-ff` to prepare updates, then manually adjust files before committing

## Updating Production

When updating the production branch:

1. Build the application on the main branch: `npm run build`
2. Switch to production branch: `git checkout production`
3. Copy the new `.next` directory and any updated files
4. Commit and push the changes
5. Deploy to the production server 