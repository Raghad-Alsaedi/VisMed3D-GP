// hash-users.js
// ============================================================
// Script لتوليد password hashes لجميع مستخدمي النظام
// ============================================================

const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

// 📋 معلومات تسجيل الدخول الكاملة
const users = [
  { 
    username: "doc1001", 
    password: "Doctor@123", 
    role: "doctor",
    name: "Ahmed Mohammed Alharbi",
    specialty: "Orthopedist"
  },
  { 
    username: "doc1002", 
    password: "Doctor@123", 
    role: "doctor",
    name: "Sarah Abdullah Almutairi",
    specialty: "Radiologist"
  },
  { 
    username: "rt2001", 
    password: "Tech@123", 
    role: "technician",
    name: "Khalid Omar Alqahtani",
    specialty: "Radiology Technician"
  },
  { 
    username: "pat3001", 
    password: "Patient@123", 
    role: "patient",
    name: "Noura Alrashid",
    mrn: "MRN000001"
  },
  { 
    username: "pat3002", 
    password: "Patient@123", 
    role: "patient",
    name: "Yousef Alshehri",
    mrn: "MRN000002"
  },
  { 
    username: "pat3003", 
    password: "Patient@123", 
    role: "patient",
    name: "Hessa Alotaibi",
    mrn: "MRN000003"
  },
];

(async () => {
  console.log("=".repeat(80));
  console.log("🔐 VisMed3D - Password Hash Generator");
  console.log("=".repeat(80));
  console.log("");
  
  // ============================================================
  // عرض معلومات تسجيل الدخول
  // ============================================================
  console.log("📋 معلومات تسجيل الدخول الكاملة:");
  console.log("");
  console.log("┌───────────┬───────────────┬─────────────┬──────────────────────────┐");
  console.log("│ Username  │ Password      │ Role        │ Name                     │");
  console.log("├───────────┼───────────────┼─────────────┼──────────────────────────┤");
  
  users.forEach(u => {
    console.log(`│ ${u.username.padEnd(9)} │ ${u.password.padEnd(13)} │ ${u.role.padEnd(11)} │ ${u.name.padEnd(24)} │`);
  });
  
  console.log("└───────────┴───────────────┴─────────────┴──────────────────────────┘");
  console.log("");
  
  // ============================================================
  // توليد Password Hashes
  // ============================================================
  console.log("=".repeat(80));
  console.log("🔒 Password Hashes (bcrypt - 10 rounds):");
  console.log("=".repeat(80));
  console.log("");

  const hashes = [];
  
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
    hashes.push({ username: u.username, hash });
    console.log(`${u.username}: ${hash}`);
  }
  
  console.log("");
  
  // ============================================================
  // SQL لتحديث قاعدة البيانات
  // ============================================================
  console.log("=".repeat(80));
  console.log("💾 SQL Commands - انسخ هذه الأوامر وشغلها في MySQL Workbench:");
  console.log("=".repeat(80));
  console.log("");
  console.log("USE VisMed3D;");
  console.log("");

  for (const item of hashes) {
    console.log(`UPDATE users SET password_hash='${item.hash}' WHERE username='${item.username}';`);
  }
  
  console.log("");
  console.log("-- ✅ تحقق من النتيجة:");
  console.log("SELECT username, role, first_name, last_name, is_active FROM users;");
  console.log("");
  
  // ============================================================
  // ملخص
  // ============================================================
  console.log("=".repeat(80));
  console.log("✅ تم توليد الـ Hashes بنجاح!");
  console.log("=".repeat(80));
  console.log("");
  console.log("📝 الخطوات التالية:");
  console.log("1. انسخ أوامر SQL أعلاه");
  console.log("2. شغلها في MySQL Workbench");
  console.log("3. جرب تسجيل دخول بأي من المستخدمين أعلاه");
  console.log("");
  console.log("🌐 رابط تسجيل الدخول: http://localhost:3000/login");
  console.log("");
})();