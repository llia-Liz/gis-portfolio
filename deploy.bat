@echo off
cd /d "%~dp0"
echo Installing gh-pages...
cmd /c "npm install gh-pages --save-dev"
echo Building project...
cmd /c "npm run build"
echo Deploying to GitHub Pages...
cmd /c "npx gh-pages -d dist"
echo Deployment completed!
pause