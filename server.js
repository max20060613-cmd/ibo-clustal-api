const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors()); 
app.use(express.json()); 

// 🌟 雲端電腦是 Linux，所以執行檔名固定是 clustalo
const CLUSTAL_BIN = './clustalo'; 

app.post('/api/align', (req, res) => {
  const { sequence } = req.body;

  if (!sequence) {
    return res.status(400).json({ error: 'No sequence provided' });
  }

  const jobId = crypto.randomUUID();
  const inputFile = path.join(__dirname, `temp_${jobId}.fasta`);
  const outputFile = path.join(__dirname, `temp_${jobId}.aln`);

  try {
    fs.writeFileSync(inputFile, sequence);

    // 使用 path.resolve 確保路徑絕對正確
    const binPath = path.resolve(__dirname, 'clustalo');
    // 修改 server.js 中的 command 這一行
    const command = `./clustalo --infile="${inputFile}" --outfile="${outputFile}" --outfmt=clustal --force`;
    console.log(`[Job ${jobId}] 正在 Render 雲端計算中...`);

    execSync(command);

    const alignmentResult = fs.readFileSync(outputFile, 'utf8');
    res.json({ status: 'SUCCESS', data: alignmentResult });

  } catch (error) {
    console.error(`[Job ${jobId}] Error:`, error.message);
    res.status(500).json({ error: 'Alignment failed on cloud server' });
  } finally {
    if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
    if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
  }
});

// 🌟 讓雲端平台自動分配 Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 IBO Private Server 啟動成功！正在監聽 Port ${PORT}`);
});
