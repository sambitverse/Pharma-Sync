import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("Error: DATABASE_URL is not set in your .env file!");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

const initDb = async () => {
  try {
    console.log("Connecting to Supabase PostgreSQL database...");
    const client = await pool.connect();
    console.log("Connected successfully! Reading schema.sql...");

    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    console.log("Creating tables...");
    await client.query(schemaSql);
    console.log("Tables created successfully!");

    // Check if users exist. If not, seed default users
    const userCheck = await client.query("SELECT COUNT(*) FROM users");
    if (parseInt(userCheck.rows[0].count) === 0) {
      console.log("Seeding default accounts (password: password123)...");
      
      // Seed Admin
      const adminRes = await client.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
        ['System Administrator', 'admin@health.com', '$2a$10$R9hK6F.f.gR5wWJ/B.44xeD0u4gR4J4fU.hF1p2iY6m2x2/4S8W5W', 'admin']
      );
      
      // Seed Doctor (Dr. Gregory House)
      const docRes = await client.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
        ['Gregory House', 'doctor@health.com', '$2a$10$R9hK6F.f.gR5wWJ/B.44xeD0u4gR4J4fU.hF1p2iY6m2x2/4S8W5W', 'doctor']
      );
      await client.query(
        "INSERT INTO doctors (user_id, specialization) VALUES ($1, $2)",
        [docRes.rows[0].id, 'Diagnostic Medicine']
      );

      // Seed Patient (John Doe)
      const patRes = await client.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
        ['John Doe', 'patient@health.com', '$2a$10$R9hK6F.f.gR5wWJ/B.44xeD0u4gR4J4fU.hF1p2iY6m2x2/4S8W5W', 'patient']
      );
      await client.query(
        "INSERT INTO patients (user_id, age, gender, medical_history) VALUES ($1, $2, $3, $4)",
        [patRes.rows[0].id, 35, 'Male', 'Asthma history, general checkups']
      );
      
      console.log("Default users seeded successfully!");
    } else {
      console.log("Users already exist in database, skipping seed users.");
    }

    // Check if medicines exist. If not, seed default medicines
    const medCheck = await client.query("SELECT COUNT(*) FROM medicines");
    if (parseInt(medCheck.rows[0].count) === 0) {
      console.log("Seeding default medicines list...");
      const meds = [
        ['Paracetamol 500mg', 120],
        ['Amoxicillin 250mg', 8], // low stock warning item
        ['Metformin 500mg', 45],
        ['Ibuprofen 400mg', 90]
      ];

      for (const [name, qty] of meds) {
        await client.query(
          "INSERT INTO medicines (name, quantity) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING",
          [name, qty]
        );
      }
      console.log("Medicines inventory seeded successfully!");
    } else {
      console.log("Medicines list already exists, skipping inventory seed.");
    }

    client.release();
    console.log("Database initialization finished successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exit(1);
  }
};

initDb();
