# 🎮 Sistem Interaksi - Langit Senja

## Cara Kerja Interaksi dengan NPC

### 📍 Step-by-Step Interaksi

```
1️⃣ EKSPLORASI
   Player berjalan mencari NPC
   ↓

2️⃣ MENDEKATI NPC (Radius 3 unit)
   ┌─────────────────────────────┐
   │  Tekan [E] untuk berbicara  │
   │      dengan Ariman          │
   └─────────────────────────────┘
        ⬆️ PROMPT KUNING MUNCUL
   ↓

3️⃣ TEKAN TOMBOL E
   Player menekan tombol E untuk berinteraksi
   ↓

4️⃣ DIALOG MUNCUL
   ┌─────────────────────────────┐
   │         ARIMAN              │
   │   "Yah aku ketawan."        │
   │                             │
   │          [ OK ]             │
   └─────────────────────────────┘
   ↓

5️⃣ NPC DITANDAI SEBAGAI DITEMUKAN
   ✅ Name tag hilang
   ✅ NPC tetap warna ungu (tidak berubah)
   ✅ Counter bertambah: 1/5
```

---

## 🎯 Visual Feedback

### Saat Mendekati NPC:

**Interaction Prompt Appearance:**
```
┌──────────────────────────────────────────┐
│                                          │
│  🟡 Tekan [E] untuk berbicara dengan    │
│             [Nama NPC]                   │
│                                          │
│  • Background: Kuning emas               │
│  • Border: 3px kuning tua               │
│  • Animasi: Pulse (membesar-mengecil)   │
│  • Posisi: Tengah bawah layar           │
│                                          │
└──────────────────────────────────────────┘
```

**Animasi Pulse:**
```
Normal → Besar → Normal → Besar → ...
 100%     105%    100%     105%
```

### Saat Berinteraksi (Tekan E):

**Dialog Box:**
```
┌──────────────────────────────────────────┐
│                                          │
│            🟡 NAMA NPC                   │
│                                          │
│         "Dialog dari NPC..."            │
│                                          │
│              [ OK ]                      │
│                                          │
└──────────────────────────────────────────┘
```

**Perubahan Visual NPC:**
- ✅ Sebelum: Name tag terlihat
- ✅ Setelah: Name tag hilang (warna NPC tetap ungu)

---

## ⌨️ Kontrol Lengkap

| Tombol | Fungsi | Kategori |
|--------|--------|----------|
| **W / ↑** | Maju | Movement |
| **S / ↓** | Mundur | Movement |
| **A / ←** | Kiri | Movement |
| **D / →** | Kanan | Movement |
| **Shift** | Sprint (lari) | Movement |
| **Spacebar** | Lompat | Movement |
| **Mouse** | Putar kamera | Camera |
| **Click** | Lock pointer | Camera |
| **ESC** | Unlock pointer | Camera |
| **E** | Interaksi dengan NPC | Interaction ⭐ |

---

## 🔧 Detail Teknis

### Interaction Radius
```javascript
// Player harus berada dalam radius 3 unit dari NPC
const INTERACTION_RADIUS = 3;

// Perhitungan jarak
distance = sqrt(
  (playerX - npcX)² +
  (playerZ - npcZ)²
)

if (distance <= INTERACTION_RADIUS) {
  showInteractionPrompt();
}
```

### Event Flow
```
Player Movement
    ↓
GameManager.update()
    ↓
checkNPCProximity()
    ↓
Is NPC nearby? ──NO──> hideInteractionPrompt()
    │
   YES
    ↓
showInteractionPrompt("Nama NPC")
    ↓
Player presses E?
    │
   YES
    ↓
tryInteract()
    ↓
├─> Mark NPC as found
├─> Hide prompt
├─> Show dialogue
├─> Hide name tag
├─> Update counter
└─> Check win condition
```

---

## 🎨 CSS Styling

### Interaction Prompt
```css
#interactionPrompt {
  position: absolute;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 200, 0, 0.9);
  color: black;
  padding: 15px 30px;
  border-radius: 10px;
  font-size: 18px;
  font-weight: bold;
  border: 3px solid #ffaa00;
  box-shadow: 0 0 20px rgba(255, 200, 0, 0.5);
  animation: pulse 1.5s ease-in-out infinite;
}
```

### Pulse Animation
```css
@keyframes pulse {
  0%, 100% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.05);
  }
}
```

---

## 💡 Tips Penggunaan

1. **Lihat Interaction Prompt**
   - Jika prompt muncul, artinya Anda dekat dengan NPC
   - Nama NPC akan tertulis di prompt

2. **Timing**
   - Tidak perlu buru-buru menekan E
   - Prompt akan tetap muncul selama Anda dekat
   - Bisa mundur dulu untuk membatalkan

3. **Multiple NPCs**
   - Jika ada beberapa NPC dekat, yang TERDEKAT yang akan diinteract
   - Geser posisi sedikit untuk pilih NPC lain

4. **Dialog Auto-Close**
   - Dialog akan auto-close setelah 4 detik
   - Atau klik tombol "OK" untuk menutup manual

5. **Tidak Bisa Double Interact**
   - Setelah NPC ditemukan, tidak bisa diinteract lagi
   - Prompt tidak akan muncul untuk NPC yang sudah ditemukan

---

## 🐛 Troubleshooting

### Prompt tidak muncul?
- ✅ Pastikan Anda cukup dekat (< 3 unit)
- ✅ Cek apakah NPC sudah pernah ditemukan (name tag hilang = sudah)
- ✅ Lihat name tag, jika tidak ada = sudah ditemukan

### Tekan E tidak berfungsi?
- ✅ Pastikan prompt sedang muncul
- ✅ Jangan tekan E sambil popup lain terbuka
- ✅ Coba refresh browser jika masih bermasalah

### Interaction jarak jauh?
- ❌ TIDAK BISA - harus mendekati NPC
- ✅ Radius fixed 3 unit (tidak bisa diubah)

---

## 🎯 Keuntungan Sistem Ini

✅ **Kontrol Lebih Baik**
- Player memutuskan kapan berinteraksi
- Tidak ada accident interaction

✅ **Feedback Jelas**
- Prompt kuning sangat visible
- Animasi menarik perhatian
- Nama NPC tertulis jelas

✅ **Standard Gaming**
- Mirip game modern (RPG, Adventure)
- Tombol E = universal interaction key
- Familiar untuk gamers

✅ **Immersive**
- Player merasa lebih involved
- Active participation
- Lebih engaging gameplay

---

**Selamat bermain dengan sistem interaksi baru! 🎮✨**
