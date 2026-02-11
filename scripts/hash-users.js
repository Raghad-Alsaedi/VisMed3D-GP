const bcrypt = require("bcrypt");

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
  console.log("USE volume_rendering;");
  console.log("-- Copy/paste into MySQL Workbench\n");

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, SALT_ROUNDS);

    console.log(`
UPDATE users
SET password_hash='${hash}',
    password_changed_at=NULL
WHERE userName='${u.userName}';
`);
  }
})();
