import bcrypt from "bcryptjs";
import postgres from "postgres";

const DATABASE_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("SUPABASE_DB_URL or DATABASE_URL not set");
  process.exit(1);
}

async function seedMasterUser() {
  const sql = postgres(DATABASE_URL, { ssl: 'require' });

  try {
    // Check if master user already exists
    const existing = await sql`SELECT id FROM users WHERE username = ${'mauri'}`;

    if (existing.length > 0) {
      console.log("Master user 'mauri' already exists. Updating password...");
      const hash = await bcrypt.hash("domobianca2025", 10);
      await sql`UPDATE users SET password_hash = ${hash}, plain_password = ${'domobianca2025'}, role = 'admin', is_active = true, login_method = 'local' WHERE username = ${'mauri'}`;
      console.log("Master user password updated.");
    } else {
      // Create master user
      const hash = await bcrypt.hash("domobianca2025", 10);
      const openId = `local_mauri_${Date.now()}`;
      await sql`INSERT INTO users (open_id, username, password_hash, plain_password, name, email, login_method, role, is_active, last_signed_in)
         VALUES (${openId}, ${'mauri'}, ${hash}, ${'domobianca2025'}, ${'Mauri Carvalho'}, ${'mauri@domobianca.com'}, ${'local'}, 'admin', true, NOW())`;
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
    await sql.end();
  }
}

seedMasterUser().catch(console.error);
