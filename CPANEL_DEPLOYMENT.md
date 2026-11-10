# Reliance Pay - GitHub to Hostinger cPanel Deployment Guide

This repository is pre-configured for automated deployment to Hostinger cPanel using the official **cPanel Git Version Control** tool.

## 1. Prerequisites
- Hostinger cPanel account.
- Domain pointing to your Hostinger server.
- GitHub repository with this code.

## 2. Repository Preparation
We have added a `.cpanel.yml` file which tells cPanel how to move files from the repo to your `public_html`.

### Step A: Build the Frontend
Since cPanel cannot run `npm build` by default, you must generate the `dist` folder on your local machine before pushing.
1. Run `./deploy_cpanel.sh` (or `npm run build:cpanel`).
2. **Commit the `dist` folder** to GitHub. 
   *(Note: While committing build artifacts is generally avoided, it is the standard path for cPanel Git integration without complex CI/CD).*

## 3. Setup cPanel Git Version Control
1. Log in to your **cPanel**.
2. Go to **Git™ Version Control** (under Files).
3. Click **Create**.
4. Set **Clone URL** to your GitHub Repository URL (e.g., `https://github.com/user/reliance-pay.git`).
5. Set **Repository Path** (e.g., `/home/u123/repositories/relpay`).
6. Set **Deployment Branch** to `main`.
7. Click **Create**.

## 4. Deploy to public_html
1. Once created, click **Manage** next to the repository.
2. Go to the **Pull or Deploy** tab.
3. Click **Update from Remote** (to pull latest code from GitHub).
4. Click **Deploy HEAD Commit**.
   - This triggers the tasks in `.cpanel.yml`.
   - Your compiled React app and PHP backend will be moved to `public_html`.

## 5. Security & Data Persistence
- **`config/database.php`**: This file is added to `.gitignore`. Once you create it on your server (via the `/install/` wizard), it will NOT be overwritten by future GitHub pulls.
- **Database**: Your MySQL database is safe on the server and is never touched by the Git deployment process.
- **`.htaccess`**: Handles all routing for both React and PHP automatically.

## 6. Troubleshooting Deployment Errors

### Error: "Ensure no uncommitted changes exist"
If cPanel refuses to deploy because of "uncommitted changes", it means someone edited files directly inside the repository folder on the server.
**Fix:**
1. Open **cPanel Terminal**.
2. Navigate to your repository folder:
   ```bash
   cd /home/$(whoami)/repositories/relpay
   ```
3. Reset the state:
   ```bash
   git reset --hard HEAD
   git clean -fd
   ```
4. Try deploying again from the cPanel UI.

### Error: ".cpanel.yml invalid syntax"
Ensure your `.cpanel.yml` starts with three dashes `---` and uses valid indentation. We have refined the file for you to be as simple as possible.

## 7. Local Development Helper
Use the provided `deploy_cpanel.sh` script to quickly prepare your code for the next push:
```bash
chmod +x deploy_cpanel.sh
./deploy_cpanel.sh
git add .
git commit -m "Build: Production Update"
git push origin main
```
Then simply click **Deploy** in your cPanel dashboard.
