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
  return outputPath;
};

const processImage = async (req, res, tool) => {
  const imageUrl = req.query.url;

  if (!imageUrl) {
    return res.status(400).json({ error: 'URL gambar diperlukan!' });
  }

  try {
    const tempDir = '/tmp';
    const tempFilePath = path.join(tempDir, `${Date.now()}.jpg`);
    await downloadImage(imageUrl, tempFilePath);

    const response = await pxpic.create(tempFilePath, tool);
    console.log('Respons dari pxpic:', response);  // Log respons untuk debugging

    if (!response || !response.resultImageUrl) {
      return res.status(500).json({ error: 'Gagal mendapatkan URL gambar yang diproses.' });
    }

    const { resultImageUrl } = response;

    const imageBuffer = await axios.get(resultImageUrl, { responseType: 'arraybuffer' });

    res.set('Content-Type', 'image/jpeg');
    res.send(imageBuffer.data);

    fs.unlinkSync(tempFilePath);
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses gambar.' });
  }
};

app.get('/', (req, res) => {
  res.json({
    message: 'API untuk memproses gambar.',
    routes: {
      removebg: '/api/removebg?url=<image_url>',
      enhance: '/api/enhance?url=<image_url>',
      upscale: '/api/upscale?url=<image_url>',
      restore: '/api/restore?url=<image_url>',
      colorize: '/api/colorize?url=<image_url>',
    }
  });
});

app.get('/api/removebg', (req, res) => processImage(req, res, 'removebg'));
app.get('/api/enhance', (req, res) => processImage(req, res, 'enhance'));
app.get('/api/upscale', (req, res) => processImage(req, res, 'upscale'));
app.get('/api/restore', (req, res) => processImage(req, res, 'restore'));
app.get('/api/colorize', (req, res) => processImage(req, res, 'colorize'));

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
