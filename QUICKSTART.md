# 🎮 Langit Senja - Panduan Cepat

## Cara Menjalankan Game

### Opsi 1: Python (Termudah) ⭐

```bash
python3 server.py
```

Atau jalankan:

```bash
./start.sh
```

### Opsi 2: Node.js

```bash
npm start
```

### Opsi 3: HTTP Server

```bash
npx http-server -p 8000 -o
```

Game akan otomatis terbuka di browser di `http://localhost:8000`

---

## 🎯 Cara Bermain

### Kontrol

- **WASD** atau **Arrow Keys** → Bergerak
- **Shift** → Lari (sprint)
- **Spacebar** → Lompat
- **E** → Berinteraksi dengan NPC
- **Mouse** → Putar kamera (klik layar untuk lock pointer)
- **ESC** → Lepas pointer lock

### Misi

🎯 **Temukan 5 teman yang bersembunyi dalam waktu 10 menit!**

### Lokasi Teman yang Harus Ditemukan:

1. **Ariman** 🟣 - Di taman, samping kanan air mancur
2. **Putra** 🟣 - Di depan SMK TELESANDI BEKASI (bagian selatan kota)
3. **Ananda** 🟣 - Di depan SMPN 11 BEKASI (bagian barat daya kota)
4. **Zait** 🟣 - Di depan Konoha Mart (sebelah barat)
5. **Mahardhika** 🟣 - Di pinggir danau (sisi barat danau)

💡 **Tips:**

- Cari NPC dengan label nama yang melayang di atas kepala mereka!
- Saat mendekati NPC, prompt kuning akan muncul
- Tekan **E** untuk berbicara dengan mereka

### NPC Tambahan

- **Farhan Hadi Lutfi** 🟡 - Di taman, samping kiri air mancur (bukan target misi)
  - Dia akan memberikan semangat kepada kamu!

---

## 🏙️ Eksplorasi Kota

### Bangunan di Kota:

- 🏠 **40+ Rumah** - 4 tipe berbeda
- 🏫 **4 Sekolah:**
  - TK Bahrul Ulum (TK)
  - SDN AREN JAYA XV (SD)
  - SMPN 11 BEKASI (SMP)
  - SMK TELEKOMUNIKASI TELESANDI BEKASI (SMK)
- 🌳 **Taman** - Dengan air mancur dan bangku
- 🌊 **Danau** - Area yang lebih rendah dengan pemandangan indah
- 🏪 **Konoha Mart** - Supermarket hijau
- 🛒 **Farhan Mart** - Supermarket oranye
- 🏚️ **Warung kecil** - Toko lokal

### Karakter di Kota:

- 👥 **30 NPC** berjalan di trotoar (berbagai warna)
- 🏍️ **5 Motor** berkendara di jalan
- 🚗 **3 Mobil** berkendara di jalan
- 🐦 **10 Burung** terbang di langit

---

## 🎊 Menang & Kalah

### 🏆 Menang

- Temukan semua 5 teman sebelum waktu habis
- Popup "Kamu Menang! 🎉" akan muncul
- Klik **"Tutup"** untuk melanjutkan eksplorasi

### 😢 Kalah

- Waktu habis sebelum menemukan semua teman
- Langit berubah menjadi malam 🌙
- Popup "Kamu Kalah 😢" akan muncul
- Pilihan:
  - **"Tutup"** - Lanjut eksplorasi di malam hari
  - **"Coba Lagi"** - Mulai ulang game

---

## 🌆 Fitur Khusus

### Atmosfer

- ☀️ Langit sunset (senja) yang indah
- ☁️ Awan bergerak
- 💡 Pencahayaan dinamis dengan bayangan
- 🌃 Transisi siang ke malam saat kalah

### Gameplay

- ⏱️ Timer 10 menit
- 📊 Counter teman yang ditemukan (0/5)
- 💬 Sistem dialog saat bertemu NPC
- 🏃 Sprint untuk bergerak lebih cepat
- 🔒 Collision detection (tidak bisa tembus bangunan)

---

## 🐛 Troubleshooting

### Game tidak muncul?

1. Pastikan browser mendukung WebGL
2. Coba browser lain (Chrome/Firefox/Edge)
3. Update browser ke versi terbaru

### FPS rendah/lag?

1. Tutup tab browser lain
2. Kurangi ukuran window browser
3. Pastikan GPU driver up-to-date

### Kontrol tidak responsif?

1. Klik layar untuk lock pointer
2. Tekan ESC lalu klik lagi

---

## 📝 Perubahan Terbaru (v1.4.0)

✅ **Reorganisasi Tata Letak Kota**

- Semua bangunan dipindahkan ke tanah kosong (tidak di jalan/trotoar)
- Struktur kota mengikuti grid system yang logis
- Jalan bebas untuk navigasi kendaraan dan pejalan kaki
- Posisi sekolah, toko, dan rumah disesuaikan ke safe zones
- Visual kota lebih rapi dan realistic

---

## 📝 Update Sebelumnya

**v1.3.3 - Perbaikan Tata Letak Bangunan**
✅ Menghilangkan bangunan yang bertumpuk

**v1.3.2 - Perbaikan Danau**
✅ Air danau sekarang terlihat jelas

**v1.3.1 - Perbaikan Visual Feedback**
✅ NPC tetap warna ungu setelah ditemukan

**v1.3 - Sistem Interaksi dengan Tombol E**

- Player sekarang harus menekan **E** untuk berinteraksi dengan NPC
- Tidak lagi auto-interact saat mendekati NPC
- Interaction prompt kuning muncul saat dekat dengan NPC
- Gameplay lebih interaktif dan terkontrol

Detail di [CHANGELOG.md](./CHANGELOG.md)

---

## 📝 Update Sebelumnya

**v1.2 - Perbaikan Posisi Special NPCs**
✅ Putra, Ananda, Zait sekarang berada DI DEPAN bangunan (bukan di dalam)
✅ Ariman dan Farhan di samping air mancur (bukan di tengah)
✅ Mahardhika di pinggir danau untuk memudahkan pencarian

**v1.1 - Perbaikan Kecepatan & Ground**

✅ **Perbaikan Posisi NPC**

- Semua NPC sekarang berdiri di atas tanah (tidak tenggelam)
- Walking NPCs: Y = 0.9
- Vehicles: Y = 0.8

✅ **Penyesuaian Kecepatan**

- Player normal: 15 → 5
- Player sprint: 25 → 10
- NPC walking: 2-4 → 0.8-1.6
- Motorcycles: 15-20 → 6-8
- Cars: 12-15 → 5-7

Detail lengkap di [CHANGELOG.md](./CHANGELOG.md)

---

## 🎮 Selamat Bermain!

**Semoga berhasil menemukan semua teman dalam waktu 10 menit!** 🌅

Kalau ada pertanyaan atau masalah, lihat:

- [README.md](./README.md) - Dokumentasi lengkap
- [CHANGELOG.md](./CHANGELOG.md) - Riwayat perubahan
- [task.md](./task.md) - Spesifikasi asli game

---

Made with ❤️ using Three.js
