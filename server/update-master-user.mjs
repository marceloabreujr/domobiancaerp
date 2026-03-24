import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);
  
  const newUsername = "marceloabreu";
  const newPassword = "Ma@468709";
  const newName = "Marcelo Abreu";
  const hash = await bcrypt.hash(newPassword, 10);
  
  // First check if old user 'mauri' exists
  const [oldUsers] = await conn.execute("SELECT id FROM users WHERE username = ?", ["mauri"]);
  
  if (oldUsers.length > 0) {
    // Update existing user
    await conn.execute(
      "UPDATE users SET username = ?, passwordHash = ?, plainPassword = ?, name = ? WHERE username = ?",
      [newUsername, hash, newPassword, newName, "mauri"]
    );
    console.log(`Updated user 'mauri' -> '${newUsername}' with new password`);
  } else {
    // Check if marceloabreu already exists
    const [existing] = await conn.execute("SELECT id FROM users WHERE username = ?", [newUsername]);
    if (existing.length > 0) {
      // Update password and plainPassword
      await conn.execute(
        "UPDATE users SET passwordHash = ?, plainPassword = ?, name = ? WHERE username = ?",
        [hash, newPassword, newName, newUsername]
      );
      console.log(`Updated password for existing user '${newUsername}'`);
    } else {
      // Create new master user
      const openId = `local_${newUsername}_${Date.now()}`;
      await conn.execute(
        "INSERT INTO users (openId, username, passwordHash, plainPassword, name, loginMethod, role, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [openId, newUsername, hash, newPassword, newName, "local", "admin", true]
      );
      console.log(`Created master user '${newUsername}'`);
    }
  }
  
  // Verify
  const [verify] = await conn.execute("SELECT id, username, name, role, plainPassword FROM users WHERE username = ?", [newUsername]);
  console.log("Verification:", verify[0]);
  
  await conn.end();
}

main().catch(console.error);
