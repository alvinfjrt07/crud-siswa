
const express = require("express");
const path = require("path");
const db = require("./lib/db");
const siswaRoutes = require("./routes/siswa");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/siswa", siswaRoutes);

// Menangani error dari route
app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    message: "Terjadi kesalahan pada server atau database.",
  });
});

// Jalankan server setelah koneksi MySQL berhasil
async function startServer() {
  try {
    await db.query("SELECT 1");
    console.log("Koneksi MySQL berhasil!");

    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Gagal terhubung ke MySQL:", error.message);
    process.exit(1);
  }
}

startServer();
