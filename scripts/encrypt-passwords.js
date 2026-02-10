const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

const SALT_ROUNDS = 10;

const users = [
  { userName: "doc1001", password: "Doctor@123", role: "doctor" },
  { userName: "doc1002", password: "Doctor@123", role: "doctor" },
  { userName: "rt2001", password: "Tech@123", role: "technician" },
  { userName: "pat3001", password: "Patient@123", role: "patient" },
  { userName: "pat3002", password: "Patient@123", role: "patient" },
  { userName: "pat3003", password: "Patient@123", role: "patient" },
];

(async () => {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
  });

  console.log("Encrypting passwords...\n");

  for (const user of users) {
    const hash = await bcrypt.hash(user.password, SALT_ROUNDS);

    const [result] = await db.query(
      "UPDATE users SET password_hash = ? WHERE username = ? AND role = ?",
      [hash, user.userName, user.role],
    );

    if (result.affectedRows > 0) {
      console.log(`✓ ${user.userName} (${user.role}) → ${user.password}`);
    } else {
      console.log(`✗ ${user.userName} NOT FOUND in database!`);
    }
  }

  console.log("\nDone successfully!");
  await db.end();
})();