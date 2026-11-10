# 🚀 RELIANCE PAY - cPanel Zip Upload & Auto-Database Deployment Guide

यह गाइड आपको सिखाती है कि कैसे cPanel के **`public_html`** फोल्डर में ZIP फाइल अपलोड करके, एक्सट्रेक्ट (Extract) करके बिना किसी परेशानी के Reliance Pay एप्लीकेशन और इसके डेटाबेस (Data Page/Database) को 100% लाइव चलाएं।

---

## 📦 step 1: Zip File तैयार करें (Zip Package Creation)
अपनी कंप्यूटर या प्रोजेक्ट निर्देशिका में निम्नलिखित फाइलों/फोल्डर्स को सेलेक्ट करें और **`reliance_pay_cpanel.zip`** नाम से एक Zip फाइल बनाएं:

- `dist/` (फोल्डर) - (React Front-end Static Build)
- `server.js` - (Compiled Node.js Express Backend)
- `package.json` - (Dependencies File)
- `public/` - (Banners & Assets)
- `reliance_pay.db` - *(ऐच्छिक/Optional - अगर यह नहीं होगा तो ऐप खुद नया डेटाबेस बना लेगी)*

---

## 📂 Step 2: cPanel `public_html` में Zip Upload & Extract करें
1. अपना **cPanel** डैशबोर्ड खोलें और **File Manager** पर क्लिक करें।
2. बाएँ हाथ से **`public_html`** (या अपने सबडोमेन के फोल्डर) में जाएँ।
3. ऊपर दिए गए **Upload** बटन पर क्लिक करें और **`reliance_pay_cpanel.zip`** फाइल अपलोड करें।
4. अपलोड पूरा होने पर वापस `public_html` में आएं।
5. `reliance_pay_cpanel.zip` पर राइट क्लिक (Right Click) करें और **Extract** पर क्लिक करके ओके करें।
6. सभी फाइलें `public_html` में बाहर निकल (Extract हो) जाएंगी।

---

## ⚙️ Step 3: cPanel में Node.js App सेट करें (Node App Manager)
1. cPanel डैशबोर्ड में खोजें: **Software** ➡️ **Setup Node.js App**
2. **Create Application** बटन दबाएँ:
   - **Node.js version**: `18.x` या `20.x` या `22.x` चुनें।
   - **Application mode**: `Production`
   - **Application root**: `public_html`
   - **Application URL**: अपना मुख्य डोमेन (उदा. `https://yourdomain.com`) चुनें।
   - **Application startup file**: `server.js`
3. **Create** पर क्लिक करें।

---

## 🔌 Step 4: Packages इंस्टॉल करें और ऐप स्टार्ट करें (NPM Install & Launch)
1. ऐप बनने के बाद cPanel में **Run NPM Install** बटन पर क्लिक करें। (यह `better-sqlite3`, `express` आदि डिपेंडेंसी इंस्टॉल कर देगा)।
2. यदि टर्मिनल उपलब्ध हो तो cPanel में दिखाए अनुसार Virtual Environment Command पेस्ट करके `npm install` चला सकते हैं।
3. **Restart Application** बटन दबाएँ।

---

## 🗄️ Step 5: Data Page और डेटाबेस (Database) ऑटो-सेटअप
**आपको कोई भी अलग SQL डेटाबेस बनाने की आवश्यकता नहीं है!**
- जैसे ही आप पहली बार अपने डोमेन (उदा. `https://yourdomain.com`) को खोलेंगे:
  - `server.js` स्वचालित रूप से `reliance_pay.db` डेटाबेस फाइल बना देगा।
  - सभी आवश्यक टेबल (`users`, `plans`, `transactions`, `deposits`, `withdrawals`, `settings`, `banners` आदि) ऑटोमैटिक बन जाएंगी।
  - डिफ़ॉल्ट **Admin Account** और **Demo User Account** खुद-ब-खुद लोड हो जाएंगे:
    - **Admin Login**: Mobile `9999999999` / Pass `admin123`
    - **Demo User**: Mobile `9876543210` / Pass `password123`

---

## ✅ वेबसाइट तैयार है!
अब आपकी **Reliance Pay** वेबसाइट बिना किसी अतिरिक्त औपचारिकता (Formality) के 100% लाइव और फंक्शनल काम करेगी!

