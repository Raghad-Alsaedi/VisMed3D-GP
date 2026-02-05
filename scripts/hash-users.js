const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const users = [
  { userName: "admin001", password: "Admin@12345" },
  { userName: "doc1001", password: "Doctor1@12345" },
  { userName: "doc1002", password: "Doctor2@12345" },
  { userName: "rt2001", password: "Tech@12345" },
  { userName: "pat3001", password: "Patient1@12345" },
  { userName: "pat3002", password: "Patient2@12345" },
  { userName: "pat3003", password: "Patient3@12345" },
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