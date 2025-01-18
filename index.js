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

app.get('/api/:tool', async (req, res) => {
  const tool = req.params.tool;
  const imageUrl = req.query.url;

  if (!imageUrl) {
    return res.status(400).json({ error: 'URL gambar diperlukan!' });
  }

  if (!pxpic.tool.includes(tool)) {
    return res.status(400).json({ error: `Tool tidak valid. Pilih salah satu: ${pxpic.tool.join(', ')}` });
  }

  try {
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const tempFilePath = path.join(tempDir, `${Date.now()}.jpg`);
    await downloadImage(imageUrl, tempFilePath);

    const result = await pxpic.create(tempFilePath, tool);

    fs.unlinkSync(tempFilePath);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan saat memproses gambar.' });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
