@echo off
echo Building Snap Photo Sharing App for production...
call npm run build

echo Creating deployment package...
if not exist "deploy" mkdir deploy
xcopy /E /I /Y ".next" "deploy\.next"
xcopy /E /I /Y "public" "deploy\public"
copy package.json "deploy\"
copy package-lock.json "deploy\"
copy next.config.js "deploy\"
copy server.js "deploy\"

if not exist "deploy\src\lib" mkdir "deploy\src\lib"
copy "src\lib\schema.sql" "deploy\src\lib\"

echo Creating production environment file template...
echo # Production Environment Variables > "deploy\.env.local.template"
echo # Replace these values with your production settings >> "deploy\.env.local.template"
echo DB_HOST=localhost >> "deploy\.env.local.template"
echo DB_USER=production_username >> "deploy\.env.local.template"
echo DB_PASSWORD=production_password >> "deploy\.env.local.template"
echo DB_NAME=production_database >> "deploy\.env.local.template"
echo JWT_SECRET=production_jwt_secret_key >> "deploy\.env.local.template"
echo NODE_ENV=production >> "deploy\.env.local.template"

echo Deployment package created in the 'deploy' folder.
echo Please update the .env.local.template file with your production settings before uploading.
echo Refer to DEPLOYMENT.md for detailed instructions on uploading to cPanel. 