// Script sederhana untuk melihat pengguna di database PostgreSQL
const { Client } = require("pg");
require("dotenv").config();

// Ambil kredensial dari file .env
const connectionString = process.env.DATABASE_URL;

// Validasi bahwa DATABASE_URL ada
if (!connectionString) {
  console.error("Error: DATABASE_URL environment variable is not set");
  console.error("Please set the DATABASE_URL environment variable in your .env file");
  process.exit(1);
}

console.log("Connecting to database...");
console.log("Connection string: [HIDDEN]"); // Don't log connection string at all for security

// Buat koneksi ke database
const client = new Client({ connectionString });

async function main() {
  try {
    // Hubungkan ke database
    await client.connect();
    console.log("Connected to database successfully!");

    // Query untuk mengambil pengguna
    const result = await client.query('SELECT id, email, name, role FROM "User"');

    // Tampilkan hasil
    console.log(`Found ${result.rows.length} users:`);
    console.table(result.rows);

    // Tampilkan detail untuk setiap pengguna
    result.rows.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Role: ${user.role}`);
    });
  } catch (error) {
    console.error("Error:", error.message);

    // Tampilkan informasi tambahan untuk membantu debugging
    if (error.code === "ECONNREFUSED") {
      console.error("\nConnection refused. Possible causes:");
      console.error("1. PostgreSQL server is not running");
      console.error("2. PostgreSQL is not listening on the specified port");
      console.error("3. Firewall is blocking the connection");
    } else if (error.code === "28P01") {
      console.error("\nAuthentication failed. Possible causes:");
      console.error("1. Incorrect username or password");
      console.error("2. PostgreSQL is configured to use a different authentication method");
    } else if (error.code === "3D000") {
      console.error("\nDatabase does not exist. Possible causes:");
      console.error("1. Database name is incorrect");
      console.error("2. Database has not been created yet");
    }

    console.error("\nTry these solutions:");
    console.error("1. Check if PostgreSQL is running");
    console.error("2. Verify your username and password");
    console.error("3. Make sure the database exists");
    console.error("4. Check if PostgreSQL is listening on the specified port");
  } finally {
    // Tutup koneksi
    await client.end();
    console.log("Connection closed");
  }
}

// Jalankan script
main();
