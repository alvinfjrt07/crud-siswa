
const express = require("express");
const router = express.Router();
const db = require("../lib/db");

// READ: tampilkan semua siswa
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM siswa ORDER BY id DESC"
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// CREATE: tambah siswa
router.post("/", async (req, res, next) => {
  try {
    const { nama, kelas, jurusan } = req.body;

    if (
      typeof nama !== "string" ||
      typeof kelas !== "string" ||
      typeof jurusan !== "string" ||
      !nama.trim() ||
      !kelas.trim() ||
      !jurusan.trim()
    ) {
      return res.status(400).json({
        message: "Nama, kelas, dan jurusan wajib diisi.",
      });
    }

    if (
      nama.trim().length > 100 ||
      kelas.trim().length > 50 ||
      jurusan.trim().length > 100
    ) {
      return res.status(400).json({
        message: "Panjang data melebihi batas.",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO siswa (nama, kelas, jurusan)
       VALUES (?, ?, ?)`,
      [nama.trim(), kelas.trim(), jurusan.trim()]
    );

    res.status(201).json({
      message: "Siswa berhasil ditambahkan.",
      id: result.insertId,
    });
  } catch (error) {
    next(error);
  }
});

// UPDATE: edit siswa
router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { nama, kelas, jurusan } = req.body;

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        message: "ID siswa tidak valid.",
      });
    }

    if (
      typeof nama !== "string" ||
      typeof kelas !== "string" ||
      typeof jurusan !== "string" ||
      !nama.trim() ||
      !kelas.trim() ||
      !jurusan.trim()
    ) {
      return res.status(400).json({
        message: "Nama, kelas, dan jurusan wajib diisi.",
      });
    }

    if (
      nama.trim().length > 100 ||
      kelas.trim().length > 50 ||
      jurusan.trim().length > 100
    ) {
      return res.status(400).json({
        message: "Panjang data melebihi batas.",
      });
    }

    const [result] = await db.execute(
      `UPDATE siswa
       SET nama = ?, kelas = ?, jurusan = ?
       WHERE id = ?`,
      [nama.trim(), kelas.trim(), jurusan.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Siswa tidak ditemukan.",
      });
    }

    res.json({ message: "Data siswa berhasil diubah." });
  } catch (error) {
    next(error);
  }
});

// DELETE: hapus siswa
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({
        message: "ID siswa tidak valid.",
      });
    }

    const [result] = await db.execute(
      "DELETE FROM siswa WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Siswa tidak ditemukan.",
      });
    }

    res.json({ message: "Siswa berhasil dihapus." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
