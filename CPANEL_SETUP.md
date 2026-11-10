# RELIANCE PAY — CPANEL & HOSTINGER PHP+MYSQL SETUP GUIDE

## System Requirements
- **Hosting Platform:** Hostinger Shared Deluxe, Hostinger Cloud, cPanel, Apache, or LiteSpeed.
- **PHP Version:** PHP 8.1, 8.2, or 8.3.
- **PHP Extensions:** `pdo`, `pdo_mysql`, `mbstring`, `json`, `ctype`.
- **Database:** MySQL 5.7+ or MariaDB 10.3+.

---

## Quick Installation Steps

### Step 1: Upload Project Archive
1. Log into Hostinger hPanel or cPanel File Manager.
2. Navigate to your website's document root (usually `public_html/`).
3. Upload `reliancepay-php-cpanel-ready.zip`.
4. Extract the ZIP file directly into `public_html/`.

### Step 2: Create MySQL Database in cPanel / hPanel
1. Go to **MySQL Databases** or **Database Management** in cPanel/hPanel.
2. Create a new database (e.g., `u123456_reliancepay`).
3. Create a new database user and assign a strong password.
4. Add the user to the database and grant **ALL PRIVILEGES**.

### Step 3: Run Interactive Web Installer
1. Open your web browser and navigate to:
   `https://yourdomain.com/install/`
2. **Step 1:** Requirements Check — Ensures PHP 8.1+ and extensions are active.
3. **Step 2:** MySQL Configuration — Enter your Database Host (`localhost`), Database Name, Username, and Password.
4. **Step 3:** Admin Account Creation — Set your Master Admin Mobile Number, Admin Name, and Password (Default: Mobile `8824904563`, Password `Abcd1234`).
5. **Step 4:** Finish Setup — The wizard creates all 16 MySQL tables, seeds initial settings & investment plans, writes `config/database.php`, and creates `install/install.lock`.

---

## Directory Structure
```text
public_html/
├── .htaccess                 # Apache / LiteSpeed URL rewrite rules
├── index.html                # High-performance React SPA Frontend
├── server.js                 # Production Node.js fallback entry point
├── api/
│   └── index.php             # Master PHP REST API Controller
├── config/
│   ├── database.php          # Active MySQL PDO Database Configuration
│   └── database.php.example  # Database configuration template
├── database/
│   ├── schema.sql            # Full MySQL Database DDL Schema
│   └── seed.sql              # Initial Database Seed SQL
├── install/
│   ├── index.php             # Web Auto-Installer Wizard
│   └── install.lock          # Installation Security Lock File
├── public/
│   ├── uploads/              # Uploaded Payment Proofs, QR Codes & Avatars
│   └── assets/               # Brand Banners, Icons & Media Assets
└── assets/                   # Compiled Minified CSS/JS SPA Chunks
```

---

## Admin Panel Access
- **URL:** Launch the web app at `https://yourdomain.com/`, open **Admin Panel** or log in with Admin Mobile.
- **Admin Mobile:** `8824904563`
- **Admin Password:** `Abcd1234`
- **Master Admin PIN:** `999999` or `8824`
