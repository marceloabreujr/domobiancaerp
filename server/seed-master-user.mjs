import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

async function seedMasterUser() {
  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    // Check if master user already exists
    const [existing] = await connection.execute(
      "SELECT id FROM users WHERE username = ?",
      ["mauri"]
    );

    if (existing.length > 0) {
      console.log("Master user 'mauri' already exists. Updating password...");
      const hash = await bcrypt.hash("domobianca2025", 10);
      await connection.execute(
        "UPDATE users SET passwordHash = ?, role = 'admin', isActive = 1, loginMethod = 'local' WHERE username = ?",
        [hash, "mauri"]
      );
      console.log("Master user password updated.");
    } else {
      // Create master user
      const hash = await bcrypt.hash("domobianca2025", 10);
      const openId = `local_mauri_${Date.now()}`;
      await connection.execute(
        `INSERT INTO users (openId, username, passwordHash, name, email, loginMethod, role, isActive, lastSignedIn)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [openId, "mauri", hash, "Mauri Carvalho", "mauri@domobianca.com", "local", "admin", 1]
      );
      console.log("Master user 'mauri' created successfully!");
    }

    console.log("\n=== Credenciais do Master ===");
    console.log("Usuário: mauri");
    console.log("Senha: domobianca2025");
    console.log("Nível: Administrador");
    console.log("============================\n");
  } catch (error) {
    console.error("Error seeding master user:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

seedMasterUser().catch(console.error);
