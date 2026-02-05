const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

const SALT_ROUNDS = 10;

const users = [
  { userName: "ahmed.ahmadi", password: "Doctor@123" },
  { userName: "fatimah.sultan", password: "Doctor@123" },
  { userName: "sara.tech", password: "Tech@123" },
  { userName: "nasser.saeed", password: "Patient@123" },
  { userName: "khalid.mohammed", password: "Patient@123" },
  { userName: "layla.abdullah", password: "Patient@123" },
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
    await db.query(
      "UPDATE users SET password_hash = ? WHERE userName = ?",
      [hash, user.userName]
    );
    console.log(`✅ ${user.userName} → ${user.password}`);
  }

  console.log("\n🎉 Done successfully!");
  await db.end();
})();