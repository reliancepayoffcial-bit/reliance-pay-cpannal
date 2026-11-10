# RELIANCE PAY — FINAL PRODUCTION CPANEL DEPLOYMENT REPORT

**Platform Target:** Hostinger Shared Deluxe, Hostinger Cloud, cPanel 136+, Apache / LiteSpeed  
**Backend Language:** PHP 8.1+ (PDO Prepared Statements, atomic transactions, strict error handling)  
**Database System:** MySQL 5.7+ / MariaDB 10.3+ (InnoDB engine with foreign key cascades)  
**Deployment Archive:** `reliance-pay-final-cpanel.zip` (121.82 MB, 227 files)  
**Web Auto-Installer:** `https://yourdomain.com/install/`  

---

## 1. Final Deployment Package Details

- **Archive File Name:** `reliance-pay-final-cpanel.zip`
- **Location on Server:** Root directory (`/reliance-pay-final-cpanel.zip`) & Public folder (`/public/reliance-pay-final-cpanel.zip`)
- **Direct Download Link:** [Download reliance-pay-final-cpanel.zip](/public/reliance-pay-final-cpanel.zip)
- **Total Production Files:** 227 Files
- **Exact Archive Size:** 121.82 MB (127,735,200 bytes)
- **SHA-256 Checksum:**
  ```text
  264f29c31943144f37d9dacd27f8c156bdd15b0ef71dd9ca1647deb9ded528aa
  ```
- **Archive Integrity Test:** Tested with Python `zipfile.testzip()` — **100% Valid & Extractable (0 Corruptions)**.

---

## 2. Directory Structure Inside Deployment ZIP

```text
public_html/
├── .htaccess                     # Apache / LiteSpeed rewrite rules (SPA & API routing)
├── index.html                    # Compiled Production SPA HTML (loads /assets/index-*.js)
├── manifest.webmanifest          # PWA Web Manifest configuration
├── sw.js                         # PWA Service Worker script
├── api/
│   └── index.php                 # Master PHP REST API controller (PDO prepared statements)
├── config/
│   ├── database.php              # Active MySQL PDO database configuration
│   ├── database.php.example      # Database configuration template
│   └── api.php                   # Server-side API keys (Gemini, Payment, SMS, KYC)
├── database/
│   ├── schema.sql                # Complete MySQL DDL Schema (16 InnoDB tables)
│   └── seed.sql                  # Initial database seeds (admin, demo user, plans, banners)
├── install/
│   ├── index.php                 # 4-Step interactive web installer wizard
│   └── install.lock              # Created upon successful setup to lock wizard
├── assets/                       # Production CSS/JS bundles and high-res brand media
├── public/
│   ├── uploads/                  # Uploaded payment proofs, QR codes, and user avatars
│   └── assets/                   # Brand graphics, icons, and hero banners
├── CPANEL_SETUP.md               # English cPanel deployment manual
└── INSTALLATION_GUIDE_HINDI.md   # Step-by-step Hindi cPanel installation manual
```

---

## 3. Step-by-Step Hindi Installation Guide (cPanel एवं Hostinger)

### स्टेप 1: ZIP फाइल अपलोड और एक्सट्रेक्ट करें
1. अपने **Hostinger hPanel** या **cPanel** के **File Manager** में जाएँ।
2. अपने डोमेन के मुख्य फोल्डर **`public_html/`** में प्रवेश करें।
3. **`reliance-pay-final-cpanel.zip`** को `public_html/` में अपलोड करें।
4. अपलोड होने के बाद ZIP पर राइट-क्लिक करें और **Extract** दबाएँ।

### स्टेप 2: MySQL डेटाबेस और यूजर बनाएँ
1. cPanel / hPanel में **MySQL Databases** मेनू खोलें।
2. एक नया डेटाबेस बनाएँ (उदा. `u123456_reliancepay`)।
3. एक नया डेटाबेस यूजर बनाएँ (उदा. `u123456_reluser`) और सुरक्षित पासवर्ड सेट करें।
4. इस यूजर को डेटाबेस में जोड़ें और **ALL PRIVILEGES** (सभी अनुमतियाँ) प्रदान करें।

### स्टेप 3: वेब इंस्टॉलर विजार्ड चलाएँ
1. अपने ब्राउज़र में यह URL खोलें:
   ```text
   https://yourdomain.com/install/
   ```
2. **Step 1 (Requirements):** जाँचें कि PHP 8.1+ और सभी आवश्यक एक्सटेंशन (`pdo_mysql`, `mbstring`, `json`) सक्रिय हैं। फिर **Next Step** पर क्लिक करें।
3. **Step 2 (MySQL Config):** 
   - **Host:** `localhost`
   - **Port:** `3306`
   - **Database Name:** अपना बनाया हुआ डेटाबेस नाम दर्ज करें
   - **Username:** अपना डेटाबेस यूजरनेम दर्ज करें
   - **Password:** अपना पासवर्ड दर्ज करें
   - **Test & Connect Database** बटन दबाएँ।
4. **Step 3 (Admin Account):** एडमिन का मोबाइल नंबर और पासवर्ड सेट करें (डिफ़ॉल्ट: Mobile `8824904563`, Password `Abcd1234`)।
5. **Step 4 (Finish):** इंस्टॉलर सभी 16 टेबल बना देगा, डेटाबेस सीड कर देगा, `config/database.php` लिख देगा और सुरक्षा लॉक फाइल बना देगा।

---

## 4. Default Administrator Credentials

- **वेबसाइट URL:** `https://yourdomain.com/`
- **एडमिन मोबाइल:** `8824904563`
- **एडमिन पासवर्ड:** `Abcd1234`
- **मास्टर एडमिन पिन:** `999999` या `8824`
