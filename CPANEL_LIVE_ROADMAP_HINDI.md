# RELIANCE PAY — cPanel / Hostinger पर वेबसाइट लाइव करने का सम्पूर्ण रोडमैप (Step-by-Step Hindi Guide)

यह गाइड आपको Reliance Pay को किसी भी **cPanel**, **Hostinger hPanel**, **GoDaddy**, **Namecheap** या अन्य Apache/LiteSpeed वेब होस्टिंग पर 10 मिनट में 100% लाइव करने का पूरा तरीक़ा बताती है।

---

## 📋 तैयारी (Pre-requisites)
1. **एक डोमेन नाम** (उदा. `reliancepay.in` या `yourdomain.com`)
2. **cPanel / Hostinger वेब होस्टिंग** (PHP 8.1 या अधिक और MySQL सपोर्ट के साथ)
3. **Reliance Pay की ज़िप फ़ाइल** (AI Studio के **Export &rarr; Download as ZIP** बटन से डाउनलोड की गई फ़ाइल)

---

## 🚀 चरण-दर-चरण रोडमैप (Step-by-Step Roadmap)

### चरण 1: cPanel File Manager में फ़ाइल अपलोड करें
1. अपने **cPanel** या **Hostinger hPanel** में लॉगिन करें।
2. **File Manager** (फ़ाइल प्रबंधक) खोलें।
3. बाईं ओर से **`public_html`** फ़ोल्डर पर डबल-क्लिक करके अंदर जाएँ।
   *(नोट: यदि आप किसी सब-डोमेन पर लगा रहे हैं, तो उस सब-डोमेन के रूट फ़ोल्डर में जाएँ)*
4. ऊपर बने **Upload** बटन पर क्लिक करें और अपनी डाउनलोड की गई **ZIP फ़ाइल** को अपलोड करें।
5. अपलोड 100% पूरा (हरा) होने के बाद वापस `public_html` में आएँ।
6. अपलोड की गई ZIP फ़ाइल पर राइट-क्लिक करें और **Extract** (एक्सट्रेक्ट) चुनें।
7. सभी फ़ाइलें `public_html` के अंदर सीधे आ जाएँगी।

> ⚠️ **महत्वपूर्ण टिप (यदि root index.html दिखे):**  
> यदि `public_html` में `dist/` फ़ोल्डर मौजूद है, तो `dist/index.html` को कॉपी करके मुख्य `public_html/index.html` की जगह रिप्लेस कर दें, ताकि बिना Node.js के आपकी साइट सीधे कंपाइल्ड HTML से चले।

---

### चरण 2: MySQL डेटाबेस और यूजर बनाएँ
1. cPanel के मुख्य डैशबोर्ड पर जाएँ और **MySQL Databases** (या **MySQL Database Wizard**) खोलें।
2. **Create New Database**: एक नया नाम दें, जैसे `relpay_db` और **Create Database** दबाएँ।
3. **Add New User**: एक नया यूजरनेम और मज़बूत पासवर्ड बनाएँ:
   - **Username:** जैसे `relpay_user`
   - **Password:** अपना सुरक्षित पासवर्ड दर्ज करें और कहीं नोट कर लें।
   - **Create User** दबाएँ।
4. **Add User To Database**: नीचे स्क्रॉल करें और बनाए गए यूजर को डेटाबेस से जोड़ें:
   - User और Database दोनों चुनें और **Add** दबाएँ।
   - **ALL PRIVILEGES** (सभी अनुमतियाँ) वाले बॉक्स पर टिक करें और **Make Changes** दबाएँ।

---

### चरण 3: 4-स्टेप वेब इंस्टॉलर चलाएँ (Automatic Web Setup)
1. अब अपने मोबाइल या कंप्यूटर के ब्राउज़र में अपनी वेबसाइट का इंस्टॉलर लिंक खोलें:
   ```text
   https://yourdomain.com/install/
   ```
   *(यहाँ `yourdomain.com` की जगह अपना असली डोमेन लिखें)*
2. **Step 1 (Requirements Check):** सिस्टम जाँचेगा कि PHP 8.1+, `pdo_mysql`, `mbstring` और फ़ोल्डर परमिशन्स सही हैं। नीचे **Next Step** पर क्लिक करें।
3. **Step 2 (Database Connection):**
   - **Database Host:** `localhost` (99% होस्टिंग पर यही रहता है)
   - **Database Port:** `3306`
   - **Database Name:** जो डेटाबेस आपने चरण 2 में बनाया (उदा. `cpaneluser_relpay_db`)
   - **Database Username:** जो यूजर आपने बनाया (उदा. `cpaneluser_relpay_user`)
   - **Database Password:** यूजर का पासवर्ड
   - **Test & Connect Database** बटन दबाएँ। (यह तुरंत 16 टेबल बना देगा!)
4. **Step 3 (Admin Account Setup):**
   - एडमिन का मोबाइल नंबर: `8824904563` (या अपना नंबर)
   - एडमिन का पासवर्ड: `Abcd1234` (या नया पासवर्ड)
   - **Save & Finalize** दबाएँ।
5. **Step 4 (Installation Complete):**
   - बधाई! इंस्टॉलर अपने आप `config/database.php` लिख देगा और सुरक्षा के लिए `install.lock` बना देगा।

---

### चरण 4: वेबसाइट खोलें और एडमिन पैनल लॉगिन करें
1. अपने ब्राउज़र में अपनी मुख्य वेबसाइट खोलें:
   ```text
   https://yourdomain.com/
   ```
2. आपकी लग्ज़री डार्क थीम वाली रिलायंस पे वेबसाइट तुरंत खुल जाएगी।
3. **Admin Panel खोलने का तरीक़ा:**
   - लॉगिन पेज पर अपना एडमिन मोबाइल और पासवर्ड डालें।
   - या प्रोफ़ाइल में जाकर **Admin Access** पर क्लिक करके मास्टर एडमिन पिन `999999` दर्ज करें।

---

### चरण 5: UPI QR कोड और पेमेंट सेटिंग्स अपडेट करें
1. एडमिन पैनल में **Settings** (सेटिंग्स) टैब पर जाएँ।
2. **UPI ID:** अपनी बिज़नेस UPI ID दर्ज करें।
3. **QR Code Upload:** अपना Google Pay / PhonePe / Paytm का मर्चेंट QR कोड अपलोड करें।
4. **WhatsApp Link:** अपना सपोर्ट व्हाट्सएप नंबर या लिंक सेट करें।
5. **Save Changes** दबाएँ — अब यूज़र्स को रिचार्ज पेज पर आपका खुद का QR कोड और UPI दिखाई देगा!

---

### चरण 6: SSL (HTTPS) एक्टिवेट करें
1. cPanel में **SSL/TLS Status** मेनू में जाएँ।
2. अपने डोमेन के आगे **Run AutoSSL** दबाएँ।
3. इससे आपके डोमेन पर फ्री हरा ताला (HTTPS) चालू हो जाएगा, जिससे PWA और मोबाइल पेमेंट्स 100% सुरक्षित चलेंगे।

---

## 🔑 मुख्य डिफ़ॉल्ट क्रेडेंशियल्स (Default Login Details)

- **वेबसाइट लिंक:** `https://yourdomain.com/`
- **इंस्टॉलर लिंक:** `https://yourdomain.com/install/`
- **एडमिन मोबाइल:** `8824904563`
- **एडमिन पासवर्ड:** `Abcd1234`
- **मास्टर एडमिन पिन:** `999999` या `8824`
- **सपोर्ट प्रतिनिधि:** Devender Rathore

---

## ❓ सामान्य समस्याओं के त्वरित समाधान (Troubleshooting)

1. **पेज रिफ्रेश करने पर 404 आए तो:**  
   जाँचें कि `public_html/` में `.htaccess` फ़ाइल मौजूद है या नहीं। यदि छिपी हुई है, तो cPanel File Manager की सेटिंग्स (Settings &rarr; Show Hidden Files) चालू करें।
2. **डेटाबेस एरर आए तो:**  
   जाँचें कि आपने यूजर को `ALL PRIVILEGES` दी हैं या नहीं और पासवर्ड सही डाला है।
3. **इंस्टॉलर दोबारा न चले तो:**  
   सुरक्षा के लिए इंस्टॉलेशन के बाद `install/install.lock` बन जाता है। यदि दोबारा री-इंस्टॉल करना हो, तो उस लॉक फ़ाइल को हटाएँ।
