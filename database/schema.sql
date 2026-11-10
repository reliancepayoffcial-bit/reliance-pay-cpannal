-- Reliance Pay - Production MySQL / MariaDB Database Schema
-- Compatible with PHP 8.1+ & Hostinger / Standard cPanel Hosting

SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_code` VARCHAR(50) UNIQUE,
  `mobile` VARCHAR(20) UNIQUE,
  `name` VARCHAR(100),
  `password_hash` VARCHAR(255),
  `role` VARCHAR(20) DEFAULT 'user',
  `balance` DECIMAL(15, 2) DEFAULT 0.00,
  `deposited` DECIMAL(15, 2) DEFAULT 0.00,
  `withdrawn` DECIMAL(15, 2) DEFAULT 0.00,
  `withdrawal_pin` VARCHAR(20) DEFAULT '1234',
  `kyc_status` VARCHAR(50) DEFAULT 'Not Submitted',
  `referral_code` VARCHAR(50) UNIQUE,
  `referred_by` VARCHAR(50) DEFAULT NULL,
  `upi_id` VARCHAR(100) DEFAULT NULL,
  `bank_details` TEXT DEFAULT NULL,
  `profile_photo` TEXT DEFAULT NULL,
  `kyc_required` TINYINT(1) DEFAULT 0,
  `kyc_verification_status` VARCHAR(50) DEFAULT 'Not Required',
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `settings` (
  `key_name` VARCHAR(100) PRIMARY KEY,
  `value` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `plans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150),
  `category` VARCHAR(50) DEFAULT 'Stable',
  `amount` DECIMAL(15, 2),
  `duration_days` INT,
  `claim_interval_hours` INT DEFAULT 12,
  `daily_return` DECIMAL(15, 2),
  `claim_amount` DECIMAL(15, 2) DEFAULT NULL,
  `total_claims` INT DEFAULT NULL,
  `total_return` DECIMAL(15, 2),
  `description` TEXT DEFAULT NULL,
  `image_url` TEXT DEFAULT NULL,
  `joined_users_offset` INT DEFAULT 0,
  `layout` VARCHAR(50) DEFAULT 'full',
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_plans` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `plan_id` INT,
  `plan_name` VARCHAR(150) DEFAULT NULL,
  `category` VARCHAR(50) DEFAULT NULL,
  `amount` DECIMAL(15, 2),
  `daily_return` DECIMAL(15, 2),
  `claim_amount` DECIMAL(15, 2) DEFAULT NULL,
  `claim_interval_hours` INT DEFAULT 12,
  `total_claims` INT DEFAULT NULL,
  `claims_completed` INT DEFAULT 0,
  `total_return` DECIMAL(15, 2),
  `earned_so_far` DECIMAL(15, 2) DEFAULT 0.00,
  `status` VARCHAR(20) DEFAULT 'active',
  `last_claim_at` DATETIME DEFAULT NULL,
  `next_claim_at` DATETIME DEFAULT NULL,
  `expires_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dividend_claims` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `user_plan_id` INT,
  `plan_name` VARCHAR(150),
  `claim_amount` DECIMAL(15, 2),
  `claimed_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `type` VARCHAR(50),
  `amount` DECIMAL(15, 2),
  `status` VARCHAR(20) DEFAULT 'pending',
  `reference_no` VARCHAR(100) DEFAULT NULL,
  `details` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `deposits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `amount` DECIMAL(15, 2),
  `utr` VARCHAR(100) UNIQUE,
  `screenshot` TEXT DEFAULT NULL,
  `idempotency_key` VARCHAR(100) DEFAULT NULL,
  `reference_no` VARCHAR(100) DEFAULT NULL,
  `risk_flags` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `status` VARCHAR(20) DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `withdrawals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `amount` DECIMAL(15, 2),
  `method` VARCHAR(50) DEFAULT 'UPI',
  `account_details` TEXT DEFAULT NULL,
  `status` VARCHAR(20) DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `banners` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255),
  `image_url` TEXT,
  `link_url` TEXT DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `status` VARCHAR(20) DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `kyc` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNIQUE,
  `full_name` VARCHAR(100),
  `id_type` VARCHAR(50),
  `id_number` VARCHAR(100),
  `document_path` TEXT,
  `status` VARCHAR(20) DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_kyc` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNIQUE,
  `aadhaar_name` VARCHAR(100),
  `aadhaar_number` VARCHAR(20),
  `utr_id` VARCHAR(100),
  `status` VARCHAR(50) DEFAULT 'Submitted',
  `rejection_reason` TEXT DEFAULT NULL,
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `referrals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `referrer_id` INT,
  `referee_id` INT,
  `bonus_amount` DECIMAL(15, 2),
  `status` VARCHAR(20) DEFAULT 'paid',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`referrer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`referee_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `scratch_cards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `reward_amount` DECIMAL(15, 2),
  `is_scratched` TINYINT(1) DEFAULT 0,
  `status` VARCHAR(20) DEFAULT 'unclaimed',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `daily_rewards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `reward_amount` DECIMAL(15, 2),
  `streak_day` INT DEFAULT 1,
  `date` VARCHAR(10),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (`user_id`, `date`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `transaction_id` VARCHAR(100) DEFAULT NULL,
  `action` VARCHAR(100),
  `old_status` VARCHAR(50) DEFAULT NULL,
  `new_status` VARCHAR(50) DEFAULT NULL,
  `amount` DECIMAL(15, 2) DEFAULT 0.00,
  `actor` VARCHAR(50) DEFAULT 'system',
  `details` TEXT DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payment_webhooks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_id` VARCHAR(100) UNIQUE,
  `gateway_order_id` VARCHAR(100) DEFAULT NULL,
  `utr` VARCHAR(100) DEFAULT NULL,
  `amount` DECIMAL(15, 2) DEFAULT NULL,
  `payload` TEXT DEFAULT NULL,
  `status` VARCHAR(20) DEFAULT 'processed',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_code` VARCHAR(50) UNIQUE,
  `user_id` INT,
  `user_name` VARCHAR(100) DEFAULT NULL,
  `user_phone` VARCHAR(20) DEFAULT NULL,
  `category` VARCHAR(50) DEFAULT 'General',
  `subject` VARCHAR(255) DEFAULT NULL,
  `message` TEXT,
  `chat_transcript` TEXT DEFAULT NULL,
  `status` VARCHAR(20) DEFAULT 'open',
  `admin_reply` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
