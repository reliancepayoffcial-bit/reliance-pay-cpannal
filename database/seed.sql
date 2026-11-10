-- Reliance Pay - Initial Database Seed SQL
-- Provides default system settings, admin account, demo user, plans, and banners.

INSERT INTO `users` (`user_code`, `mobile`, `name`, `password_hash`, `role`, `balance`, `referral_code`, `status`)
VALUES ('RP999999', '8824904563', 'System Admin', '$2b$10$URYTRiJyo2fweoZlO0WxXe3KUfzUiNUqPWE.r4q/Jb3R1y/cH/T.G', 'admin', 50000.00, 'RPADMIN', 'active')
ON DUPLICATE KEY UPDATE `role`='admin';

INSERT INTO `users` (`user_code`, `mobile`, `name`, `password_hash`, `role`, `balance`, `referral_code`, `status`)
VALUES ('RP100123', '9876543210', 'Rahul Sharma', '$2b$10$JLGPKXTcEfcVUlmQ0WQHEueRntY7cFSCTXc5Wv6xJ9dWq2XaiydBe', 'user', 2500.00, 'RPSHARMA', 'active')
ON DUPLICATE KEY UPDATE `id`=`id`;

INSERT INTO `settings` (`key_name`, `value`) VALUES
('min_deposit', '500'),
('max_deposit', '100000'),
('min_withdrawal', '150'),
('max_withdrawal', '50000'),
('kyc_verification_amount', '99'),
('kyc_payee_name', 'Reliance Pay Official'),
('app_name', 'Reliance Pay'),
('daily_reward_amount', '10'),
('registration_bonus_amount', '50'),
('referral_bonus_amount', '100'),
('whatsapp_name', 'Devender Rathore'),
('whatsapp_number', '919549425930'),
('whatsapp_display', '+91 9549425930'),
('whatsapp_message', 'Hello Devender Rathore, I need help with Reliance Pay.'),
('whatsapp_link', 'https://wa.me/919549425930?text=Hello%20Devender%20Rathore%2C%20I%20need%20help%20with%20Reliance%20Pay.'),
('whatsapp_enabled', 'true'),
('admin_master_pin', '999999'),
('admin_access_mode', 'open')
ON DUPLICATE KEY UPDATE `value`=`value`;

INSERT INTO `plans` (`name`, `category`, `amount`, `duration_days`, `claim_interval_hours`, `daily_return`, `claim_amount`, `total_claims`, `total_return`, `description`, `image_url`, `joined_users_offset`, `status`) VALUES
('RELIANCE INDUSTRIES LIMITED (RIL)', 'Stable', 500.00, 7, 12, 250.00, 125.00, 14, 1750.00, 'Reliance a jio telecom company $100 Billion se $137 Billion (~₹10.7 Lakh Crore se ₹11.4 Lakh Crore) ke beech aanki gayi hai.', '/public/assets/aistudio/Reliance-Industries_e2922df4.webp', 435, 'active'),
('RELIANCE INDUSTRIES LIMITED (RIL)', 'Stable', 3000.00, 7, 12, 1250.00, 625.00, 14, 8750.00, 'Reliance a jio telecom company $100 Billion se $137 Billion (~₹10.7 Lakh Crore se ₹11.4 Lakh Crore) ke beech aanki gayi hai.', '/public/assets/aistudio/Reliance-Industries_e2922df4.webp', 0, 'active'),
('NAYARA FUEL ENERGY STATION ( NFES )', 'VIP Welfare', 1000.00, 15, 12, 500.00, 250.00, 30, 7500.00, 'Commercial fuel energy station and high-volume retail network with rapid dividend distribution.', '/public/assets/aistudio/file_00000000caf481fab640fb1171314240_9b4d8723.png', 0, 'active'),
('NAYARA ENERGY STATION { NES }', 'High Return', 2000.00, 15, 12, 1200.00, 600.00, 30, 18000.00, 'Samay India ki sabse badi private fuel retailer company hai.7,000+ Petrol Pumps', '/public/assets/aistudio/file_00000000ff9c81fa999c411a38489203_1885616d.png', 0, 'active'),
('RELIANCE INDUSTRIES LIMITED (RIL)', 'Stable', 500.00, 10, 12, 250.00, 125.00, 20, 2500.00, 'Reliance a jio telecom company $100 Billion se $137 Billion (~₹10.7 Lakh Crore se ₹11.4 Lakh Crore) ke beech aanki gayi hai.', '/public/assets/aistudio/Reliance-Industries_e2922df4.webp', 0, 'active'),
('RELIANCE INDUSTRIES LIMITED (RIL)', 'High Return', 5000.00, 7, 12, 3200.00, 1600.00, 14, 22400.00, 'Reliance a jio telecom company $100 Billion se $137 Billion (~₹10.7 Lakh Crore se ₹11.4 Lakh Crore) ke beech aanki gayi hai.', '/public/assets/aistudio/Reliance-Industries_e2922df4.webp', 0, 'active'),
('ULTRA MEGA THERMAL CORE VIP', 'VIP Elite', 10000.00, 20, 12, 3300.00, 1650.00, 40, 66000.00, 'Executive energy dividend sharing pool with accelerated pay rates.', '/public/assets/aistudio/file_00000000650c81fdb97432eea241cd83_9a570f4c.png', 0, 'active'),
('ULTRA MEGA THERMAL CORE VVIP', 'VIP Elite', 20000.00, 20, 12, 6600.00, 3300.00, 40, 132000.00, 'Executive energy dividend sharing pool with accelerated pay rates.', '/public/assets/aistudio/file_00000000650c81fdb97432eea241cd83_9a570f4c.png', 0, 'active');

INSERT INTO `banners` (`title`, `image_url`, `link_url`, `sort_order`, `status`) VALUES
('Reliance Industry Investment - High Profit', '/public/assets/aistudio/IMG_20260926_124927_b5f9e492.png', '#plans', 1, 'active'),
('Reliance Pay Official Team - Har Bhugtan Ab Aasan', '/public/assets/aistudio/file_00000000276c81fa8ee7ba63afc318b1_b8b36460.png', '#support', 2, 'active'),
('Reliance Gigawatt Flash Core 2.1', '/public/assets/aistudio/file_00000000650c81fdb97432eea241cd83_9a570f4c.png', '#plans', 3, 'active'),
('Jio Reliance Industries (JRIL) 350% ROI', '/public/assets/aistudio/file_00000000d91082108254f27654b69bad_de478902.png', '#plans', 4, 'active'),
('Nayara Fuel Energy Station (NFES) 750% ROI', '/public/assets/aistudio/file_00000000caf481fab640fb1171314240_9b4d8723.png', '#plans', 5, 'active'),
('Nayara Energy High Return 420% ROI', '/public/assets/aistudio/file_00000000ff9c81fa999c411a38489203_1885616d.png', '#plans', 6, 'active');
