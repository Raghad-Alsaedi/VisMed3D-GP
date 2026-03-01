const bcrypt = require("bcryptjs");
const SALT_ROUNDS = 10;

const users = [
  { username: "doc1001",  password: "Doctor1@123",  role: "doctor",      name: "Ahmed Mohammed Alharbi" },
  { username: "doc1002",  password: "Doctor2@123",  role: "doctor",      name: "Sarah Abdullah Almutairi" },
  { username: "rt2001",   password: "Tech1@123",    role: "technician",  name: "Khalid Omar Alqahtani" },
  { username: "pat3001",  password: "Patient1@123", role: "patient",     name: "Noura Alrashid" },
  { username: "pat3002",  password: "Patient2@123", role: "patient",     name: "Yousef Alshehri" },
  { username: "pat3003",  password: "Patient3@123", role: "patient",     name: "Hessa Alotaibi" },
  { username: "admin001", password: "Admin@123",    role: "admin",       name: "System Admin" },
];

(async () => {
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);
    console.log(`UPDATE users SET password_hash='${hash}' WHERE username='${u.username}';`);
  }
})();