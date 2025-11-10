module.exports = {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  numbersToExpressions: true,
  simplify: true,
  stringArrayShuffle: true,
  splitStrings: true,
  stringArrayThreshold: 0.75,
  // Ganti nama variabel
  identifierNamesGenerator: 'mangled',
  // Tambahkan string array
  stringArray: true,
  // Gunakan source map false untuk menyembunyikan source
  sourceMap: false,
  sourceMapMode: 'separate',
  // Tidak mengacak properti karena menggunakan Three.js
  renameProperties: false,
  // Properti yang tidak boleh diacak
  reservedNames: ['THREE', 'Mesh', 'Geometry', 'Material', 'Scene', 'Camera', 'Renderer', 'Audio', 'document', 'window', 'console', 'localStorage', 'MathUtils'],
  // Tidak merename properti yang penting untuk Three.js
  renameGlobals: false,
  // Proteksi loop
  selfDefending: true
};