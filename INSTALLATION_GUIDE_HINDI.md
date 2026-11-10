# RELIANCE PAY — CPANEL एवं HOSTINGER हिंदी इंस्टॉलेशन गाइड (PHP + MYSQL)

## आवश्यकताएं (System Requirements)
- **होस्टिंग:** Hostinger Shared Deluxe, Hostinger Cloud, cPanel, Apache, या LiteSpeed Server.
- **PHP वर्शन:** PHP 8.1, 8.2, या 8.3.
- **PHP एक्सटेंशन:** `pdo`, `pdo_mysql`, `mbstring`, `json`, `ctype`.
- **डेटाबेस:** MySQL 5.7+ या MariaDB 10.3+.

---

## इंस्टॉलेशन के आसान 4 स्टेप्स (Step-by-Step Guide)

### स्टेप 1: ZIP फाइल अपलोड और एक्सट्रेक्ट करें
1. अपने **Hostinger hPanel** या **cPanel** के **File Manager** में जाएँ।
2. अपने डोमेन के **`public_html/`** फोल्डर को खोलें।
3. **`reliancepay-php-cpanel-ready.zip`** फाइल को `public_html/` में अपलोड करें।
4. ZIP फाइल पर राइट-क्लिक करें और **Extract** दबाएँ।

### स्टेप 2: MySQL डेटाबेस बनाएँ
1. cPanel / hPanel में **MySQL Databases** पर क्लिक करें।
2. एक नया डेटाबेस बनाएँ (उदा. `u123456_relpay`)।
3. एक नया यूजर बनाएँ (उदा. `u123456_reluser`) और मजबूत पासवर्ड दर्ज करें।
4. यूजर को डेटाबेस से जोड़ें और **ALL PRIVILEGES** (सभी अधिकार) अनुमति दें।

### स्टेप 3: वेब इंस्टॉलर विजार्ड चलाएँ
1. अपने ब्राउज़र में यह URL खोलें:
   `https://yourdomain.com/install/`
2. **Step 1 (Requirements):** चेक करें कि आपके सर्वर में PHP 8.1+ और आवश्यक एक्सटेंशन चालू हैं। फिर **Next Step** दबाएँ।
3. **Step 2 (MySQL Config):** 
   - Host: `localhost`
   - Port: `3306`
   - Database Name: अपना डेटाबेस नाम डालें
   - Username: अपना यूजरनेम डालें
   - Password: अपना पासवर्ड डालें
   - **Test & Connect Database** बटन दबाएँ।
4. **Step 3 (Admin Account):** एडमिन का मोबाइल नंबर और पासवर्ड सेट करें (डिफ़ॉल्ट: Mobile `8824904563`, Password `Abcd1234`)।
5. **Step 4 (Finish):** इंस्टॉलर सभी 16 टेबल बना देगा, डेटाबेस सीड कर देगा, `config/database.php` फाइल तैयार कर देगा और सुरक्षा लॉक फाइल बना देगा।

---

## एडमिन लॉगिन जानकारी (Admin Credentials)
- **वेबसाइट URL:** `https://yourdomain.com/`
- **एडमिन मोबाइल:** `8824904563`
- **एडमिन पासवर्ड:** `Abcd1234`
- **मास्टर एडमिन पिन:** `999999` या `8824`

---

## मुख्य फीचर्स जो चालू हैं
1. **सुरक्षित प्रमाणीकरण (Authentication):** `password_hash()` और `password_verify()` (BCRYPT) द्वारा 100% सुरक्षित।
2. **12-घंटे का ऑटोमेटेड डिविडेंड (12-Hour Dividend System):** 12 घंटे में प्रॉफिट क्लेम करने का फीचर।
3. **UPI डिपॉजिट और बैंक विथड्रॉल (Deposits & Withdrawals):** UTR वेरिफिकेशन और सेफ लेजर बैलेंस।
4. **स्क्रैच कार्ड्स एवं डेली चेक-इन (Gamification Rewards):** यूज़र्स के लिए डेली बोनस और स्क्रैच कार्ड्स।
5. **संपूर्ण एडमिन पैनल (Full Admin Panel):** यूज़र मैनेजमेंट, प्लान्स मैनेजमेंट, विथड्रॉल अप्रूवल, KYC मैनेजमेंट, सपोर्ट टिकट्स और सेटिंग्स।
