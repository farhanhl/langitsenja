# Changelog - Perbaikan Posisi NPC dan Kecepatan

## Update v1.4.0 - 2025-10-18 (Reorganisasi Tata Letak Kota)

### Masalah yang Diperbaiki:

1. **Bangunan berada di atas jalan aspal dan trotoar**
   - Banyak rumah, sekolah, dan toko berada di posisi yang overlap dengan jalan
   - Bangunan harus berada di tanah kosong, bukan di aspal atau trotoar
   - Struktur kota tidak logis

### Struktur Jalan (Grid System):

**Jalan Horizontal (lebar 200, tinggi 8):**

- Z = -60 (dari X: -100 sampai 100)
- Z = -20 (dari X: -100 sampai 100)
- Z = 20 (dari X: -100 sampai 100)
- Z = 60 (dari X: -100 sampai 100)

**Jalan Vertikal (lebar 8, tinggi 200):**

- X = -60 (dari Z: -100 sampai 100)
- X = -20 (dari Z: -100 sampai 100)
- X = 20 (dari Z: -100 sampai 100)
- X = 60 (dari Z: -100 sampai 100)

**Trotoar:** 2 unit di kedua sisi setiap jalan

### Safe Zones (Area Tanah Kosong):

**Blok yang Aman untuk Bangunan:**

1. Corner blocks: (-85 to -75, -85 to -75), (75 to 85, -85 to -75), dll
2. Between roads: (-85 to -25, -45 to -35), (25 to 85, -45 to -35), dll
3. Far corners: Jauh dari persilangan jalan

### Perubahan Posisi Bangunan:

**Rumah (40 total):**

- Block 1 (Top-left): (-85,-85), (-75,-85), (-85,-75), (-75,-75)
- Block 2 (Left-mid): (-85,-45), (-75,-45), (-45,-85), (-35,-85)
- Block 3 (Central-left): (-85,-5), (-75,-5), (-45,-45), (-35,-45)
- Block 4 (Top-right): (75,-85), (85,-85), (75,-75), (85,-75)
- Block 5 (Right-mid): (35,-85), (45,-85), (75,-45), (85,-45)
- Block 6 (Bottom-left): (-85,75), (-75,75), (-45,75), (-35,75)
- Block 7 (Bottom-right): (35,75), (45,75), (75,75), (85,75)

**Sekolah (4 total):**

- TK Bahrul Ulum: (-50,-45) → **(-40,-45)** (Northwest quadrant)
- SDN AREN JAYA XV: (50,-45) → **(40,-45)** (Northeast quadrant)
- SMPN 11 BEKASI: (-50,50) → **(-40,45)** (Southwest quadrant)
- SMK TELESANDI: (50,50) → **(40,45)** (Southeast quadrant)

**Toko (4 total):**

- Konoha Mart: (-40,8) → **(-40,5)** (West-center)
- Farhan Mart: (40,8) → **(40,5)** (East-center)
- Warung 1: (-35,-8) → **(-40,-10)** (Northwest)
- Warung 2: (35,-8) → **(40,-10)** (Northeast)

**Special NPCs (Updated positions):**

- Ariman: (5,-40) - Park (tetap)
- Putra: (50,62) → **(40,57)** - Di depan SMK TELESANDI
- Ananda: (-50,62) → **(-40,57)** - Di depan SMPN 11 BEKASI
- Zait: (-40,15) → **(-40,13)** - Di depan Konoha Mart
- Mahardhika: (-15,40) - Lake (tetap)
- Farhan Hadi Lutfi: (-5,-40) - Park (tetap)

### Peta Kota Baru:

```
Grid Map (showing road intersections):

    -60      -20       20       60
     │        │        │        │
─60──┼────────┼────────┼────────┼──  Road
     │   TK   │  Park  │  SDN   │
─20──┼────────┼────────┼────────┼──  Road
     │Konoha  │        │Farhan  │
 20──┼────────┼────────┼────────┼──  Road
     │        │        │        │
 60──┼────────┼────────┼────────┼──  Road
     │ SMPN   │  Lake  │  SMK   │

[H] = Houses in safe zones (corners & far areas)
```

### File yang Dimodifikasi:

1. **src/CityBuilder.js**

   - `createHouses()` - Complete rebuild posisi rumah (line 140-166)
   - `createSchools()` - Adjusted posisi sekolah (line 230-246)
   - `createShops()` - Adjusted posisi toko (line 411-421)

2. **src/NPCManager.js**
   - `createSpecialNPCs()` - Updated posisi NPCs (line 337-364)

### Hasil:

✅ **Tidak ada bangunan di atas jalan atau trotoar**
✅ **Semua bangunan di tanah kosong yang aman**
✅ **Jalan bebas untuk kendaraan dan pejalan kaki**
✅ **Struktur kota lebih logis dan realistic**
✅ **Navigasi lebih mudah dan smooth**
✅ **Visual lebih rapi dan organized**

---

## Update v1.3.3 - 2025-10-18 (Perbaikan Tata Letak Bangunan)

### Masalah yang Diperbaiki:

1. **Bangunan bertumpuk/bertabrakan**
   - Beberapa rumah berada terlalu dekat dengan sekolah
   - Rumah di area (35-45, 35-45) bertumpuk dengan area SMK dan SMPN
   - Collision dan visual yang tidak bagus

### Perubahan Detail:

**Posisi Rumah yang Dipindahkan:**

**Area yang Dihapus/Dipindah:**

- Rumah di (35, 35), (45, 35), (35, 45), (45, 45) ❌ Terlalu dekat SMK
- Rumah di (-45, 35), (-35, 35), (-45, 45), (-35, 45) ❌ Terlalu dekat SMPN
- Rumah di (70, 35), (80, 35), (70, 45), (80, 45) ❌ Terlalu dekat area sekolah

**Posisi Baru yang Aman:**

- Bottom-left quadrant: (-80, 70), (-70, 70), (-80, 80), (-70, 80) ✅
- Dekat danau: (-25, 70), (-15, 70), (-25, 80), (-15, 80) ✅
- Bottom-right quadrant: (70, 70), (80, 70), (70, 80), (80, 80) ✅
- Dekat danau: (15, 70), (25, 70), (15, 80), (25, 80) ✅
- Center area: (-80, 0), (-70, 0), (70, 0), (80, 0) ✅

### Distribusi Bangunan Sekarang:

```
        UTARA (-Z)
           ↑

[Rumah]  [TK]  [SDN]  [Rumah]
  -80,-80      0,-40   70,-80

[Rumah]        [Park]        [Rumah]
  -80,-35                    70,-35

[Konoha]  [Rumah]  [Farhan]  [Rumah]
  -40,8    -80,0    40,8     70,0

[SMPN]                       [SMK]
 -50,50                      50,50

[Rumah]        [Danau]       [Rumah]
 -80,70         0,40         70,70

[Rumah]       [Rumah]        [Rumah]
 -80,80       -15,80         70,80

        SELATAN (+Z)
           ↓
```

### Minimum Distance Rules:

- Rumah ↔ Sekolah: > 20 unit
- Rumah ↔ Rumah: ≥ 10 unit
- Rumah ↔ Park: > 10 unit
- Rumah ↔ Lake: > 15 unit (untuk akses)
- Rumah ↔ Toko: > 10 unit

### File yang Dimodifikasi:

**src/CityBuilder.js** (line 140-157)

- Update array `housePositions`
- Menghapus 16 posisi konflik
- Menambahkan 16 posisi baru yang aman
- Total tetap 40 rumah

### Hasil:

✅ Tidak ada bangunan yang bertumpuk
✅ Jarak antar bangunan aman untuk navigasi
✅ Semua bangunan mudah diakses
✅ Collision detection bekerja lebih baik
✅ Visual lebih rapi dan organized

---

## Update v1.3.2 - 2025-10-18 (Perbaikan Danau)

### Masalah yang Diperbaiki:

1. **Air danau tidak terlihat**
   - Danau berada di bawah permukaan tanah (Y = -0.4)
   - Air danau tertutup oleh ground mesh

### Perubahan Detail:

**Lake Position:**

- Posisi lama: Y = -0.4 (di bawah ground) ❌
- Posisi baru: Y = 0.15 (di atas ground) ✅

**Lake Properties Update:**

- Height: 0.2 → 0.3 (lebih tebal/terlihat)
- Opacity: 0.8 → 0.7 (sedikit lebih transparan)
- Roughness: 0.1 → 0.2 (lebih natural)
- Metalness: ditambahkan 0.3 (efek reflektif air)

**Ground Height Simplification:**

- Menghapus logika khusus untuk lake area di Player.js
- Ground height sekarang konsisten di 0.9 untuk seluruh area
- Player bisa berjalan melewati danau (air setinggi pergelangan kaki)

### File yang Dimodifikasi:

1. **src/CityBuilder.js** (line 370-395)

   - Update posisi danau dari Y=-0.4 ke Y=0.15
   - Update material properties (opacity, roughness, metalness)
   - Update height geometry

2. **src/Player.js** (line 186-189)
   - Simplifikasi getGroundHeight()
   - Hapus conditional untuk lake area
   - Ground height konsisten di 0.9

### Hasil:

✅ Air danau sekarang terlihat jelas di atas tanah
✅ Warna biru danau terlihat dengan baik
✅ Material air lebih natural dengan sedikit refleksi
✅ Player bisa berjalan melewati danau (efek berjalan di air dangkal)

---

## Update v1.3.1 - 2025-10-18 (Perbaikan Visual Feedback)

### Perubahan:

1. **NPC tetap dengan warna asli setelah berinteraksi**
   - NPC mission (ungu/0xff00ff) tidak berubah warna hijau lagi
   - Hanya bubble text/name tag yang hilang setelah ditemukan
   - Visual lebih konsisten dan clean

**Sebelum:**

- Interaksi → NPC berubah hijau + name tag hilang ❌

**Sekarang:**

- Interaksi → Name tag hilang, warna tetap ungu ✅

**Alasan:**

- Perubahan warna hijau terlihat kurang natural
- Cukup name tag hilang sebagai indikator sudah ditemukan
- Warna ungu tetap membuat NPC special lebih mudah dikenali

---

## Update v1.3 - 2025-10-18 (Sistem Interaksi dengan Tombol E)

### Fitur Baru:

1. **Sistem Interaksi dengan Tombol E**
   - Player sekarang harus menekan tombol **E** untuk berinteraksi dengan NPC
   - Tidak lagi auto-interact hanya dengan mendekati NPC
   - Interaction prompt muncul saat player dekat dengan NPC

### Perubahan Detail:

**Interaction Flow:**

1. Player mendekati NPC (radius 3 unit)
2. Interaction prompt muncul: **"Tekan [E] untuk berbicara dengan [Nama NPC]"**
3. Player menekan tombol **E**
4. Dialog NPC muncul
5. NPC ditandai sebagai ditemukan

**UI yang Ditambahkan:**

- **Interaction Prompt**: Box kuning dengan animasi pulse
  - Posisi: Tengah bawah layar
  - Background: Kuning emas dengan border
  - Animasi: Pulse effect untuk menarik perhatian
  - Muncul otomatis saat dekat NPC
  - Hilang otomatis saat menjauh dari NPC

**Controls Update:**

- Tombol **E** ditambahkan ke daftar kontrol di UI

### File yang Dimodifikasi:

1. **src/GameManager.js**

   - Menambahkan `setupInteractionControls()` method
   - Menambahkan `tryInteract()` method untuk handle tombol E
   - Mengubah `checkNPCInteraction()` menjadi `checkNPCProximity()`
   - Menambahkan `showInteractionPrompt()` dan `hideInteractionPrompt()`
   - Menambahkan state `nearbyNPC` untuk track NPC terdekat

2. **index.html**
   - Menambahkan `#interactionPrompt` div dengan styling
   - Menambahkan animasi CSS `@keyframes pulse`
   - Update daftar kontrol dengan tombol E

### Keuntungan:

✅ Player memiliki kontrol lebih baik kapan berinteraksi
✅ Tidak ada interaksi tidak disengaja
✅ Gameplay lebih engaging dan interaktif
✅ Visual feedback jelas (prompt kuning beranimasi)
✅ Lebih sesuai dengan standar game modern

---

## Update v1.2 - 2025-10-18 (Perbaikan Posisi Special NPCs)

### Masalah yang Diperbaiki:

1. **Special NPCs tersembunyi di dalam bangunan**
   - Putra berada di dalam SMK TELESANDI
   - Ananda berada di dalam SMPN 11 BEKASI
   - Zait berada di dalam Konoha Mart
   - Ariman dan Farhan berada di tengah air mancur

### Perubahan Posisi Special NPCs:

| NPC            | Posisi Lama    | Posisi Baru        | Keterangan                                          |
| -------------- | -------------- | ------------------ | --------------------------------------------------- |
| **Ariman**     | (0, 0.9, -40)  | **(5, 0.9, -40)**  | Di samping air mancur (tidak di tengah)             |
| **Putra**      | (50, 0.9, 50)  | **(50, 0.9, 62)**  | Di depan SMK TELESANDI (bukan di dalam)             |
| **Ananda**     | (-50, 0.9, 50) | **(-50, 0.9, 62)** | Di depan SMPN 11 BEKASI (bukan di dalam)            |
| **Zait**       | (-40, 0.9, 8)  | **(-40, 0.9, 18)** | Di depan Konoha Mart (bukan di dalam)               |
| **Mahardhika** | (0, 0.9, 40)   | **(-15, 0.9, 40)** | Di pinggir danau (lebih ke samping)                 |
| **Farhan**     | (0, 0.9, -40)  | **(-5, 0.9, -40)** | Di samping air mancur (berseberangan dengan Ariman) |

### Penjelasan Teknis:

**SMK TELESANDI & SMPN 11 BEKASI:**

- Ukuran bangunan: 12 (lebar) x 10 (kedalaman)
- Posisi sekolah di z=50, kedalaman 10 → ujung depan di z=55
- NPC ditempatkan di z=62 (55 + 7 unit jarak aman dari pintu)

**Konoha Mart:**

- Ukuran bangunan: 10 (lebar) x 8 (kedalaman)
- Posisi toko di z=8, kedalaman 8 → ujung depan di z=12
- NPC ditempatkan di z=18 (12 + 6 unit jarak aman dari pintu)

**Park (Air Mancur):**

- Air mancur di posisi (0, 0, -40)
- Ariman di x=5 (kanan air mancur)
- Farhan di x=-5 (kiri air mancur)
- Keduanya mudah ditemukan di area taman

**Lake (Danau):**

- Danau di x=0, z=40
- Mahardhika dipindah ke x=-15 agar di pinggir danau, bukan tengah

---

## Update v1.1 - 2025-10-18 (Perbaikan Kecepatan & Ground)

### Masalah yang Diperbaiki:

1. **NPC Tenggelam di Tanah**

   - Semua NPC (walking, vehicles, special NPCs) memiliki posisi Y = 0
   - Menyebabkan model terlihat tenggelam ke dalam tanah

2. **Kecepatan Terlalu Cepat**
   - Player speed terlalu tinggi (15 normal, 25 sprint)
   - NPC walking speed terlalu tinggi (2-4)
   - Kendaraan terlalu cepat (12-20)

### Perubahan yang Dilakukan:

#### Player.js

- ✅ Speed dikurangi: `15 → 5` (normal), `25 → 10` (sprint)
- ✅ Jump speed disesuaikan: `10 → 8`
- ✅ Gravity disesuaikan: `-30 → -25`
- ✅ Posisi awal Y: `0 → 0.9`
- ✅ Ground height default: `0 → 0.9`
- ✅ Lake ground height: `-0.5 → 0.4`

#### NPCManager.js

**Walking NPCs:**

- ✅ Posisi Y: `0 → 0.9`
- ✅ Speed: `2-4 → 0.8-1.6`
- ✅ Update loop mempertahankan Y = 0.9

**Motorcycles:**

- ✅ Posisi Y: `0 → 0.8`
- ✅ Speed: `15-20 → 6-8`
- ✅ Update loop mempertahankan Y = 0.8

**Cars:**

- ✅ Posisi Y: `0 → 0.8`
- ✅ Speed: `12-15 → 5-7`
- ✅ Update loop mempertahankan Y = 0.8

**Special NPCs (Mission Characters):**

- ✅ Posisi Y: `0 → 0.9`
  - Ariman (Park)
  - Putra (SMK TELESANDI)
  - Ananda (SMPN 11 BEKASI)
  - Zait (Konoha Mart)
  - Mahardhika (Lake)

**Farhan Hadi Lutfi:**

- ✅ Posisi Y: `0 → 0.9`

### Hasil:

✅ **Semua karakter sekarang berdiri di atas tanah dengan benar**
✅ **Kecepatan gameplay lebih realistis dan mudah dikontrol**
✅ **Player tidak lagi bergerak terlalu cepat**
✅ **NPC dan kendaraan bergerak dengan kecepatan yang wajar**

### Cara Testing:

1. Jalankan server: `python3 server.py` atau `npm start`
2. Buka game di browser
3. Periksa:
   - ✓ Player berdiri di tanah, tidak tenggelam
   - ✓ Semua NPC berdiri dengan benar di sidewalk
   - ✓ Kendaraan tidak tenggelam di jalan
   - ✓ Special NPCs dengan name tag terlihat dengan jelas
   - ✓ Kecepatan movement terasa natural
   - ✓ Sprint tidak terlalu cepat
   - ✓ NPC walking speed wajar

### Catatan Teknis:

Posisi Y = 0.9 dipilih karena:

- Model Minecraft-style memiliki kaki yang mulai dari Y = -0.45 (dalam local space)
- Total tinggi model sekitar 1.8 unit
- Dengan group position Y = 0.9, bagian bawah kaki tepat di Y = 0.45 (0.9 - 0.45)
- Ground mesh berada di Y = 0
- Jarak 0.45 unit memberikan clearance yang cukup agar tidak terlihat tenggelam

### File yang Dimodifikasi:

1. `src/Player.js` - Line 10-15, 186-196
2. `src/NPCManager.js` - Line 59-74, 141-156, 164-181, 323-325, 344-346, 398-401, 426-429

---

**Status: ✅ SELESAI**
**Tested: ✅ Ready for gameplay**
