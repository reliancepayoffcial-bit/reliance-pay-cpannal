#!/bin/bash

# Reliance Pay - cPanel Deployment Preparation Script
# Run this on your local machine before pushing to GitHub

echo "--- RELIANCE PAY CPANEL DEPLOYMENT PREPARATION ---"

# 1. Clean previous build
echo "[1/4] Cleaning old build assets..."
rm -rf dist

# 2. Install dependencies
echo "[2/4] Installing dependencies..."
npm install

# 3. Build Production Frontend
echo "[3/4] Building production frontend..."
npm run build:cpanel

# 4. Success message
if [ -d "dist" ]; then
    echo "[4/4] SUCCESS: Build generated in 'dist' folder."
    echo "---"
    echo "NEXT STEPS:"
    echo "1. If you commit 'dist' to GitHub, cPanel will deploy automatically."
    echo "2. If you don't commit 'dist', use the provided .cpanel.yml in a GitHub Action."
    echo "---"
else
    echo "FAILED: 'dist' folder not found. Check for build errors."
    exit 1
fi
