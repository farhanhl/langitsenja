#!/bin/bash

echo "=========================================="
echo "🎮 Langit Senja - Game Launcher"
echo "=========================================="
echo ""

# Check if Python is available
if command -v python3 &> /dev/null
then
    echo "✓ Python3 ditemukan"
    echo "🚀 Menjalankan server..."
    echo ""
    python3 server.py
else
    echo "⚠️  Python3 tidak ditemukan"
    echo ""
    echo "Alternatif cara menjalankan game:"
    echo ""
    echo "1. Menggunakan Node.js:"
    echo "   npm start"
    echo ""
    echo "2. Menggunakan http-server:"
    echo "   npx http-server -p 8000 -o"
    echo ""
    echo "3. Buka file index.html langsung di browser modern"
    echo ""
fi
