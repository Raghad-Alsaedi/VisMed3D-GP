const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

const SALT_ROUNDS = 10;

const users = [
  { userName: "ahmed.ahmadi", password: "Doctor@123", role: "doctor" },
  { userName: "fatimah.sultan", password: "Doctor@123", role: "doctor" },
  { userName: "sara.tech", password: "Tech@123", role: "technician" },
  { userName: "nasser.saeed", password: "Patient@123", role: "patient" },
  { userName: "khalid.mohammed", password: "Patient@123", role: "patient" },
  { userName: "layla.abdullah", password: "Patient@123", role: "patient" },
];

(async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
  });

  console.log("🔄 Encrypting passwords...\n");

  for (const user of users) {
    const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
    
    // ✅ تحديث جدول users مع التأكد من username و role
    await db.query(
      "UPDATE users SET password_hash = ? WHERE username = ? AND role = ?",
      [hash, user.userName, user.role]
    );
    
    console.log(`✅ ${user.userName} (${user.role}) → ${user.password}`);
  }

  console.log("\n🎉 Done successfully!");
  await db.end();
})();