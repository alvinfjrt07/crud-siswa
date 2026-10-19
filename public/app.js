
const form = document.getElementById("siswaForm");
const idInput = document.getElementById("siswaId");
const namaInput = document.getElementById("nama");
const kelasInput = document.getElementById("kelas");
const jurusanInput = document.getElementById("jurusan");
const tbody = document.getElementById("dataSiswa");
const totalSiswa = document.getElementById("totalSiswa");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const pesan = document.getElementById("pesan");
const searchInput = document.getElementById("search");

let daftarSiswa = [];

function tampilkanPesan(teks, jenis = "success") {
  pesan.textContent = teks;
  pesan.className = jenis;
}

async function requestAPI(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Permintaan gagal.");
  }

  return data;
}

// READ
async function muatData() {
  tbody.replaceChildren();

  const row = document.createElement("tr");
  const cell = document.createElement("td");
  cell.colSpan = 5;
  cell.textContent = "Memuat data...";
  row.appendChild(cell);
  tbody.appendChild(row);

  try {
    daftarSiswa = await requestAPI("/api/siswa");
    tampilkanData();
  } catch (error) {
    tbody.replaceChildren();

    const errorRow = document.createElement("tr");
    const errorCell = document.createElement("td");
    errorCell.colSpan = 5;
    errorCell.textContent = error.message;
    errorRow.appendChild(errorCell);
    tbody.appendChild(errorRow);

    tampilkanPesan(error.message, "error");
  }
}

function buatCell(teks) {
  const td = document.createElement("td");
  td.textContent = teks;
  return td;
}

function tampilkanData() {
  tbody.replaceChildren();

  const keyword = searchInput.value.trim().toLowerCase();

  const hasil = daftarSiswa.filter((siswa) =>
    [siswa.nama, siswa.kelas, siswa.jurusan]
      .some((nilai) => nilai.toLowerCase().includes(keyword))
  );

  totalSiswa.textContent = daftarSiswa.length;

  if (hasil.length === 0) {
    const row = document.createElement("tr");
    const cell = buatCell(
      daftarSiswa.length === 0
        ? "Belum ada data siswa."
        : "Data tidak ditemukan."
    );
    cell.colSpan = 5;
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  hasil.forEach((siswa, index) => {
    const row = document.createElement("tr");

    row.appendChild(buatCell(String(index + 1)));
    row.appendChild(buatCell(siswa.nama));
    row.appendChild(buatCell(siswa.kelas));
    row.appendChild(buatCell(siswa.jurusan));

    const aksi = document.createElement("td");
    const group = document.createElement("div");
    group.className = "action-group";

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "action-btn edit-btn";
    edit.textContent = "Edit";
    edit.dataset.action = "edit";
    edit.dataset.id = siswa.id;

    const hapus = document.createElement("button");
    hapus.type = "button";
    hapus.className = "action-btn delete-btn";
    hapus.textContent = "Hapus";
    hapus.dataset.action = "delete";
    hapus.dataset.id = siswa.id;

    group.append(edit, hapus);
    aksi.appendChild(group);
    row.appendChild(aksi);
    tbody.appendChild(row);
  });
}

// CREATE dan UPDATE
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = idInput.value;

  const siswa = {
    nama: namaInput.value.trim(),
    kelas: kelasInput.value.trim(),
    jurusan: jurusanInput.value.trim(),
  };

  if (!siswa.nama || !siswa.kelas || !siswa.jurusan) {
    tampilkanPesan("Semua kolom wajib diisi.", "error");
    return;
  }

  submitBtn.disabled = true;

  try {
    const data = await requestAPI(
      id ? `/api/siswa/${id}` : "/api/siswa",
      {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(siswa),
      }
    );

    form.reset();
    idInput.value = "";
    formTitle.textContent = "Tambah Siswa";
    submitBtn.textContent = "Simpan Data";
    cancelBtn.hidden = true;

    tampilkanPesan(data.message);
    await muatData();
  } catch (error) {
    tampilkanPesan(error.message, "error");
  } finally {
    submitBtn.disabled = false;
  }
});

// EDIT dan DELETE
tbody.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const siswa = daftarSiswa.find((item) => item.id === id);

  if (!siswa) return;

  if (button.dataset.action === "edit") {
    idInput.value = siswa.id;
    namaInput.value = siswa.nama;
    kelasInput.value = siswa.kelas;
    jurusanInput.value = siswa.jurusan;

    formTitle.textContent = "Edit Siswa";
    submitBtn.textContent = "Simpan Perubahan";
    cancelBtn.hidden = false;

    form.scrollIntoView({ behavior: "smooth", block: "center" });
    namaInput.focus();
    return;
  }

  if (button.dataset.action === "delete") {
    if (!confirm(`Yakin ingin menghapus ${siswa.nama}?`)) return;

    button.disabled = true;

    try {
      const data = await requestAPI(`/api/siswa/${id}`, {
        method: "DELETE",
      });

      tampilkanPesan(data.message);
      await muatData();
    } catch (error) {
      tampilkanPesan(error.message, "error");
    } finally {
      button.disabled = false;
    }
  }
});

// Batal edit
cancelBtn.addEventListener("click", () => {
  form.reset();
  idInput.value = "";
  formTitle.textContent = "Tambah Siswa";
  submitBtn.textContent = "Simpan Data";
  cancelBtn.hidden = true;
  tampilkanPesan("");
});

// Pencarian
searchInput.addEventListener("input", tampilkanData);

// Jalankan saat halaman dibuka
muatData();
