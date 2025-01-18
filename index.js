const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const pxpic = require('./src/pxpic');

const app = express();
const port = 3000;

const downloadImage = async (url, outputPath) => {
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer',
  });
  fs.writeFileSync(outputPath, response.data);
  console.log(`Gambar berhasil diunduh ke: ${outputPath}`);
  return outputPath;
};

const processImage = async (req, res, tool) => {
  const imageUrl = req.query.url;
  console.log(`Menerima URL gambar: ${imageUrl}`);

  if (!imageUrl) {
    return res.status(400).json({ error: 'URL gambar diperlukan!' });
  }

  try {
    const tempDir = '/tmp';
    const tempFilePath = path.join(tempDir, `${Date.now()}.jpg`);
    await downloadImage(imageUrl, tempFilePath);

    console.log(`Memulai pemrosesan gambar dengan tool: ${tool}`);
    const result = await pxpic.create(tempFilePath, tool);

    console.log(`Hasil pemrosesan: ${JSON.stringify(result)}`);

    res.json(result);
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses gambar.' });
  }
};

app.get('/api/removebg', (req, res) => processImage(req, res, 'removebg'));
app.get('/api/enhance', (req, res) => processImage(req, res, 'enhance'));
app.get('/api/upscale', (req, res) => processImage(req, res, 'upscale'));
app.get('/api/restore', (req, res) => processImage(req, res, 'restore'));
app.get('/api/colorize', (req, res) => processImage(req, res, 'colorize'));

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
