
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const projectDir = path.join(__dirname, "..");

dotenv.config({
  path: path.join(projectDir, ".env.local"),
});

const caPath = path.join(projectDir, "ca.pem");

const sslCa = process.env.DB_SSL_CA
  ? process.env.DB_SSL_CA.replace(/\\n/g, "\n")
  : fs.readFileSync(caPath, "utf8");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: sslCa,
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = db;
