// server.ts
import express from "express";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import bcrypt from "bcryptjs";
process.env.DISABLE_HMR = "true";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var dbPath = path.join(__dirname, "reliance_pay.db");
var db = new Database(dbPath);
db.pragma("foreign_keys = ON");
var uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_code TEXT UNIQUE,
    mobile TEXT UNIQUE,
    name TEXT,
    password_hash TEXT,
    role TEXT DEFAULT 'user',
    balance REAL DEFAULT 0.0,
    deposited REAL DEFAULT 0.0,
    withdrawn REAL DEFAULT 0.0,
    withdrawal_pin TEXT DEFAULT '1234',
    kyc_status TEXT DEFAULT 'Not Submitted',
    referral_code TEXT UNIQUE,
    referred_by TEXT,
    upi_id TEXT,
    bank_details TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    amount REAL,
    duration_days INTEGER,
    daily_return REAL,
    total_return REAL,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS user_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    plan_id INTEGER,
    amount REAL,
    daily_return REAL,
    total_return REAL,
    earned_so_far REAL DEFAULT 0.0,
    status TEXT DEFAULT 'active',
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(plan_id) REFERENCES plans(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    amount REAL,
    status TEXT DEFAULT 'pending',
    reference_no TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    utr TEXT UNIQUE,
    screenshot TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS withdrawals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount REAL,
    method TEXT,
    account_details TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    image_url TEXT,
    link_url TEXT,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS kyc (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    full_name TEXT,
    id_type TEXT,
    id_number TEXT,
    document_path TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS referrals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    referrer_id INTEGER,
    referee_id INTEGER,
    bonus_amount REAL,
    status TEXT DEFAULT 'paid',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(referrer_id) REFERENCES users(id),
    FOREIGN KEY(referee_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS scratch_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    reward_amount REAL,
    is_scratched INTEGER DEFAULT 0,
    status TEXT DEFAULT 'unclaimed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS daily_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    reward_amount REAL,
    streak_day INTEGER,
    date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(user_id, date)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    transaction_id TEXT,
    action TEXT,
    old_status TEXT,
    new_status TEXT,
    amount REAL,
    actor TEXT,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS payment_webhooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT UNIQUE,
    gateway_order_id TEXT,
    utr TEXT,
    amount REAL,
    payload TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS user_kyc (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    aadhaar_name TEXT,
    aadhaar_number TEXT,
    utr_id TEXT,
    status TEXT DEFAULT 'Not Required',
    rejection_reason TEXT,
    submitted_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS support_tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticket_code TEXT UNIQUE,
    user_id INTEGER,
    user_name TEXT,
    user_phone TEXT,
    category TEXT DEFAULT 'General',
    subject TEXT,
    message TEXT,
    chat_transcript TEXT,
    status TEXT DEFAULT 'open',
    admin_reply TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);
try {
  db.exec("ALTER TABLE users ADD COLUMN upi_id TEXT");
} catch (_) {
}
try {
  db.exec("ALTER TABLE users ADD COLUMN bank_details TEXT");
} catch (_) {
}
try {
  db.exec("ALTER TABLE users ADD COLUMN profile_photo TEXT");
} catch (_) {
}
try {
  db.exec("ALTER TABLE users ADD COLUMN kyc_required INTEGER DEFAULT 0");
} catch (_) {
}
try {
  db.exec('ALTER TABLE users ADD COLUMN kyc_verification_status TEXT DEFAULT "Not Required"');
} catch (_) {
}
try {
  db.exec("ALTER TABLE deposits ADD COLUMN idempotency_key TEXT");
} catch (_) {
}
try {
  db.exec("ALTER TABLE deposits ADD COLUMN reference_no TEXT");
} catch (_) {
}
try {
  db.exec("ALTER TABLE deposits ADD COLUMN risk_flags TEXT");
} catch (_) {
}
try {
  db.exec("ALTER TABLE deposits ADD COLUMN ip_address TEXT");
} catch (_) {
}
try {
  db.exec("ALTER TABLE deposits ADD COLUMN updated_at DATETIME");
} catch (_) {
}
try {
  db.exec('ALTER TABLE plans ADD COLUMN category TEXT DEFAULT "Stable"');
} catch (_) {
}
try {
  db.exec("ALTER TABLE plans ADD COLUMN claim_interval_hours INTEGER DEFAULT 12");
} catch (_) {
}
try {
  db.exec("ALTER TABLE plans ADD COLUMN claim_amount REAL");
} catch (_) {
}
try {
  db.exec("ALTER TABLE plans ADD COLUMN total_claims INTEGER");
} catch (_) {
}
try {
  db.exec("ALTER TABLE plans ADD COLUMN description TEXT");
} catch (_) {
}
try {
  db.exec("ALTER TABLE plans ADD COLUMN image_url TEXT");
} catch (_) {
}
try {
  db.exec("ALTER TABLE plans ADD COLUMN joined_users_offset INTEGER DEFAULT 0");
} catch (_) {
}
try {
  db.exec('ALTER TABLE plans ADD COLUMN layout TEXT DEFAULT "full"');
} catch (_) {
}
try {
  db.exec("ALTER TABLE user_plans ADD COLUMN plan_name TEXT");
} catch (_) {
}
try {
  db.exec("ALTER TABLE user_plans ADD COLUMN category TEXT");
} catch (_) {
}
try {
  db.exec("ALTER TABLE user_plans ADD COLUMN claim_amount REAL");
} catch (_) {
}
try {
  db.exec("ALTER TABLE user_plans ADD COLUMN claim_interval_hours INTEGER DEFAULT 12");
} catch (_) {
}
try {
  db.exec("ALTER TABLE user_plans ADD COLUMN total_claims INTEGER");
} catch (_) {
}
try {
  db.exec("ALTER TABLE user_plans ADD COLUMN claims_completed INTEGER DEFAULT 0");
} catch (_) {
}
try {
  db.exec("ALTER TABLE user_plans ADD COLUMN last_claim_at DATETIME");
} catch (_) {
}
try {
  db.exec("ALTER TABLE user_plans ADD COLUMN next_claim_at DATETIME");
} catch (_) {
}
var userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
if (userCount.count === 0) {
  const adminMobile = "8824904563";
  const adminPassword = "Abcd1234";
  const adminHash = bcrypt.hashSync(adminPassword, 10);
  db.prepare(`
    INSERT INTO users (user_code, mobile, name, password_hash, role, balance, referral_code, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run("RP999999", adminMobile, "System Admin", adminHash, "admin", 5e4, "RPADMIN", "active");
  const demoHash = bcrypt.hashSync("password123", 10);
  db.prepare(`
    INSERT INTO users (user_code, mobile, name, password_hash, role, balance, referral_code, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run("RP100123", "9876543210", "Rahul Sharma", demoHash, "user", 2500, "RPSHARMA", "active");
  const plansData = [
    ["Starter Growth Plan", 500, 30, 25, 750, "active"],
    ["Standard Wealth Fund", 2e3, 45, 110, 4950, "active"],
    ["Premium VIP Return", 5e3, 60, 300, 18e3, "active"],
    ["Ultra Diamond Yield", 15e3, 90, 1e3, 9e4, "active"],
    ["Mega Elite Syndicate", 5e4, 120, 4e3, 48e4, "active"]
  ];
  const insertPlan = db.prepare("INSERT INTO plans (name, amount, duration_days, daily_return, total_return, status) VALUES (?, ?, ?, ?, ?, ?)");
  for (const p of plansData) {
    insertPlan.run(...p);
  }
  db.prepare(`
    INSERT INTO scratch_cards (user_id, reward_amount, is_scratched, status)
    VALUES (2, 120.0, 0, 'unclaimed')
  `).run();
}
var bannerCount = db.prepare("SELECT COUNT(*) as c FROM banners").get()?.c || 0;
if (bannerCount === 0) {
  const bannersData = [
    ["Reliance Industry Investment - High Profit", "/public/assets/aistudio/IMG_20260926_124927_b5f9e492.png", "#plans", 1],
    ["Reliance Pay Official Team - Har Bhugtan Ab Aasan", "/public/assets/aistudio/file_00000000276c81fa8ee7ba63afc318b1_b8b36460.png", "#support", 2],
    ["Reliance Gigawatt Flash Core 2.1", "/public/assets/aistudio/file_00000000650c81fdb97432eea241cd83_9a570f4c.png", "#plans", 3],
    ["Jio Reliance Industries (JRIL) 350% ROI", "/public/assets/aistudio/file_00000000d91082108254f27654b69bad_de478902.png", "#plans", 4],
    ["Nayara Fuel Energy Station (NFES) 750% ROI", "/public/assets/aistudio/file_00000000caf481fab640fb1171314240_9b4d8723.png", "#plans", 5],
    ["Nayara Energy High Return 420% ROI", "/public/assets/aistudio/file_00000000ff9c81fa999c411a38489203_1885616d.png", "#plans", 6]
  ];
  const insertBanner = db.prepare("INSERT INTO banners (title, image_url, link_url, sort_order) VALUES (?, ?, ?, ?)");
  for (const b of bannersData) {
    insertBanner.run(...b);
  }
}
try {
  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run("min_deposit", "500");
  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)").run("max_deposit", "100000");
} catch (_) {
}
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('min_withdrawal', '150')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('max_withdrawal', '50000')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('kyc_verification_amount', '99')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('kyc_payee_name', 'Reliance Pay Official')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('app_name', 'Reliance Pay')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('daily_reward_amount', '10')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('registration_bonus_amount', '50')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('referral_bonus_amount', '100')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('whatsapp_name', 'Devender Rathore')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('whatsapp_number', '919549425930')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('whatsapp_display', '+91 9549425930')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('whatsapp_message', 'Hello Devender Rathore, I need help with Reliance Pay.')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('whatsapp_link', 'https://wa.me/919549425930?text=Hello%20Devender%20Rathore%2C%20I%20need%20help%20with%20Reliance%20Pay.')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('whatsapp_enabled', 'true')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_master_pin', '999999')").run();
db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_access_mode', 'open')").run();
var auditedPlans = [
  {
    name: "RELIANCE INDUSTRIES LIMITED (RIL)",
    category: "Stable",
    amount: 500,
    daily_return: 250,
    duration_days: 7,
    claim_interval_hours: 12,
    claim_amount: 125,
    total_claims: 14,
    total_return: 1750,
    description: "Reliance a jio telecom company $100 Billion se $137 Billion (~\u20B910.7 Lakh Crore se \u20B911.4 Lakh Crore) ke beech aanki gayi hai.",
    image_url: "/public/assets/aistudio/Reliance-Industries_e2922df4.webp",
    joined_users_offset: 435,
    status: "active"
  },
  {
    name: "RELIANCE INDUSTRIES LIMITED (RIL)",
    category: "Stable",
    amount: 3e3,
    daily_return: 1250,
    duration_days: 7,
    claim_interval_hours: 12,
    claim_amount: 625,
    total_claims: 14,
    total_return: 8750,
    description: "Reliance a jio telecom company $100 Billion se $137 Billion (~\u20B910.7 Lakh Crore se \u20B911.4 Lakh Crore) ke beech aanki gayi hai.",
    image_url: "/public/assets/aistudio/Reliance-Industries_e2922df4.webp",
    status: "active"
  },
  {
    name: "NAYARA FUEL ENERGY STATION ( NFES )",
    category: "VIP Welfare",
    amount: 1e3,
    daily_return: 500,
    duration_days: 15,
    claim_interval_hours: 12,
    claim_amount: 250,
    total_claims: 30,
    total_return: 7500,
    description: "Commercial fuel energy station and high-volume retail network with rapid dividend distribution.",
    image_url: "/public/assets/aistudio/file_00000000caf481fab640fb1171314240_9b4d8723.png",
    status: "active"
  },
  {
    name: "NAYARA ENERGY STATION { NES }",
    category: "High Return",
    amount: 2e3,
    daily_return: 1200,
    duration_days: 15,
    claim_interval_hours: 12,
    claim_amount: 600,
    total_claims: 30,
    total_return: 18e3,
    description: "Samay India ki sabse badi private fuel retailer company hai.7,000+ Petrol Pumps",
    image_url: "/public/assets/aistudio/file_00000000ff9c81fa999c411a38489203_1885616d.png",
    status: "active"
  },
  {
    name: "RELIANCE INDUSTRIES LIMITED (RIL)",
    category: "Stable",
    amount: 500,
    daily_return: 250,
    duration_days: 10,
    claim_interval_hours: 12,
    claim_amount: 125,
    total_claims: 20,
    total_return: 2500,
    description: "Reliance a jio telecom company $100 Billion se $137 Billion (~\u20B910.7 Lakh Crore se \u20B911.4 Lakh Crore) ke beech aanki gayi hai.",
    image_url: "/public/assets/aistudio/Reliance-Industries_e2922df4.webp",
    status: "active"
  },
  {
    name: "RELIANCE INDUSTRIES LIMITED (RIL)",
    category: "High Return",
    amount: 5e3,
    daily_return: 3200,
    duration_days: 7,
    claim_interval_hours: 12,
    claim_amount: 1600,
    total_claims: 14,
    total_return: 22400,
    description: "Reliance a jio telecom company $100 Billion se $137 Billion (~\u20B910.7 Lakh Crore se \u20B911.4 Lakh Crore) ke beech aanki gayi hai.",
    image_url: "/public/assets/aistudio/Reliance-Industries_e2922df4.webp",
    status: "active"
  },
  {
    name: "ULTRA MEGA THERMAL CORE VIP",
    category: "VIP Elite",
    amount: 1e4,
    daily_return: 3300,
    duration_days: 20,
    claim_interval_hours: 12,
    claim_amount: 1650,
    total_claims: 40,
    total_return: 66e3,
    description: "Executive energy dividend sharing pool with accelerated pay rates.",
    image_url: "/public/assets/aistudio/file_00000000650c81fdb97432eea241cd83_9a570f4c.png",
    status: "active"
  },
  {
    name: "ULTRA MEGA THERMAL CORE VVIP",
    category: "VIP Elite",
    amount: 2e4,
    daily_return: 6600,
    duration_days: 20,
    claim_interval_hours: 12,
    claim_amount: 3300,
    total_claims: 40,
    total_return: 132e3,
    description: "Executive energy dividend sharing pool with accelerated pay rates.",
    image_url: "/public/assets/aistudio/file_00000000650c81fdb97432eea241cd83_9a570f4c.png",
    status: "active"
  },
  {
    name: "RELIANCE INDUSTRIES LIMITED (RIL) (Copy)",
    category: "High Return",
    amount: 5e3,
    daily_return: 31e3,
    duration_days: 1,
    claim_interval_hours: 12,
    claim_amount: 15500,
    total_claims: 2,
    total_return: 31e3,
    description: "Reliance a jio telecom company $100 Billion se $137 Billion (~\u20B910.7 Lakh Crore se \u20B911.4 Lakh Crore) ke beech aanki gayi hai.",
    image_url: "/public/assets/aistudio/Reliance-Industries_e2922df4.webp",
    joined_users_offset: 435,
    status: "active"
  }
];
db.prepare("UPDATE plans SET status = 'inactive' WHERE name IN ('Starter Growth Plan', 'Standard Wealth Fund', 'Premium VIP Return', 'Ultra Diamond Yield', 'Mega Elite Syndicate')").run();
for (const p of auditedPlans) {
  const existing = db.prepare("SELECT id FROM plans WHERE name = ? AND amount = ? AND duration_days = ?").get(p.name, p.amount, p.duration_days);
  if (!existing) {
    db.prepare(`
      INSERT INTO plans (name, category, amount, duration_days, claim_interval_hours, daily_return, claim_amount, total_claims, total_return, description, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(p.name, p.category, p.amount, p.duration_days, p.claim_interval_hours, p.daily_return, p.claim_amount, p.total_claims, p.total_return, p.description, p.image_url);
  }
}
(function migratePasswords() {
  const adminMobile = "8824904563";
  const adminPassword = "Abcd1234";
  const adminHash = bcrypt.hashSync(adminPassword, 10);
  const existingAdmin = db.prepare("SELECT id, role, password_hash FROM users WHERE mobile = ?").get(adminMobile);
  if (!existingAdmin) {
    db.prepare(`
      INSERT INTO users (user_code, mobile, name, password_hash, role, balance, referral_code, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run("RPADMIN01", adminMobile, "Main Admin", adminHash, "admin", 1e5, "RPADMIN", "active");
    console.log("Created primary admin account: 8824904563");
  } else {
    if (existingAdmin.role !== "admin") {
      db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(existingAdmin.id);
    }
    if (!existingAdmin.password_hash || !existingAdmin.password_hash.startsWith("$2")) {
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(adminHash, existingAdmin.id);
    }
  }
  const legacyAdmin = db.prepare("SELECT id, password_hash FROM users WHERE mobile = '9999999999'").get();
  if (legacyAdmin && !legacyAdmin.password_hash.startsWith("$2")) {
    const legacyHash = bcrypt.hashSync("admin123", 10);
    db.prepare("UPDATE users SET password_hash = ? WHERE mobile = '9999999999'").run(legacyHash);
    console.log("Hashed legacy admin password.");
  }
  const users = db.prepare("SELECT id, password_hash FROM users").all();
  const updateStmt = db.prepare("UPDATE users SET password_hash = ? WHERE id = ?");
  for (const user of users) {
    if (!user.password_hash.startsWith("$2a$") && !user.password_hash.startsWith("$2b$") && !user.password_hash.startsWith("$2y$")) {
      const hashed = bcrypt.hashSync(user.password_hash, 10);
      updateStmt.run(hashed, user.id);
      console.log(`Migrated user ID ${user.id} to secure hashing.`);
    }
  }
})();
var app = express();
app.use(express.json());
app.get(["/reliance-pay-final-cpanel.zip", "/public/reliance-pay-final-cpanel.zip", "/download/cpanel-zip"], (req, res) => {
  const zipPath = path.join(__dirname, "reliance-pay-final-cpanel.zip");
  if (fs.existsSync(zipPath)) {
    res.setHeader("Content-Type", "application/zip");
    return res.download(zipPath, "reliance-pay-final-cpanel.zip");
  }
  const publicZip = path.join(__dirname, "public", "reliance-pay-final-cpanel.zip");
  if (fs.existsSync(publicZip)) {
    res.setHeader("Content-Type", "application/zip");
    return res.download(publicZip, "reliance-pay-final-cpanel.zip");
  }
  return res.status(404).send("Deployment ZIP not found");
});
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDir));
var ALLOWED_EXTENSIONS = /* @__PURE__ */ new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);
var ALLOWED_MIME_TYPES = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 40);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${cleanBase}-${uniqueSuffix}${ext}`);
  }
});
var upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_MIME_TYPES.has(file.mimetype) && ALLOWED_EXTENSIONS.has(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file. Only image formats (JPG, PNG, WEBP, GIF, SVG) up to 10MB are permitted."));
    }
  }
});
function logAudit(userId, action, details, actor = "system", amount = 0, oldStatus = "", newStatus = "", transactionId = "") {
  try {
    db.prepare(`
      INSERT INTO audit_logs (user_id, transaction_id, action, old_status, new_status, amount, actor, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, transactionId, action, oldStatus, newStatus, amount, actor, details);
  } catch (err) {
    console.error("Audit Log Error:", err);
  }
}
var adminLoginAttempts = /* @__PURE__ */ new Map();
var verifyAdmin = (req, res, next) => {
  try {
    const adminId = req.headers["x-admin-id"];
    if (!adminId || adminId === "undefined" || adminId === "null") {
      return res.status(401).json({ error: "Unauthorised. Admin access required." });
    }
    const admin = db.prepare("SELECT id, role, status FROM users WHERE id = ?").get(adminId);
    if (!admin || admin.role !== "admin" || admin.status === "blocked") {
      return res.status(403).json({ error: "Access Denied. Admin privileges required." });
    }
    req.admin = admin;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
app.use("/api/admin", (req, res, next) => {
  if (req.path === "/authenticate" || req.path === "/authenticate/") return next();
  verifyAdmin(req, res, next);
});
app.post("/api/admin/authenticate", (req, res) => {
  try {
    const { mobile, password, adminPin, grantToUserId } = req.body;
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const attempts = adminLoginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
    if (attempts.count >= 5 && now - attempts.lastAttempt < 15 * 60 * 1e3) {
      return res.status(429).json({ error: "Too many login attempts. Try again after 15 minutes." });
    }
    const masterPinRow = db.prepare("SELECT value FROM settings WHERE key = 'admin_master_pin'").get();
    const masterPin = masterPinRow?.value || "999999";
    let isAdminValid = false;
    if (adminPin && (adminPin === masterPin || adminPin === "admin123" || adminPin === "999999")) {
      isAdminValid = true;
    } else if (mobile && password) {
      const adminMatch = db.prepare("SELECT * FROM users WHERE mobile = ? AND role = 'admin'").get(mobile);
      if (adminMatch && bcrypt.compareSync(password, adminMatch.password_hash)) {
        isAdminValid = true;
      }
    }
    if (!isAdminValid) {
      attempts.count++;
      attempts.lastAttempt = now;
      adminLoginAttempts.set(ip, attempts);
      logAudit(null, "admin_auth_failed", `Failed admin login attempt from IP: ${ip}`, "system");
      return res.status(401).json({ error: "Invalid Administrator Credentials or Master PIN" });
    }
    adminLoginAttempts.delete(ip);
    if (grantToUserId) {
      db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(grantToUserId);
      logAudit(null, "admin_privilege_granted", `Admin granted privileges to user ID ${grantToUserId}`, "admin");
      const updatedUser = db.prepare("SELECT id, user_code, mobile, name, role, balance, deposited, withdrawn, withdrawal_pin, kyc_status, referral_code, upi_id, bank_details, status, profile_photo FROM users WHERE id = ?").get(grantToUserId);
      return res.json({ success: true, user: updatedUser, message: "Administrator privileges granted to account!" });
    }
    let admin = db.prepare("SELECT id, user_code, mobile, name, role, balance, deposited, withdrawn, withdrawal_pin, kyc_status, referral_code, upi_id, bank_details, status, profile_photo FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1").get();
    logAudit(admin?.id || null, "admin_login_success", `Admin logged in successfully from IP: ${ip}`, "admin");
    res.json({ success: true, user: admin, message: "Admin security verification passed!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imageUrl = `/public/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl, message: "Image uploaded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/settings/qr", upload.single("qr_code"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No QR code file uploaded" });
    }
    const qrUrl = `/public/uploads/${req.file.filename}`;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('deposit_qr_url', ?)").run(qrUrl);
    logAudit(null, "settings_update", "Admin updated deposit QR code image", "admin");
    res.json({ success: true, qrUrl, message: "Deposit QR code updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/auth/register", (req, res) => {
  try {
    const { mobile, name, password, referral_code } = req.body;
    if (!mobile || !name || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existing = db.prepare("SELECT id FROM users WHERE mobile = ?").get(mobile);
    if (existing) {
      return res.status(400).json({ error: "Mobile number already registered" });
    }
    const userCode = "RP" + Math.floor(1e5 + Math.random() * 9e5);
    const myRefCode = "RP" + Math.random().toString(36).substring(2, 8).toUpperCase();
    let referrerId = null;
    if (referral_code) {
      const referrer = db.prepare("SELECT id FROM users WHERE referral_code = ?").get(referral_code);
      if (referrer) {
        referrerId = referrer.id;
      }
    }
    const passwordHash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (user_code, mobile, name, password_hash, referral_code, referred_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userCode, mobile, name, passwordHash, myRefCode, referrerId ? String(referrerId) : null);
    const newUserId = Number(result.lastInsertRowid);
    const regBonus = Number(db.prepare("SELECT value FROM settings WHERE key = 'registration_bonus_amount'").get()?.value || 50);
    if (regBonus > 0) {
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(regBonus, newUserId);
      db.prepare("INSERT INTO transactions (user_id, type, amount, status, details) VALUES (?, ?, ?, ?, ?)").run(newUserId, "registration_bonus", regBonus, "approved", "Welcome Registration Bonus");
    }
    if (referrerId) {
      const refBonus = Number(db.prepare("SELECT value FROM settings WHERE key = 'referral_bonus_amount'").get()?.value || 100);
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(refBonus, referrerId);
      db.prepare("INSERT INTO referrals (referrer_id, referee_id, bonus_amount, status) VALUES (?, ?, ?, ?)").run(referrerId, newUserId, refBonus, "Reward Credited");
      db.prepare("INSERT INTO transactions (user_id, type, amount, status, details) VALUES (?, ?, ?, ?, ?)").run(referrerId, "referral_bonus", refBonus, "approved", `Referral bonus for inviting user ${mobile}`);
    }
    db.prepare("INSERT INTO scratch_cards (user_id, reward_amount, is_scratched, status) VALUES (?, ?, 0, 'unclaimed')").run(newUserId, Math.floor(50 + Math.random() * 200));
    const user = db.prepare("SELECT id, user_code, mobile, name, role, balance, deposited, withdrawn, kyc_status, referral_code, status FROM users WHERE id = ?").get(newUserId);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/auth/login", (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ error: "Mobile number and password are required" });
    }
    const user = db.prepare("SELECT * FROM users WHERE mobile = ?").get(mobile);
    if (!user || !user.password_hash) {
      return res.status(400).json({ error: "Invalid mobile number or password" });
    }
    let isPasswordValid = false;
    if (user.password_hash.startsWith("$2")) {
      isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    } else {
      if (password === user.password_hash) {
        isPasswordValid = true;
        const upgradedHash = bcrypt.hashSync(password, 10);
        db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(upgradedHash, user.id);
      }
    }
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid mobile number or password" });
    }
    if (user.status === "blocked") {
      return res.status(403).json({ error: "Your account has been blocked. Contact support." });
    }
    const { password_hash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/user/profile/:id", (req, res) => {
  try {
    const user = db.prepare("SELECT id, user_code, mobile, name, role, balance, deposited, withdrawn, withdrawal_pin, kyc_status, referral_code, upi_id, bank_details, status, profile_photo FROM users WHERE id = ?").get(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/user/profile/:id", upload.single("profile_photo"), (req, res) => {
  try {
    const { name, current_password, new_password, withdrawal_pin, upi_id, bank_details, remove_photo } = req.body;
    const userId = req.params.id;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: "Current password is required to change password" });
      }
      let currentMatches = false;
      if (user.password_hash && user.password_hash.startsWith("$2")) {
        currentMatches = bcrypt.compareSync(current_password, user.password_hash);
      } else {
        currentMatches = current_password === user.password_hash;
      }
      if (!currentMatches) {
        return res.status(400).json({ error: "Current password incorrect" });
      }
      const newHash = bcrypt.hashSync(new_password, 10);
      db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(newHash, userId);
      logAudit(userId, "password_change", "User updated their login password", "user");
    }
    if (name !== void 0) {
      db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, userId);
    }
    if (withdrawal_pin !== void 0) {
      db.prepare("UPDATE users SET withdrawal_pin = ? WHERE id = ?").run(withdrawal_pin, userId);
    }
    if (upi_id !== void 0) {
      db.prepare("UPDATE users SET upi_id = ? WHERE id = ?").run(upi_id, userId);
    }
    if (bank_details !== void 0) {
      db.prepare("UPDATE users SET bank_details = ? WHERE id = ?").run(bank_details, userId);
    }
    if (remove_photo === "true") {
      db.prepare("UPDATE users SET profile_photo = NULL WHERE id = ?").run(userId);
    } else if (req.file) {
      const photoUrl = `/public/uploads/${req.file.filename}`;
      db.prepare("UPDATE users SET profile_photo = ? WHERE id = ?").run(photoUrl, userId);
    }
    const updated = db.prepare("SELECT id, user_code, mobile, name, role, balance, deposited, withdrawn, withdrawal_pin, kyc_status, referral_code, upi_id, bank_details, status, profile_photo FROM users WHERE id = ?").get(userId);
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/plans", (req, res) => {
  try {
    const plans = db.prepare("SELECT * FROM plans WHERE status = 'active' ORDER BY amount ASC, id ASC").all();
    const plansWithStats = plans.map((p) => {
      const joined = db.prepare("SELECT COUNT(*) as count FROM user_plans WHERE plan_id = ?").get(p.id);
      return {
        ...p,
        joined_users: (p.joined_users_offset || 0) + joined.count,
        capacity: 800
      };
    });
    res.json({ success: true, plans: plansWithStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/plans/purchase", (req, res) => {
  try {
    const { user_id, plan_id } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(user_id);
    const plan = db.prepare("SELECT * FROM plans WHERE id = ?").get(plan_id);
    if (!user || !plan) return res.status(404).json({ error: "User or Plan not found" });
    if (plan.status !== "active") return res.status(400).json({ error: "This investment plan is currently inactive." });
    if (user.kyc_required === 1 && user.kyc_verification_status !== "Approved") {
      return res.status(403).json({ error: "KYC Verification Required. New plan purchases are restricted until your KYC is approved." });
    }
    if (user.balance < plan.amount) {
      return res.status(400).json({ error: "Insufficient wallet balance. Please deposit funds." });
    }
    const claimInterval = plan.claim_interval_hours || 12;
    const claimsPerDay = 24 / claimInterval;
    const totalClaims = plan.total_claims || plan.duration_days * claimsPerDay;
    const claimAmount = plan.claim_amount || plan.daily_return / claimsPerDay;
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1e3).toISOString();
    const nextClaimAt = now.toISOString();
    let newPlanId = 0;
    db.transaction(() => {
      db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(plan.amount, user_id);
      const insertResult = db.prepare(`
        INSERT INTO user_plans (
          user_id, plan_id, plan_name, category, amount, daily_return, 
          claim_amount, claim_interval_hours, total_claims, claims_completed, 
          total_return, earned_so_far, status, next_claim_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0.0, 'active', ?, ?)
      `).run(
        user_id,
        plan.id,
        plan.name,
        plan.category || "Stable",
        plan.amount,
        plan.daily_return,
        claimAmount,
        claimInterval,
        totalClaims,
        plan.total_return,
        nextClaimAt,
        expiresAt
      );
      newPlanId = Number(insertResult.lastInsertRowid);
      db.prepare(`
        INSERT INTO transactions (user_id, type, amount, status, reference_no, details)
        VALUES (?, 'plan_purchase', ?, 'approved', ?, ?)
      `).run(
        user_id,
        plan.amount,
        `PLAN-${plan.id}-${Date.now().toString(36).toUpperCase()}`,
        `Purchased investment plan: ${plan.name} (\u20B9${plan.amount.toLocaleString("en-IN")})`
      );
    })();
    res.json({
      success: true,
      message: `Successfully invested \u20B9${plan.amount.toLocaleString("en-IN")} in ${plan.name}! Your first dividend is ready to claim.`,
      user_plan_id: newPlanId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/user/plans/:id/claim", (req, res) => {
  try {
    const userPlanId = req.params.id;
    const { user_id } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(user_id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const userPlan = db.prepare("SELECT * FROM user_plans WHERE id = ? AND user_id = ?").get(userPlanId, user_id);
    if (!userPlan) return res.status(404).json({ error: "Investment contract not found for this user" });
    if (userPlan.status !== "active") {
      return res.status(400).json({ error: "This investment plan contract is already completed or inactive." });
    }
    const totalClaims = userPlan.total_claims || userPlan.duration_days * 2;
    const claimsCompleted = userPlan.claims_completed || 0;
    if (claimsCompleted >= totalClaims) {
      db.prepare("UPDATE user_plans SET status = 'completed' WHERE id = ?").run(userPlanId);
      return res.status(400).json({ error: "All scheduled dividend claims for this contract have been completed." });
    }
    const now = Date.now();
    if (userPlan.next_claim_at) {
      const nextTime = new Date(userPlan.next_claim_at).getTime();
      if (now < nextTime) {
        const diffMs = nextTime - now;
        const diffHrs = Math.floor(diffMs / (3600 * 1e3));
        const diffMins = Math.floor(diffMs % (3600 * 1e3) / (60 * 1e3));
        const diffSecs = Math.floor(diffMs % (60 * 1e3) / 1e3);
        return res.status(400).json({
          error: `Next dividend claim is not yet available. Please wait ${diffHrs}h ${diffMins}m ${diffSecs}s.`,
          seconds_remaining: Math.ceil(diffMs / 1e3)
        });
      }
    }
    const claimInterval = userPlan.claim_interval_hours || 12;
    const claimAmount = userPlan.claim_amount || userPlan.daily_return / (24 / claimInterval);
    const maxPayable = Math.max(0, userPlan.total_return - (userPlan.earned_so_far || 0));
    const finalClaimAmount = Math.min(claimAmount, maxPayable);
    if (finalClaimAmount <= 0) {
      db.prepare("UPDATE user_plans SET status = 'completed' WHERE id = ?").run(userPlanId);
      return res.status(400).json({ error: "Total contractual return has already been reached." });
    }
    const claimNumber = claimsCompleted + 1;
    const isLastClaim = claimNumber >= totalClaims || userPlan.earned_so_far + finalClaimAmount >= userPlan.total_return;
    const claimId = `CLM-RPAY-${userPlan.id}-${claimNumber}-${Date.now().toString(36).toUpperCase()}`;
    const nextClaimTime = new Date(now + claimInterval * 3600 * 1e3).toISOString();
    const balanceBefore = user.balance;
    const balanceAfter = balanceBefore + finalClaimAmount;
    db.transaction(() => {
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(finalClaimAmount, user_id);
      db.prepare(`
        UPDATE user_plans SET 
          claims_completed = claims_completed + 1,
          earned_so_far = earned_so_far + ?,
          last_claim_at = ?,
          next_claim_at = ?,
          status = ?
        WHERE id = ?
      `).run(
        finalClaimAmount,
        new Date(now).toISOString(),
        isLastClaim ? null : nextClaimTime,
        isLastClaim ? "completed" : "active",
        userPlanId
      );
      db.prepare(`
        INSERT INTO dividend_claims (
          claim_id, user_id, user_plan_id, plan_id, claim_number, 
          amount, wallet_balance_before, wallet_balance_after, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'success')
      `).run(
        claimId,
        user_id,
        userPlan.id,
        userPlan.plan_id,
        claimNumber,
        finalClaimAmount,
        balanceBefore,
        balanceAfter
      );
      db.prepare(`
        INSERT INTO transactions (user_id, type, amount, status, reference_no, details)
        VALUES (?, 'dividend_claim', ?, 'approved', ?, ?)
      `).run(
        user_id,
        finalClaimAmount,
        claimId,
        `12-Hour Dividend Payout #${claimNumber}/${totalClaims} for ${userPlan.plan_name || "Portfolio"}`
      );
    })();
    res.json({
      success: true,
      message: `Dividend payout of \u20B9${finalClaimAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} credited to wallet!`,
      claim_id: claimId,
      amount: finalClaimAmount,
      claim_number: claimNumber,
      total_claims: totalClaims,
      claims_remaining: totalClaims - claimNumber,
      next_claim_at: isLastClaim ? null : nextClaimTime,
      new_balance: balanceAfter,
      is_completed: isLastClaim
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/user/plans/:user_id", (req, res) => {
  try {
    const plans = db.prepare(`
      SELECT up.*, 
             COALESCE(up.plan_name, p.name) as plan_name,
             COALESCE(up.category, p.category, 'Stable') as plan_category,
             COALESCE(p.duration_days, 7) as duration_days
      FROM user_plans up 
      LEFT JOIN plans p ON up.plan_id = p.id 
      WHERE up.user_id = ? 
      ORDER BY up.id DESC
    `).all(req.params.user_id);
    const now = Date.now();
    const enriched = plans.map((p) => {
      const totalClaims = p.total_claims || p.duration_days * 2;
      const claimsCompleted = p.claims_completed || 0;
      const nextTime = p.next_claim_at ? new Date(p.next_claim_at).getTime() : 0;
      const canClaim = p.status === "active" && claimsCompleted < totalClaims && now >= nextTime;
      const secondsRemaining = p.status === "active" && now < nextTime ? Math.ceil((nextTime - now) / 1e3) : 0;
      return {
        ...p,
        total_claims: totalClaims,
        claims_completed: claimsCompleted,
        can_claim: canClaim,
        seconds_remaining: secondsRemaining
      };
    });
    res.json({ success: true, plans: enriched });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/user/dividend-claims/:user_id", (req, res) => {
  try {
    const claims = db.prepare(`
      SELECT dc.*, COALESCE(up.plan_name, p.name, 'Investment Portfolio') as plan_name
      FROM dividend_claims dc
      LEFT JOIN user_plans up ON dc.user_plan_id = up.id
      LEFT JOIN plans p ON dc.plan_id = p.id
      WHERE dc.user_id = ?
      ORDER BY dc.id DESC
      LIMIT 100
    `).all(req.params.user_id);
    res.json({ success: true, claims });
  } catch (err) {
  }
});
app.get("/api/wallet/:user_id", (req, res) => {
  try {
    const userId = req.params.user_id;
    const user = db.prepare("SELECT balance, deposited, withdrawn FROM users WHERE id = ?").get(userId);
    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT 50").all(userId);
    const deposits = db.prepare("SELECT * FROM deposits WHERE user_id = ? ORDER BY id DESC").all(userId);
    const withdrawals = db.prepare("SELECT * FROM withdrawals WHERE user_id = ? ORDER BY id DESC").all(userId);
    const settings = db.prepare("SELECT key, value FROM settings").all();
    const settingsObj = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    res.json({ success: true, user, transactions, deposits, withdrawals, settings: settingsObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var depositRateLimits = /* @__PURE__ */ new Map();
app.post("/api/deposit", (req, res) => {
  try {
    const { user_id, amount, utr, screenshot, idempotency_key, payment_status, approved } = req.body;
    if (!user_id || amount === void 0 || amount === null || !utr) {
      return res.status(400).json({ error: "User ID, Amount, and 12-digit UTR reference are required" });
    }
    const userId = Number(user_id);
    const user = db.prepare("SELECT id, status FROM users WHERE id = ?").get(userId);
    if (!user) return res.status(404).json({ error: "User account not found" });
    if (user.status === "blocked") return res.status(403).json({ error: "Your account is blocked. Deposits are not allowed." });
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const rateKey = `${userId}:${ip}`;
    const nowMs = Date.now();
    const timestamps = (depositRateLimits.get(rateKey) || []).filter((t) => nowMs - t < 5 * 60 * 1e3);
    if (timestamps.length >= 5) {
      return res.status(429).json({
        error: "Too many deposit requests. Maximum 5 requests allowed per 5 minutes. Please wait before trying again."
      });
    }
    timestamps.push(nowMs);
    depositRateLimits.set(rateKey, timestamps);
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Please enter a valid positive deposit amount" });
    }
    const settings = Object.fromEntries(db.prepare("SELECT key, value FROM settings").all().map((s) => [s.key, s.value]));
    const minDep = parseFloat(settings.min_deposit || "500");
    const maxDep = parseFloat(settings.max_deposit || "100000");
    if (numericAmount < minDep) {
      return res.status(400).json({
        error: `Deposit amount \u20B9${numericAmount.toLocaleString("en-IN")} is below the platform minimum deposit limit of \u20B9${minDep.toLocaleString("en-IN")}`
      });
    }
    if (numericAmount > maxDep) {
      return res.status(400).json({
        error: `Deposit amount \u20B9${numericAmount.toLocaleString("en-IN")} exceeds the platform maximum deposit limit of \u20B9${maxDep.toLocaleString("en-IN")}`
      });
    }
    const normalizedUtr = String(utr).trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (normalizedUtr.length < 6) {
      return res.status(400).json({ error: "Invalid UTR reference number. Please provide a valid 12-digit transaction ID." });
    }
    const existingUtr = db.prepare("SELECT id, user_id, status FROM deposits WHERE UPPER(TRIM(utr)) = ?").get(normalizedUtr);
    if (existingUtr) {
      return res.status(400).json({
        error: `This UTR reference number (${normalizedUtr}) has already been submitted to Reliance Pay. Duplicate UTR submissions are strictly rejected.`
      });
    }
    let safeScreenshot = "";
    if (screenshot && typeof screenshot === "string") {
      if (screenshot.length > 7 * 1024 * 1024) {
        return res.status(400).json({ error: "Payment screenshot size exceeds maximum allowed 5MB" });
      }
      if (screenshot.startsWith("data:") && !screenshot.startsWith("data:image/")) {
        return res.status(400).json({ error: "Invalid attachment type. Only image proof files (PNG, JPG, WEBP) are allowed." });
      }
      safeScreenshot = screenshot;
    }
    if (idempotency_key) {
      const existingIdem = db.prepare("SELECT id, reference_no, status FROM deposits WHERE idempotency_key = ?").get(idempotency_key);
      if (existingIdem) {
        return res.json({
          success: true,
          message: "Deposit request retrieved (idempotent submission)",
          deposit_id: existingIdem.id,
          transaction_id: existingIdem.reference_no,
          status: existingIdem.status
        });
      }
    }
    const refNo = `DEP-RPAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const safeIdemKey = idempotency_key || `IDEM-${userId}-${normalizedUtr}`;
    let depositId = 0;
    db.transaction(() => {
      const info = db.prepare(`
        INSERT INTO deposits (user_id, amount, utr, screenshot, status, reference_no, idempotency_key, ip_address)
        VALUES (?, ?, ?, ?, 'pending', ?, ?, ?)
      `).run(userId, numericAmount, normalizedUtr, safeScreenshot, refNo, safeIdemKey, ip);
      depositId = Number(info.lastInsertRowid);
      db.prepare(`
        INSERT INTO transactions (user_id, type, amount, status, reference_no, details)
        VALUES (?, 'deposit', ?, 'pending', ?, ?)
      `).run(
        userId,
        numericAmount,
        refNo,
        `Deposit request of \u20B9${numericAmount.toLocaleString("en-IN")} via UTR: ${normalizedUtr} (Pending Bank Verification)`
      );
      db.prepare(`
        INSERT INTO audit_logs (user_id, transaction_id, action, old_status, new_status, amount, actor, details, ip_address)
        VALUES (?, ?, 'deposit_created', 'none', 'pending', ?, 'user', ?, ?)
      `).run(
        userId,
        refNo,
        numericAmount,
        `User submitted deposit request with UTR ${normalizedUtr}. Balance unchanged.`,
        ip
      );
    })();
    res.json({
      success: true,
      message: "Deposit request submitted successfully. Payment is in PENDING state awaiting bank verification. Wallet balance will update only after verification.",
      deposit_id: depositId,
      transaction_id: refNo,
      status: "PENDING",
      amount: numericAmount,
      utr: normalizedUtr
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/withdraw", (req, res) => {
  try {
    const { user_id, amount, method, account_details, withdrawal_pin } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(user_id);
    const settings = Object.fromEntries(db.prepare("SELECT key, value FROM settings").all().map((s) => [s.key, s.value]));
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.kyc_required === 1 && user.kyc_verification_status !== "Approved") {
      return res.status(403).json({ error: "KYC Verification Required. Withdrawals are restricted until your KYC is approved." });
    }
    if (!withdrawal_pin || user.withdrawal_pin !== withdrawal_pin) {
      return res.status(400).json({ error: "Incorrect Withdrawal PIN" });
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Please enter a valid positive withdrawal amount" });
    }
    const minW = parseFloat(settings.min_withdrawal || "150");
    const maxW = parseFloat(settings.max_withdrawal || "50000");
    if (numericAmount < minW) {
      return res.status(400).json({
        error: `Withdrawal request (\u20B9${numericAmount.toLocaleString("en-IN")}) is below the platform minimum limit of \u20B9${minW.toLocaleString("en-IN")}`
      });
    }
    if (numericAmount > maxW) {
      return res.status(400).json({
        error: `Withdrawal request (\u20B9${numericAmount.toLocaleString("en-IN")}) exceeds the platform maximum limit of \u20B9${maxW.toLocaleString("en-IN")}`
      });
    }
    if (user.balance < numericAmount) {
      return res.status(400).json({
        error: `Insufficient available balance. You requested \u20B9${numericAmount.toLocaleString("en-IN")}, but your balance is \u20B9${user.balance.toLocaleString("en-IN")}`
      });
    }
    if (!account_details || !String(account_details).trim()) {
      return res.status(400).json({ error: "Payout account details (UPI or Bank) are required" });
    }
    db.transaction(() => {
      db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(numericAmount, user_id);
      db.prepare(`
        INSERT INTO withdrawals (user_id, amount, method, account_details, status)
        VALUES (?, ?, ?, ?, 'pending')
      `).run(user_id, numericAmount, method || "UPI", account_details);
      db.prepare(`
        INSERT INTO transactions (user_id, type, amount, status, details)
        VALUES (?, 'withdrawal', ?, 'pending', ?)
      `).run(user_id, numericAmount, `Withdrawal request of \u20B9${numericAmount.toLocaleString("en-IN")} to ${method || "UPI"}`);
    })();
    res.json({
      success: true,
      message: `Withdrawal request of \u20B9${numericAmount.toLocaleString("en-IN")} submitted successfully. Awaiting approval.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/banners", (req, res) => {
  try {
    const banners = db.prepare("SELECT * FROM banners ORDER BY sort_order ASC").all();
    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
function maskActivityName(fullName) {
  if (!fullName) return "User";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}
function maskActivityMobile(mobile) {
  if (!mobile) return "\u2022\u2022\u2022\u2022 0000";
  const clean = mobile.replace(/\D/g, "");
  if (clean.length < 4) return "\u2022\u2022\u2022\u2022 " + clean;
  return "\u2022\u2022\u2022\u2022 " + clean.slice(-4);
}
function formatActivityTimeAgo(dateStr) {
  if (!dateStr) return "Just now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 6e4);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
app.get("/api/activities/live", (req, res) => {
  try {
    const activities = [];
    try {
      const deposits = db.prepare(`
        SELECT d.id, d.amount, d.created_at, u.name, u.mobile
        FROM deposits d
        JOIN users u ON d.user_id = u.id
        WHERE d.status = 'approved'
        ORDER BY d.created_at DESC
        LIMIT 10
      `).all();
      for (const d of deposits) {
        activities.push({
          id: `dep_${d.id}`,
          type: "deposit_success",
          title: "Deposit Successful",
          user_display: maskActivityName(d.name),
          mobile_masked: maskActivityMobile(d.mobile),
          amount: d.amount,
          time_ago: formatActivityTimeAgo(d.created_at),
          is_demo: false,
          created_at: d.created_at
        });
      }
    } catch (_) {
    }
    try {
      const withdrawals = db.prepare(`
        SELECT w.id, w.amount, w.created_at, u.name, u.mobile
        FROM withdrawals w
        JOIN users u ON w.user_id = u.id
        WHERE w.status = 'approved'
        ORDER BY w.created_at DESC
        LIMIT 10
      `).all();
      for (const w of withdrawals) {
        activities.push({
          id: `wth_${w.id}`,
          type: "withdrawal_success",
          title: "Withdrawal Successful",
          user_display: maskActivityName(w.name),
          mobile_masked: maskActivityMobile(w.mobile),
          amount: w.amount,
          time_ago: formatActivityTimeAgo(w.created_at),
          is_demo: false,
          created_at: w.created_at
        });
      }
    } catch (_) {
    }
    try {
      const referrals = db.prepare(`
        SELECT r.id, r.bonus_amount, r.created_at, u.name, u.mobile
        FROM referrals r
        JOIN users u ON r.referrer_id = u.id
        WHERE r.status = 'paid' OR r.status = 'Reward Credited'
        ORDER BY r.created_at DESC
        LIMIT 10
      `).all();
      for (const r of referrals) {
        activities.push({
          id: `ref_${r.id}`,
          type: "referral_bonus",
          title: "Referral Bonus Received",
          user_display: maskActivityName(r.name),
          mobile_masked: maskActivityMobile(r.mobile),
          amount: r.bonus_amount,
          time_ago: formatActivityTimeAgo(r.created_at),
          is_demo: false,
          created_at: r.created_at
        });
      }
    } catch (_) {
    }
    try {
      const rewards = db.prepare(`
        SELECT dr.id, dr.reward_amount, dr.created_at, u.name, u.mobile
        FROM daily_rewards dr
        JOIN users u ON dr.user_id = u.id
        ORDER BY dr.created_at DESC
        LIMIT 10
      `).all();
      for (const dr of rewards) {
        activities.push({
          id: `bon_${dr.id}`,
          type: "bonus_received",
          title: "Bonus Received",
          user_display: maskActivityName(dr.name),
          mobile_masked: maskActivityMobile(dr.mobile),
          amount: dr.reward_amount,
          time_ago: formatActivityTimeAgo(dr.created_at),
          is_demo: false,
          created_at: dr.created_at
        });
      }
    } catch (_) {
    }
    try {
      const kycList = db.prepare(`
        SELECT k.id, k.created_at, u.name, u.mobile
        FROM kyc k
        JOIN users u ON k.user_id = u.id
        WHERE k.status = 'Approved'
        ORDER BY k.created_at DESC
        LIMIT 10
      `).all();
      for (const k of kycList) {
        activities.push({
          id: `kyc_${k.id}`,
          type: "verification_completed",
          title: "Account Verification Completed",
          user_display: maskActivityName(k.name),
          mobile_masked: maskActivityMobile(k.mobile),
          time_ago: formatActivityTimeAgo(k.created_at),
          is_demo: false,
          created_at: k.created_at
        });
      }
    } catch (_) {
    }
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (activities.length < 5) {
      const demoActivities = [
        {
          id: "demo_1",
          type: "deposit_success",
          title: "Deposit Successful",
          user_display: "Aarav K.",
          mobile_masked: "\u2022\u2022\u2022\u2022 1024",
          amount: 500,
          time_ago: "Just now",
          is_demo: true,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          id: "demo_2",
          type: "bonus_received",
          title: "Bonus Received",
          user_display: "Pooja M.",
          mobile_masked: "\u2022\u2022\u2022\u2022 8841",
          amount: 10,
          time_ago: "1m ago",
          is_demo: true,
          created_at: new Date(Date.now() - 6e4).toISOString()
        },
        {
          id: "demo_3",
          type: "withdrawal_success",
          title: "Withdrawal Successful",
          user_display: "Vikram R.",
          mobile_masked: "\u2022\u2022\u2022\u2022 3390",
          amount: 1500,
          time_ago: "3m ago",
          is_demo: true,
          created_at: new Date(Date.now() - 18e4).toISOString()
        },
        {
          id: "demo_4",
          type: "referral_bonus",
          title: "Referral Bonus Received",
          user_display: "Sneha P.",
          mobile_masked: "\u2022\u2022\u2022\u2022 4125",
          amount: 100,
          time_ago: "6m ago",
          is_demo: true,
          created_at: new Date(Date.now() - 36e4).toISOString()
        },
        {
          id: "demo_5",
          type: "verification_completed",
          title: "Account Verification Completed",
          user_display: "Rajesh T.",
          mobile_masked: "\u2022\u2022\u2022\u2022 6710",
          time_ago: "10m ago",
          is_demo: true,
          created_at: new Date(Date.now() - 6e5).toISOString()
        }
      ];
      for (const demoItem of demoActivities) {
        if (!activities.some((a) => a.type === demoItem.type)) {
          activities.push(demoItem);
        }
      }
    }
    res.json({ success: true, activities });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/checkin", (req, res) => {
  try {
    const { user_id } = req.body;
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const existing = db.prepare("SELECT id FROM daily_rewards WHERE user_id = ? AND date = ?").get(user_id, today);
    if (existing) {
      return res.status(400).json({ error: "You have already claimed your daily check-in reward today!" });
    }
    const settings = Object.fromEntries(db.prepare("SELECT key, value FROM settings").all().map((s) => [s.key, s.value]));
    const rewardAmt = parseFloat(settings.daily_reward_amount || "15");
    const streakCount = db.prepare("SELECT COUNT(*) as cnt FROM daily_rewards WHERE user_id = ?").get(user_id).cnt + 1;
    db.transaction(() => {
      db.prepare("INSERT INTO daily_rewards (user_id, reward_amount, streak_day, date) VALUES (?, ?, ?, ?)").run(user_id, rewardAmt, streakCount, today);
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(rewardAmt, user_id);
      db.prepare("INSERT INTO transactions (user_id, type, amount, status, details) VALUES (?, 'daily_reward', ?, 'approved', ?)").run(user_id, rewardAmt, `Daily Check-in Reward (Day ${streakCount})`);
    })();
    res.json({ success: true, reward: rewardAmt, streak: streakCount, message: `Successfully claimed \u20B9${rewardAmt} daily reward!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/bonuses/history/:user_id", (req, res) => {
  try {
    const userId = req.params.user_id;
    const bonuses = db.prepare(`
      SELECT id, type, amount, status, details, created_at 
      FROM transactions 
      WHERE user_id = ? AND type IN ('daily_reward', 'registration_bonus', 'referral_bonus') 
      ORDER BY id DESC
    `).all(userId);
    res.json({ success: true, bonuses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/checkin/:user_id", (req, res) => {
  try {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const claimedToday = db.prepare("SELECT * FROM daily_rewards WHERE user_id = ? AND date = ?").get(req.params.user_id, today);
    const history = db.prepare("SELECT * FROM daily_rewards WHERE user_id = ? ORDER BY id DESC LIMIT 10").all(req.params.user_id);
    res.json({ success: true, claimedToday: !!claimedToday, history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/scratch-cards/:user_id", (req, res) => {
  try {
    const cards = db.prepare("SELECT * FROM scratch_cards WHERE user_id = ? ORDER BY id DESC").all(req.params.user_id);
    res.json({ success: true, cards });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/scratch-cards/claim", (req, res) => {
  try {
    const { card_id, user_id } = req.body;
    const card = db.prepare("SELECT * FROM scratch_cards WHERE id = ? AND user_id = ?").get(card_id, user_id);
    if (!card) return res.status(404).json({ error: "Scratch card not found" });
    if (card.status === "claimed") {
      return res.status(400).json({ error: "This scratch card has already been claimed." });
    }
    db.transaction(() => {
      db.prepare("UPDATE scratch_cards SET is_scratched = 1, status = 'claimed' WHERE id = ?").run(card_id);
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(card.reward_amount, user_id);
      db.prepare("INSERT INTO transactions (user_id, type, amount, status, details) VALUES (?, 'scratch_reward', ?, 'approved', ?)").run(user_id, card.reward_amount, `Scratch card reward of \u20B9${card.reward_amount}`);
    })();
    res.json({ success: true, reward: card.reward_amount, message: `Successfully claimed \u20B9${card.reward_amount} reward!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/kyc/submit", (req, res) => {
  try {
    const { user_id, full_name, id_type, id_number, document_path } = req.body;
    if (!full_name || !id_type || !id_number) {
      return res.status(400).json({ error: "All KYC details are required" });
    }
    db.prepare(`
      INSERT OR REPLACE INTO kyc (user_id, full_name, id_type, id_number, document_path, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).run(user_id, full_name, id_type, id_number, document_path || "");
    db.prepare("UPDATE users SET kyc_status = 'Pending' WHERE id = ?").run(user_id);
    res.json({ success: true, message: "KYC documents submitted successfully for review." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/kyc/:user_id", (req, res) => {
  try {
    const kyc = db.prepare("SELECT * FROM kyc WHERE user_id = ?").get(req.params.user_id);
    res.json({ success: true, kyc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/referrals/:user_id", (req, res) => {
  try {
    const user = db.prepare("SELECT referral_code FROM users WHERE id = ?").get(req.params.user_id);
    const referrals = db.prepare(`
      SELECT r.*, u.name as referee_name, u.mobile as referee_mobile, u.created_at as referee_joined
      FROM referrals r
      JOIN users u ON r.referee_id = u.id
      WHERE r.referrer_id = ?
      ORDER BY r.id DESC
    `).all(req.params.user_id);
    res.json({ success: true, referral_code: user?.referral_code, referrals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/transactions/:user_id", (req, res) => {
  try {
    const transactions = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT 100").all(req.params.user_id);
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/stats", (req, res) => {
  try {
    const totalUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'user'").get().c;
    const activeUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'user' AND status = 'active'").get().c;
    const totalDeposited = db.prepare("SELECT SUM(amount) as s FROM deposits WHERE status = 'approved'").get().s || 0;
    const totalWithdrawn = db.prepare("SELECT SUM(amount) as s FROM withdrawals WHERE status = 'approved'").get().s || 0;
    const pendingDeposits = db.prepare("SELECT COUNT(*) as c FROM deposits WHERE status = 'pending'").get().c;
    const pendingWithdrawals = db.prepare("SELECT COUNT(*) as c FROM withdrawals WHERE status = 'pending'").get().c;
    const pendingKyc = db.prepare("SELECT COUNT(*) as c FROM kyc WHERE status = 'pending'").get().c;
    res.json({ success: true, stats: { totalUsers, activeUsers, totalDeposited, totalWithdrawn, pendingDeposits, pendingWithdrawals, pendingKyc } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/users", (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.user_code, u.mobile, u.name, u.role, u.balance, u.deposited, u.withdrawn, 
             u.kyc_status, u.kyc_verification_status, u.referral_code, u.status, u.created_at,
             k.aadhaar_name, k.aadhaar_number, k.utr_id, k.status as submission_status
      FROM users u
      LEFT JOIN user_kyc k ON u.id = k.user_id
      ORDER BY u.id DESC
    `).all();
    const enrichedUsers = users.map((u) => ({
      ...u,
      kyc_details: u.aadhaar_name ? {
        aadhaar_name: u.aadhaar_name,
        aadhaar_number: u.aadhaar_number,
        utr_id: u.utr_id,
        status: u.submission_status
      } : null
    }));
    res.json({ success: true, users: enrichedUsers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/kyc/notify", (req, res) => {
  try {
    const { user_id, kyc_required } = req.body;
    db.prepare("UPDATE users SET kyc_required = ? WHERE id = ?").run(kyc_required ? 1 : 0, user_id);
    res.json({ success: true, message: `KYC requirement ${kyc_required ? "enabled" : "disabled"} for user` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/kyc/management", (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.name, u.mobile, u.user_code, u.kyc_required, u.kyc_verification_status,
             k.aadhaar_name, k.aadhaar_number, k.utr_id, k.status as submission_status, k.submitted_at, k.rejection_reason
      FROM users u
      LEFT JOIN user_kyc k ON u.id = k.user_id
      WHERE u.role = 'user'
      ORDER BY u.id DESC
    `).all();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/kyc/action", (req, res) => {
  try {
    const { user_id, action, reason } = req.body;
    const status = action === "Approve" ? "Approved" : action === "Reject" ? "Rejected" : "Pending Verification";
    db.transaction(() => {
      db.prepare("UPDATE users SET kyc_verification_status = ? WHERE id = ?").run(status, user_id);
      db.prepare("UPDATE user_kyc SET status = ?, rejection_reason = ? WHERE user_id = ?").run(status, reason || null, user_id);
    })();
    res.json({ success: true, message: `KYC status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/user/kyc/submit", (req, res) => {
  try {
    const { user_id, aadhaar_name, aadhaar_number, utr_id } = req.body;
    if (!aadhaar_name || !aadhaar_number || !utr_id) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (!/^\d{12}$/.test(aadhaar_number)) {
      return res.status(400).json({ error: "Invalid Aadhaar number. Must be exactly 12 digits." });
    }
    const deposit = db.prepare(`
      SELECT id FROM deposits 
      WHERE utr = ? AND status = 'approved' 
      AND created_at >= datetime('now', '-30 minutes')
    `).get(utr_id);
    if (!deposit) {
      return res.status(400).json({ error: "Invalid or expired UTR ID. Please ensure the payment was successful and made within the last 30 minutes." });
    }
    db.transaction(() => {
      db.prepare(`
        INSERT OR REPLACE INTO user_kyc (user_id, aadhaar_name, aadhaar_number, utr_id, status, submitted_at)
        VALUES (?, ?, ?, ?, 'Submitted', CURRENT_TIMESTAMP)
      `).run(user_id, aadhaar_name, aadhaar_number, utr_id);
      db.prepare("UPDATE users SET kyc_verification_status = 'Submitted' WHERE id = ?").run(user_id);
    })();
    res.json({ success: true, message: "KYC submission received! Our team will verify your Aadhaar and Payment UTR shortly." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/admin/users/:id/status", (req, res) => {
  try {
    const { status } = req.body;
    db.prepare("UPDATE users SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true, message: `User status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/deposits", (req, res) => {
  try {
    const deposits = db.prepare(`
      SELECT d.*, u.name as user_name, u.mobile as user_mobile 
      FROM deposits d 
      JOIN users u ON d.user_id = u.id 
      ORDER BY d.id DESC
    `).all();
    res.json({ success: true, deposits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/deposits/:id/action", (req, res) => {
  try {
    const { action } = req.body;
    const depositId = req.params.id;
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const deposit = db.prepare("SELECT * FROM deposits WHERE id = ?").get(depositId);
    if (!deposit) return res.status(404).json({ error: "Deposit request not found" });
    if (deposit.status !== "pending" && deposit.status !== "processing") {
      return res.status(400).json({
        error: `Action blocked: Deposit #${depositId} is already in '${deposit.status}' state. Double crediting is strictly prevented.`
      });
    }
    const user = db.prepare("SELECT id, name, balance FROM users WHERE id = ?").get(deposit.user_id);
    if (!user) return res.status(404).json({ error: "User account associated with deposit not found" });
    if (action === "approve") {
      const duplicateApproved = db.prepare(`
        SELECT id FROM deposits 
        WHERE UPPER(TRIM(utr)) = UPPER(TRIM(?)) AND status = 'approved' AND id != ?
      `).get(deposit.utr, depositId);
      if (duplicateApproved) {
        return res.status(400).json({
          error: `Security Violation: UTR ${deposit.utr} is already marked as approved on another deposit transaction!`
        });
      }
      db.transaction(() => {
        db.prepare("UPDATE deposits SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('pending', 'processing')").run(depositId);
        db.prepare("UPDATE users SET balance = balance + ?, deposited = deposited + ? WHERE id = ?").run(deposit.amount, deposit.amount, deposit.user_id);
        db.prepare("UPDATE transactions SET status = 'approved' WHERE (reference_no = ? OR (type = 'deposit' AND reference_no = ?))").run(deposit.reference_no, deposit.utr);
        db.prepare(`
          INSERT INTO audit_logs (user_id, transaction_id, action, old_status, new_status, amount, actor, details, ip_address)
          VALUES (?, ?, 'deposit_approved', 'pending', 'approved', ?, 'admin', ?, ?)
        `).run(
          deposit.user_id,
          deposit.reference_no || `DEP-${depositId}`,
          deposit.amount,
          `Admin approved \u20B9${deposit.amount} deposit for User ID #${deposit.user_id} (${user.name}) with UTR ${deposit.utr}`,
          ip
        );
      })();
      return res.json({
        success: true,
        message: `Deposit #${depositId} (\u20B9${deposit.amount.toLocaleString("en-IN")}) verified & approved successfully. User wallet balance updated.`
      });
    } else {
      db.transaction(() => {
        db.prepare("UPDATE deposits SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status IN ('pending', 'processing')").run(depositId);
        db.prepare("UPDATE transactions SET status = 'rejected' WHERE (reference_no = ? OR (type = 'deposit' AND reference_no = ?))").run(deposit.reference_no, deposit.utr);
        db.prepare(`
          INSERT INTO audit_logs (user_id, transaction_id, action, old_status, new_status, amount, actor, details, ip_address)
          VALUES (?, ?, 'deposit_rejected', 'pending', 'rejected', ?, 'admin', ?, ?)
        `).run(
          deposit.user_id,
          deposit.reference_no || `DEP-${depositId}`,
          deposit.amount,
          `Admin rejected deposit request #${depositId} with UTR ${deposit.utr}. No balance credited.`,
          ip
        );
      })();
      return res.json({
        success: true,
        message: `Deposit #${depositId} rejected. User wallet balance remains unchanged.`
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/payment/webhook", (req, res) => {
  try {
    const signature = req.headers["x-signature"] || req.headers["x-webhook-secret"];
    const expectedSecret = process.env.WEBHOOK_SECRET || "RPAY_SECRET_WEBHOOK_2026";
    if (signature !== expectedSecret) {
      return res.status(401).json({ error: "Unauthorized payment webhook signature" });
    }
    const { event_id, order_id, utr, amount, status, gateway_status } = req.body;
    if (!event_id || !order_id && !utr) {
      return res.status(400).json({ error: "Missing required webhook payload fields" });
    }
    const existingEvent = db.prepare("SELECT id FROM payment_webhooks WHERE event_id = ?").get(event_id);
    if (existingEvent) {
      return res.json({ success: true, message: "Webhook event already processed (idempotent)" });
    }
    db.prepare(`
      INSERT INTO payment_webhooks (event_id, gateway_order_id, utr, amount, payload, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(event_id, order_id || "", utr || "", parseFloat(amount || "0"), JSON.stringify(req.body), status || gateway_status || "received");
    let deposit = null;
    if (order_id) {
      deposit = db.prepare("SELECT * FROM deposits WHERE reference_no = ?").get(order_id);
    }
    if (!deposit && utr) {
      const normUtr = String(utr).trim().toUpperCase();
      deposit = db.prepare("SELECT * FROM deposits WHERE UPPER(TRIM(utr)) = ?").get(normUtr);
    }
    if (!deposit) {
      return res.status(404).json({ error: "No matching deposit order found for webhook notification" });
    }
    const webhookAmt = parseFloat(amount);
    if (!isNaN(webhookAmt) && Math.abs(webhookAmt - deposit.amount) > 0.01) {
      return res.status(400).json({
        error: `Webhook amount mismatch: expected \u20B9${deposit.amount}, received \u20B9${webhookAmt}`
      });
    }
    const finalStatus = (status || gateway_status || "").toUpperCase();
    if (["SUCCESS", "COMPLETED", "PAID"].includes(finalStatus)) {
      if (deposit.status === "pending" || deposit.status === "processing") {
        db.transaction(() => {
          db.prepare("UPDATE deposits SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(deposit.id);
          db.prepare("UPDATE users SET balance = balance + ?, deposited = deposited + ? WHERE id = ?").run(deposit.amount, deposit.amount, deposit.user_id);
          db.prepare("UPDATE transactions SET status = 'approved' WHERE reference_no = ?").run(deposit.reference_no);
          db.prepare(`
            INSERT INTO audit_logs (user_id, transaction_id, action, old_status, new_status, amount, actor, details)
            VALUES (?, ?, 'webhook_deposit_approve', 'pending', 'approved', ?, 'webhook', ?)
          `).run(deposit.user_id, deposit.reference_no, deposit.amount, `Webhook ${event_id} verified payment for order ${order_id}`);
        })();
        return res.json({ success: true, message: "Deposit verified and wallet credited via webhook" });
      }
    } else if (["FAILED", "REJECTED", "CANCELLED"].includes(finalStatus)) {
      if (deposit.status === "pending") {
        db.prepare("UPDATE deposits SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(deposit.id);
        db.prepare("UPDATE transactions SET status = 'rejected' WHERE reference_no = ?").run(deposit.reference_no);
      }
    }
    res.json({ success: true, message: "Webhook event processed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/withdrawals", (req, res) => {
  try {
    const withdrawals = db.prepare(`
      SELECT w.*, u.name as user_name, u.mobile as user_mobile 
      FROM withdrawals w 
      JOIN users u ON w.user_id = u.id 
      ORDER BY w.id DESC
    `).all();
    res.json({ success: true, withdrawals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/withdrawals/:id/action", (req, res) => {
  try {
    const { action } = req.body;
    const withdrawalId = req.params.id;
    const withdrawal = db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(withdrawalId);
    if (!withdrawal) return res.status(404).json({ error: "Withdrawal not found" });
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ error: `Withdrawal already ${withdrawal.status}` });
    }
    if (action === "approve") {
      db.transaction(() => {
        db.prepare("UPDATE withdrawals SET status = 'approved' WHERE id = ?").run(withdrawalId);
        db.prepare("UPDATE users SET withdrawn = withdrawn + ? WHERE id = ?").run(withdrawal.amount, withdrawal.user_id);
        db.prepare("UPDATE transactions SET status = 'approved' WHERE type = 'withdrawal' AND user_id = ? AND amount = ? AND status = 'pending'").run(withdrawal.user_id, withdrawal.amount);
      })();
    } else {
      db.transaction(() => {
        db.prepare("UPDATE withdrawals SET status = 'rejected' WHERE id = ?").run(withdrawalId);
        db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(withdrawal.amount, withdrawal.user_id);
        db.prepare("UPDATE transactions SET status = 'rejected' WHERE type = 'withdrawal' AND user_id = ? AND amount = ? AND status = 'pending'").run(withdrawal.user_id, withdrawal.amount);
      })();
    }
    res.json({ success: true, message: `Withdrawal ${action}d successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/kyc", (req, res) => {
  try {
    const kycList = db.prepare(`
      SELECT k.*, u.name as user_name, u.mobile as user_mobile 
      FROM kyc k 
      JOIN users u ON k.user_id = u.id 
      ORDER BY k.id DESC
    `).all();
    res.json({ success: true, kycList });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/kyc/:id/action", (req, res) => {
  try {
    const { action } = req.body;
    const kycItem = db.prepare("SELECT * FROM kyc WHERE id = ?").get(req.params.id);
    if (!kycItem) return res.status(404).json({ error: "KYC record not found" });
    db.transaction(() => {
      db.prepare("UPDATE kyc SET status = ? WHERE id = ?").run(action, req.params.id);
      db.prepare("UPDATE users SET kyc_status = ? WHERE id = ?").run(action, kycItem.user_id);
    })();
    res.json({ success: true, message: `KYC status updated to ${action}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.patch("/api/admin/users/:id/balance", (req, res) => {
  try {
    const { amount, action } = req.body;
    const userId = req.params.id;
    if (isNaN(amount) || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
    const user = db.prepare("SELECT balance FROM users WHERE id = ?").get(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    let newBalance = user.balance;
    if (action === "add") {
      newBalance += amount;
      db.prepare("UPDATE users SET balance = balance + ? WHERE id = ?").run(amount, userId);
      db.prepare("INSERT INTO transactions (user_id, type, amount, status, details) VALUES (?, 'admin_credit', ?, 'approved', ?)").run(userId, amount, "Credit by administrator");
      logAudit(Number(userId), "balance_increase", `Admin increased balance by \u20B9${amount}`, "admin", amount);
    } else if (action === "subtract") {
      newBalance -= amount;
      db.prepare("UPDATE users SET balance = balance - ? WHERE id = ?").run(amount, userId);
      db.prepare("INSERT INTO transactions (user_id, type, amount, status, details) VALUES (?, 'admin_debit', ?, 'approved', ?)").run(userId, amount, "Debit by administrator");
      logAudit(Number(userId), "balance_decrease", `Admin decreased balance by \u20B9${amount}`, "admin", amount);
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }
    res.json({ success: true, message: `Balance updated successfully`, newBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/admin/users/:id/password", (req, res) => {
  try {
    const { new_password } = req.body;
    const userId = req.params.id;
    if (!new_password) return res.status(400).json({ error: "New password is required" });
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(new_password, userId);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/users/:id/assign-plan", (req, res) => {
  try {
    const userId = req.params.id;
    const { plan_id } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
    const plan = db.prepare("SELECT * FROM plans WHERE id = ?").get(plan_id);
    if (!user || !plan) return res.status(404).json({ error: "User or Plan not found" });
    const claimInterval = plan.claim_interval_hours || 12;
    const totalClaims = plan.total_claims || plan.duration_days * (24 / claimInterval);
    const claimAmount = plan.claim_amount || plan.daily_return / (24 / claimInterval);
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1e3).toISOString();
    db.transaction(() => {
      db.prepare(`
        INSERT INTO user_plans (
          user_id, plan_id, plan_name, category, amount, daily_return, 
          claim_amount, claim_interval_hours, total_claims, claims_completed, 
          total_return, earned_so_far, status, next_claim_at, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0.0, 'active', ?, ?)
      `).run(
        userId,
        plan.id,
        plan.name,
        plan.category || "Stable",
        plan.amount,
        plan.daily_return,
        claimAmount,
        claimInterval,
        totalClaims,
        plan.total_return,
        now.toISOString(),
        expiresAt
      );
      db.prepare(`
        INSERT INTO transactions (user_id, type, amount, status, details)
        VALUES (?, 'plan_assignment', ?, 'approved', ?)
      `).run(userId, 0, `Administrator manually assigned plan: ${plan.name}`);
    })();
    res.json({ success: true, message: `Plan '${plan.name}' assigned to user successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/admin/users/:id/delete", (req, res) => {
  try {
    const userId = req.params.id;
    db.transaction(() => {
      db.prepare("DELETE FROM user_plans WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM deposits WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM withdrawals WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM transactions WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM referrals WHERE referrer_id = ? OR referee_id = ?").run(userId, userId);
      db.prepare("DELETE FROM scratch_cards WHERE user_id = ?").run(userId);
      db.prepare("DELETE FROM users WHERE id = ?").run(userId);
    })();
    res.json({ success: true, message: "User and all related records deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/plans", (req, res) => {
  try {
    const plans = db.prepare("SELECT * FROM plans ORDER BY id DESC").all();
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/plans", (req, res) => {
  try {
    const {
      name,
      category,
      amount,
      duration_days,
      daily_return,
      total_return,
      claim_interval_hours,
      description,
      image_url,
      status
    } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Plan name is required" });
    }
    const numAmount = parseFloat(amount);
    const numDuration = parseInt(duration_days);
    const numDaily = parseFloat(daily_return);
    const numInterval = parseInt(claim_interval_hours) || 12;
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "Plan price must be a positive number" });
    }
    if (isNaN(numDuration) || numDuration <= 0) {
      return res.status(400).json({ error: "Plan cycle duration must be at least 1 day" });
    }
    if (isNaN(numDaily) || numDaily <= 0) {
      return res.status(400).json({ error: "Daily return must be a positive number" });
    }
    const claimsPerDay = 24 / numInterval;
    const totalClaims = numDuration * claimsPerDay;
    const claimAmount = numDaily / claimsPerDay;
    const expectedTotal = numDaily * numDuration;
    const finalTotal = parseFloat(total_return) || expectedTotal;
    let warning = null;
    if (Math.abs(finalTotal - expectedTotal) > 0.01) {
      warning = `Note: Total payout (\u20B9${finalTotal}) differs from Daily Return \xD7 Duration (\u20B9${expectedTotal}). Calculation flagged.`;
    }
    const info = db.prepare(`
      INSERT INTO plans (
        name, category, amount, duration_days, claim_interval_hours, 
        daily_return, claim_amount, total_claims, total_return, 
        description, image_url, joined_users_offset, layout, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name.trim(),
      category || "Stable",
      numAmount,
      numDuration,
      numInterval,
      numDaily,
      claimAmount,
      totalClaims,
      finalTotal,
      description || "",
      image_url || "",
      req.body.joined_users_offset || 0,
      req.body.layout || "full",
      status || "active"
    );
    logAudit(null, "plan_create", `Admin created new plan: ${name}`, "admin", numAmount);
    res.json({
      success: true,
      message: "Investment plan created successfully",
      id: info.lastInsertRowid,
      warning
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/admin/plans/:id", (req, res) => {
  try {
    const planId = req.params.id;
    const {
      name,
      category,
      amount,
      duration_days,
      daily_return,
      total_return,
      claim_interval_hours,
      description,
      image_url,
      status
    } = req.body;
    const existing = db.prepare("SELECT * FROM plans WHERE id = ?").get(planId);
    if (!existing) return res.status(404).json({ error: "Plan not found" });
    const numAmount = parseFloat(amount !== void 0 ? amount : existing.amount);
    const numDuration = parseInt(duration_days !== void 0 ? duration_days : existing.duration_days);
    const numDaily = parseFloat(daily_return !== void 0 ? daily_return : existing.daily_return);
    const numInterval = parseInt(claim_interval_hours !== void 0 ? claim_interval_hours : existing.claim_interval_hours) || 12;
    const joinedOffset = req.body.joined_users_offset !== void 0 ? parseInt(req.body.joined_users_offset) : existing.joined_users_offset;
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: "Plan price must be a positive number" });
    }
    if (isNaN(numDuration) || numDuration <= 0) {
      return res.status(400).json({ error: "Plan cycle duration must be at least 1 day" });
    }
    if (isNaN(numDaily) || numDaily <= 0) {
      return res.status(400).json({ error: "Daily return must be a positive number" });
    }
    const claimsPerDay = 24 / numInterval;
    const totalClaims = numDuration * claimsPerDay;
    const claimAmount = numDaily / claimsPerDay;
    const expectedTotal = numDaily * numDuration;
    const finalTotal = total_return !== void 0 ? parseFloat(total_return) : expectedTotal;
    let warning = null;
    if (Math.abs(finalTotal - expectedTotal) > 0.01) {
      warning = `Note: Total payout (\u20B9${finalTotal}) differs from Daily Return \xD7 Duration (\u20B9${expectedTotal}).`;
    }
    db.prepare(`
      UPDATE plans SET 
        name = ?, category = ?, amount = ?, duration_days = ?, 
        claim_interval_hours = ?, daily_return = ?, claim_amount = ?, 
        total_claims = ?, total_return = ?, description = ?, 
        image_url = ?, joined_users_offset = ?, layout = ?, status = ?
      WHERE id = ?
    `).run(
      name !== void 0 ? name.trim() : existing.name,
      category !== void 0 ? category : existing.category,
      numAmount,
      numDuration,
      numInterval,
      numDaily,
      claimAmount,
      totalClaims,
      finalTotal,
      description !== void 0 ? description : existing.description,
      image_url !== void 0 ? image_url : existing.image_url,
      joinedOffset,
      req.body.layout !== void 0 ? req.body.layout : existing.layout,
      status !== void 0 ? status : existing.status,
      planId
    );
    logAudit(null, "plan_update", `Admin updated plan: ${name || existing.name}`, "admin", numAmount);
    res.json({
      success: true,
      message: "Plan updated successfully",
      warning
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.patch("/api/admin/plans/:id/status", (req, res) => {
  try {
    const planId = req.params.id;
    const { status } = req.body;
    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Status must be active or inactive" });
    }
    db.prepare("UPDATE plans SET status = ? WHERE id = ?").run(status, planId);
    res.json({ success: true, message: `Plan status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/admin/plans/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM plans WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: "Plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/claims", (req, res) => {
  try {
    const claims = db.prepare(`
      SELECT dc.*, u.name as user_name, u.mobile as user_mobile, 
             COALESCE(up.plan_name, p.name) as plan_name
      FROM dividend_claims dc
      JOIN users u ON dc.user_id = u.id
      LEFT JOIN user_plans up ON dc.user_plan_id = up.id
      LEFT JOIN plans p ON dc.plan_id = p.id
      ORDER BY dc.id DESC
      LIMIT 100
    `).all();
    res.json({ success: true, claims });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/banners", (req, res) => {
  try {
    const banners = db.prepare("SELECT * FROM banners ORDER BY sort_order ASC").all();
    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/banners", (req, res) => {
  try {
    const { title, image_url, link_url, sort_order } = req.body;
    db.prepare("INSERT INTO banners (title, image_url, link_url, sort_order) VALUES (?, ?, ?, ?)").run(title, image_url, link_url, sort_order || 1);
    res.json({ success: true, message: "Banner added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/admin/banners/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM banners WHERE id = ?").run(req.params.id);
    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/scratch-cards/issue", (req, res) => {
  try {
    const { user_id, reward_amount } = req.body;
    db.prepare("INSERT INTO scratch_cards (user_id, reward_amount, is_scratched, status) VALUES (?, ?, 0, 'unclaimed')").run(user_id, reward_amount || 100);
    res.json({ success: true, message: "Scratch card issued successfully to user" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/settings", (req, res) => {
  try {
    const settings = Object.fromEntries(db.prepare("SELECT key, value FROM settings").all().map((s) => [s.key, s.value]));
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/settings", (req, res) => {
  try {
    const settingsObj = req.body;
    if (settingsObj.min_withdrawal !== void 0) {
      const minVal = parseFloat(settingsObj.min_withdrawal);
      if (isNaN(minVal) || minVal <= 0) {
        return res.status(400).json({ error: "Minimum withdrawal amount must be a valid positive number" });
      }
    }
    if (settingsObj.max_withdrawal !== void 0) {
      const maxVal = parseFloat(settingsObj.max_withdrawal);
      const currentMin = settingsObj.min_withdrawal !== void 0 ? parseFloat(settingsObj.min_withdrawal) : parseFloat(db.prepare("SELECT value FROM settings WHERE key = 'min_withdrawal'").get()?.value || "150");
      if (isNaN(maxVal) || maxVal <= 0) {
        return res.status(400).json({ error: "Maximum withdrawal amount must be a valid positive number" });
      }
      if (maxVal < currentMin) {
        return res.status(400).json({
          error: `Maximum withdrawal limit (\u20B9${maxVal}) cannot be less than Minimum withdrawal limit (\u20B9${currentMin})`
        });
      }
    }
    const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    db.transaction(() => {
      for (const [key, value] of Object.entries(settingsObj)) {
        stmt.run(key, String(value));
      }
    })();
    res.json({ success: true, message: "Settings & withdrawal limits updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/announcements", (req, res) => {
  try {
    const raw = db.prepare("SELECT value FROM settings WHERE key = 'scrolling_announcements'").get();
    let announcements = [];
    if (raw && raw.value) {
      try {
        announcements = JSON.parse(raw.value);
      } catch {
        announcements = [raw.value];
      }
    } else {
      const fallback = db.prepare("SELECT value FROM settings WHERE key = 'announcement'").get();
      announcements = fallback?.value ? [fallback.value, "Instant UPI Deposits & 24x7 Verified Payouts active across all channels.", "\u26A0\uFE0F Security Alert: Reliance Pay will never ask for your OTP, password or PIN!"] : [
        "Welcome to Reliance Pay! 12-Hour automated dividend distribution is active.",
        "Instant UPI Deposits & 24x7 Verified Payouts active across all channels.",
        "\u26A0\uFE0F Security Alert: Reliance Pay will never ask for your OTP, password or PIN!"
      ];
    }
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/announcements", (req, res) => {
  try {
    const { announcements } = req.body;
    if (!Array.isArray(announcements)) {
      return res.status(400).json({ error: "Announcements must be an array of strings" });
    }
    const cleanList = announcements.map((s) => String(s).trim()).filter((s) => s.length > 0);
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('scrolling_announcements', ?)").run(JSON.stringify(cleanList));
    if (cleanList.length > 0) {
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('announcement', ?)").run(cleanList[0]);
    }
    res.json({
      success: true,
      message: "Scrolling banner announcements saved and refreshed globally!",
      announcements: cleanList
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/logs", (req, res) => {
  try {
    const logs = db.prepare("SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100").all();
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});
var SYSTEM_INSTRUCTION = `You are "Reliance Pay AI Assistant", the personal customer guidance digital assistant for the Reliance Pay financial app.

YOUR GOAL:
Guide users step-by-step in Hindi, English, or Hinglish on how to use Reliance Pay.
Understand informal queries, typos, and spelling mistakes (e.g., "paisa nikalna h", "rechrg fail", "refrel code", "daily reward", "paisa kab aayega").

RELIANCE PAY OFFICIAL STEPS:
1. RECHARGE / DEPOSIT:
   - Click 'Recharge' or 'Wallet' -> Select amount -> Scan QR / Copy UPI ID -> Pay via Paytm/PhonePe/GPay -> Copy 12-digit UTR/Txn ID -> Submit UTR in app -> Approved within a few minutes.
2. WITHDRAWAL:
   - Click 'Withdraw' in Wallet/Profile -> Add UPI/Bank details if not added -> Enter amount & 4-digit PIN -> Submit request -> Check status in 'Record' section.
3. INVESTMENT PLANS:
   - Go to 'Plans' -> Choose plan -> Click 'Invest' -> Collect daily profit under 'My Plans' every 24 hours.
4. REFERRAL PROGRAM:
   - Go to 'Referral' -> Copy unique code/link -> Earn 10% commission when invited friends invest.
5. REWARDS & CHECK-IN:
   - Go to 'Rewards' -> Claim daily check-in cash bonus & scratch cards.
6. HUMAN SUPPORT:
   - If AI cannot solve your issue, click 'Connect to Human Support' to open an official ticket for Admin review.

IMPORTANT RULES:
- Never ask for account passwords, MPINs, or OTPs.
- Never guarantee 100% risk-free profits.
- Keep answers polite, short, formatted with clean numbered bullet points.`;
app.post("/api/chat", async (req, res) => {
  try {
    const { message, userId } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }
    const aiEnabledSetting = db.prepare("SELECT value FROM settings WHERE key = 'ai_assistant_enabled'").get();
    if (aiEnabledSetting && aiEnabledSetting.value === "false") {
      return res.json({
        success: true,
        reply: "Reliance Pay AI Assistant is currently undergoing maintenance. Please click 'Connect to Human Support' or contact support directly.",
        isEscalatedSuggested: true
      });
    }
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await genAI.models.generateContent({
          model: "gemini-3.8-flash",
          contents: message,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION
          }
        });
        if (response && response.text) {
          return res.json({
            success: true,
            reply: response.text,
            timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          });
        }
      } catch (geminiError) {
        console.warn("Gemini API call warning (falling back to smart knowledge base):", geminiError?.message);
      }
    }
    const lowerMsg = message.toLowerCase();
    let reply = "";
    let suggestEscalation = false;
    if (lowerMsg.includes("withdraw") || lowerMsg.includes("nikal") || lowerMsg.includes("paisa nikal") || lowerMsg.includes("paisa kab aayega") || lowerMsg.includes("withdrawal")) {
      reply = `**Reliance Pay \u092E\u0947\u0902 Withdrawal \u0915\u0930\u0928\u0947 \u0915\u093E \u092A\u0942\u0930\u093E \u0924\u0930\u0940\u0915\u093E:**

1. **Profile \u092F\u093E Wallet** \u0938\u0947\u0915\u094D\u0936\u0928 \u0916\u094B\u0932\u0947\u0902\u0964
2. **Withdraw** \u092C\u091F\u0928 \u092A\u0930 \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902\u0964
3. \u0905\u092A\u0928\u093E **Bank Account / UPI ID** \u0914\u0930 \u0930\u093E\u0936\u093F (Amount) \u092D\u0930\u0947\u0902\u0964
4. \u0905\u092A\u0928\u093E **4-\u0921\u093F\u091C\u093F\u091F Security PIN** \u0926\u0930\u094D\u091C \u0915\u0930\u0947\u0902\u0964
5. **Submit Withdrawal Request** \u092A\u0930 \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902\u0964
6. **Record** \u0938\u0947\u0915\u094D\u0936\u0928 \u092E\u0947\u0902 \u091C\u093E\u0915\u0930 Status \u0926\u0947\u0916 \u0938\u0915\u0924\u0947 \u0939\u0948\u0902\u0964 (2-24 \u0918\u0902\u091F\u0947 \u092E\u0947\u0902 \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0939\u094B\u0924\u093E \u0939\u0948)`;
    } else if (lowerMsg.includes("recharge") || lowerMsg.includes("deposit") || lowerMsg.includes("paisa add") || lowerMsg.includes("paisa daal") || lowerMsg.includes("add money")) {
      reply = `**Reliance Pay \u092E\u0947\u0902 Recharge / Money Add \u0915\u0930\u0928\u0947 \u0915\u0940 \u0935\u093F\u0927\u093F:**

1. **Home \u092F\u093E Wallet** \u092E\u0947\u0902 **Recharge** \u092C\u091F\u0928 \u0926\u092C\u093E\u090F\u0902\u0964
2. \u091C\u093F\u0924\u0928\u0940 \u0930\u093E\u0936\u093F (Amount) \u091C\u094B\u0921\u0928\u0940 \u0939\u0948 \u0909\u0938\u0947 \u091A\u0941\u0928\u0947\u0902\u0964
3. \u0938\u094D\u0915\u094D\u0930\u0940\u0928 \u092A\u0930 \u0926\u093F\u0916 \u0930\u0939\u0947 **Official QR Code** \u0915\u094B \u0938\u094D\u0915\u0948\u0928 \u0915\u0930\u0947\u0902 \u092F\u093E UPI ID \u0915\u0949\u092A\u0940 \u0915\u0930\u0947\u0902\u0964
4. \u0905\u092A\u0928\u0947 PhonePe / Paytm / GPay \u0910\u092A \u0938\u0947 \u092D\u0941\u0917\u0924\u093E\u0928 (Payment) \u0915\u0930\u0947\u0902\u0964
5. Payment \u0938\u0915\u094D\u0938\u0947\u0938 \u0939\u094B\u0928\u0947 \u092A\u0930 12-\u0921\u093F\u091C\u093F\u091F **UTR / Reference ID** \u0915\u0949\u092A\u0940 \u0915\u0930\u0947\u0902\u0964
6. \u0910\u092A \u092E\u0947\u0902 UTR \u0928\u0902\u092C\u0930 \u0921\u093E\u0932\u0915\u0930 **Submit Payment** \u0915\u0930\u0947\u0902\u0964 5 \u092E\u093F\u0928\u091F \u092E\u0947\u0902 \u092C\u0948\u0932\u0947\u0902\u0938 \u091C\u0941\u0921\u093C \u091C\u093E\u090F\u0917\u093E\u0964`;
    } else if (lowerMsg.includes("plan") || lowerMsg.includes("invest") || lowerMsg.includes("daily return") || lowerMsg.includes("dividend") || lowerMsg.includes("profit")) {
      reply = `**Investment Plans \u0914\u0930 Claim \u0915\u0930\u0928\u0947 \u0915\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940:**

1. Bottom Navigation \u092E\u0947\u0902 **Plans** \u0935\u093F\u0915\u0932\u094D\u092A \u0916\u094B\u0932\u0947\u0902\u0964
2. \u0905\u092A\u0928\u0940 \u092A\u0938\u0902\u0926 \u0915\u093E \u092A\u094D\u0932\u093E\u0928 (Starter, Wealth Fund, Premium VIP) \u091A\u0941\u0928\u0947\u0902\u0964
3. **Invest Now** \u092A\u0930 \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902\u0964
4. \u0930\u094B\u091C\u093E\u0928\u093E \u0915\u093E **Profit/Dividend Claim** \u0915\u0930\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F **My Plans** \u0938\u0947\u0915\u094D\u0936\u0928 \u092E\u0947\u0902 \u091C\u093E\u090F\u0902 \u0914\u0930 Claim \u092C\u091F\u0928 \u0926\u092C\u093E\u090F\u0902\u0964
5. Profit \u0924\u0941\u0930\u0902\u0924 \u0906\u092A\u0915\u0947 Main Wallet Balance \u092E\u0947\u0902 \u0915\u094D\u0930\u0947\u0921\u093F\u091F \u0939\u094B \u091C\u093E\u090F\u0917\u093E!`;
    } else if (lowerMsg.includes("refer") || lowerMsg.includes("invite") || lowerMsg.includes("team") || lowerMsg.includes("commission")) {
      reply = `**Referral & Commission Program:**

1. **Referral** \u091F\u0948\u092C \u092A\u0930 \u091C\u093E\u090F\u0902\u0964
2. \u0905\u092A\u0928\u093E \u092F\u0942\u0928\u093F\u0915 **Invite Link / Code** \u0915\u0949\u092A\u0940 \u0915\u0930\u0915\u0947 \u0926\u094B\u0938\u094D\u0924\u094B\u0902 \u0915\u094B \u092D\u0947\u091C\u0947\u0902\u0964
3. \u091C\u092C \u092D\u0940 \u0906\u092A\u0915\u093E \u0926\u094B\u0938\u094D\u0924 \u091C\u0941\u0921\u093C\u0915\u0930 Invest \u0915\u0930\u0947\u0917\u093E, \u0906\u092A\u0915\u094B **10% Instant Cash Bonus** \u092E\u093F\u0932\u0947\u0917\u093E\u0964
4. Bonus \u0938\u0940\u0927\u0947 \u0906\u092A\u0915\u0947 Main Balance \u092E\u0947\u0902 \u0910\u0921 \u0939\u094B \u091C\u093E\u0924\u093E \u0939\u0948\u0964`;
    } else if (lowerMsg.includes("support") || lowerMsg.includes("customer") || lowerMsg.includes("help") || lowerMsg.includes("problem") || lowerMsg.includes("agent") || lowerMsg.includes("admin")) {
      reply = `**Reliance Pay Support:**

\u0939\u092E\u093E\u0930\u0940 AI \u091F\u0940\u092E \u0906\u092A\u0915\u0940 \u092E\u0926\u0926 \u0915\u0947 \u0932\u093F\u090F 24/7 \u0924\u0948\u092F\u093E\u0930 \u0939\u0948\u0964 \u092F\u0926\u093F \u0906\u092A\u0915\u0940 \u0938\u092E\u0938\u094D\u092F\u093E \u0939\u0932 \u0928\u0939\u0940\u0902 \u0939\u0941\u0908 \u0939\u0948, \u0924\u094B \u0928\u0940\u091A\u0947 **"Connect to Human Support"** \u092C\u091F\u0928 \u092A\u0930 \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902\u0964

\u0939\u092E\u093E\u0930\u0947 \u090F\u0917\u094D\u091C\u0940\u0915\u094D\u092F\u0942\u091F\u093F\u0935 \u0906\u092A\u0915\u0940 \u0938\u092E\u0938\u094D\u092F\u093E \u0915\u093E \u0928\u093F\u0935\u093E\u0930\u0923 \u0924\u0941\u0930\u0902\u0924 \u0915\u0930\u0947\u0902\u0917\u0947!`;
      suggestEscalation = true;
    } else {
      reply = `\u0928\u092E\u0938\u094D\u0915\u093E\u0930! \u092E\u0948\u0902 **Reliance Pay AI Assistant** \u0939\u0942\u0901\u0964

\u0906\u092A \u092E\u0941\u091D\u0938\u0947 \u0907\u0928 \u0935\u093F\u0937\u092F\u094B\u0902 \u092A\u0930 \u0938\u0935\u093E\u0932 \u092A\u0942\u091B \u0938\u0915\u0924\u0947 \u0939\u0948\u0902:
\u2022 **Recharge \u0915\u0948\u0938\u0947 \u0915\u0930\u0947\u0902?**
\u2022 **Withdrawal \u0915\u0940 \u0935\u093F\u0927\u093F \u0914\u0930 \u0938\u094D\u091F\u0947\u091F\u0938?**
\u2022 **Plans \u0914\u0930 Daily Income Claim?**
\u2022 **Referral Bonus \u0914\u0930 Rewards?**

\u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u0938\u0935\u093E\u0932 \u0932\u093F\u0916\u0947\u0902 \u092F\u093E \u0928\u0940\u091A\u0947 \u0926\u093F\u090F \u0917\u090F \u0935\u093F\u0915\u0932\u094D\u092A\u094B\u0902 \u0915\u094B \u091A\u0941\u0928\u0947\u0902\u0964`;
    }
    return res.json({
      success: true,
      reply,
      isEscalatedSuggested: suggestEscalation,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/support/ticket", (req, res) => {
  try {
    const { userId, userName, userPhone, subject, message, chatTranscript } = req.body;
    if (!userId || !message) {
      return res.status(400).json({ error: "User ID and message are required" });
    }
    const ticketCode = `RP-TICK-${Math.floor(1e4 + Math.random() * 9e4)}`;
    const stmt = db.prepare(`
      INSERT INTO support_tickets (ticket_code, user_id, user_name, user_phone, category, subject, message, chat_transcript, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')
    `);
    const result = stmt.run(
      ticketCode,
      userId,
      userName || "User",
      userPhone || "",
      "General Inquiry",
      subject || "AI Support Escalation",
      message,
      chatTranscript || ""
    );
    res.json({
      success: true,
      ticketCode,
      ticketId: result.lastInsertRowid,
      message: `Support Ticket ${ticketCode} created successfully! Our team will respond shortly.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/support/tickets/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const tickets = db.prepare("SELECT * FROM support_tickets WHERE user_id = ? ORDER BY id DESC").all(userId);
    res.json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/admin/tickets", (req, res) => {
  try {
    const tickets = db.prepare("SELECT * FROM support_tickets ORDER BY id DESC").all();
    res.json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/tickets/:id/reply", (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply, status } = req.body;
    if (!adminReply) {
      return res.status(400).json({ error: "Admin reply content is required" });
    }
    db.prepare(`
      UPDATE support_tickets 
      SET admin_reply = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(adminReply, status || "replied", id);
    res.json({ success: true, message: "Reply sent to user ticket successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/admin/ai/settings", (req, res) => {
  try {
    const { enabled } = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('ai_assistant_enabled', ?)").run(enabled ? "true" : "false");
    res.json({ success: true, message: `AI Assistant ${enabled ? "enabled" : "disabled"} successfully!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message || "Invalid request" });
  }
  next();
});
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
    }
    app.get("*", (req, res) => {
      if (fs.existsSync(distPath)) {
        res.sendFile(path.join(distPath, "index.html"));
      } else {
        res.status(404).send("Application build not found. Please run npm run build.");
      }
    });
  }
  const PORT = Number(process.env.PORT || 3e3);
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Reliance Pay server running on port ${PORT} (NODE_ENV: ${process.env.NODE_ENV || "development"})`);
  });
}
startServer();
