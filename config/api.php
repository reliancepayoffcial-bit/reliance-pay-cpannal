<?php
/**
 * Reliance Pay - Server-Side External API Configuration & Credentials Store
 * Secure server-side store for API keys, Webhooks, and Integration Secrets.
 * IMPORTANT: Keep this file protected on cPanel. NEVER expose these keys to frontend JS.
 */

return [
    // 1. Google Gemini AI API Configuration
    'gemini' => [
        'api_key' => getenv('GEMINI_API_KEY') ?: '', // Get from environment or enter key here
        'model' => 'gemini-1.5-flash',
        'api_url' => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
    ],

    // 2. Payment Gateway & UPI Integration Configuration
    'payment_gateway' => [
        'mode' => 'sandbox', // 'sandbox' or 'live'
        'merchant_id' => getenv('PAYMENT_MERCHANT_ID') ?: '',
        'api_key' => getenv('PAYMENT_API_KEY') ?: '',
        'api_secret' => getenv('PAYMENT_API_SECRET') ?: '',
        'webhook_secret' => getenv('PAYMENT_WEBHOOK_SECRET') ?: '',
        'default_upi_vpa' => 'paytm.s3ppxue@pty'
    ],

    // 3. SMS / OTP Gateway Configuration (e.g. Fast2SMS / MSG91 / Twilio)
    'sms_gateway' => [
        'enabled' => false,
        'provider' => 'fast2sms',
        'api_key' => getenv('SMS_API_KEY') ?: '',
        'sender_id' => 'RELPAY'
    ],

    // 4. Identity & Aadhaar Verification API (e.g. Cashfree Verification / Karza)
    'kyc_verification' => [
        'enabled' => false,
        'provider' => 'cashfree',
        'client_id' => getenv('KYC_CLIENT_ID') ?: '',
        'client_secret' => getenv('KYC_CLIENT_SECRET') ?: ''
    ]
];
