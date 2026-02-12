// test-db-connection.js
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");

async function testDatabase() {
  console.log("🔍 Testing Database Connection and Password Verification...\n");

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "VisMed3D",
    });

    console.log("✅ Connected to database\n");

    const [rows] = await connection.query(
      `SELECT 
        username, 
        password_hash, 
        role, 
        is_active,
        first_name,
        last_name
      FROM users 
      WHERE username = ?`,
      ["doc1001"]
    );

    if (rows.length === 0) {
      console.log("❌ User 'doc1001' not found in database!");
      await connection.end();
      return;
    }

    const user = rows[0];
    
    console.log("📊 User Data from Database:");
    console.log("─".repeat(60));
    console.log(`Username:      ${user.username}`);
    console.log(`Name:          ${user.first_name} ${user.last_name}`);
    console.log(`Role:          ${user.role}`);
    console.log(`Active:        ${user.is_active}`);
    console.log(`Hash (first 40): ${user.password_hash.substring(0, 40)}...`);
    console.log("─".repeat(60));
    console.log();

    const testPasswords = [
      "Doctor@123",
      "doctor@123",
      "Doctor123",
      "password",
    ];

    console.log("🔐 Testing Passwords:");
    console.log("─".repeat(60));

    for (const pwd of testPasswords) {
      const isValid = await bcrypt.compare(pwd, user.password_hash);
      const icon = isValid ? "✅" : "❌";
      console.log(`${icon} "${pwd}": ${isValid ? "VALID" : "Invalid"}`);
      
      if (isValid) {
        console.log("\n🎉 SUCCESS! The correct password is: " + pwd);
        break;
      }
    }

    console.log("─".repeat(60));
    
    await connection.end();

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testDatabase();