const express = require('express');
const cors = require('cors');
const { exec } = require('child_process'); // 🌟 改用非同步 exec
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(cors()); 
app.use(express.json({ limit: '10mb' })); // 🌟 允許較大的序列輸入

app.post('/api/align', (req, res) => {
  const { sequence } = req.body;

  if (!sequence) {
    return res.status(400).json({ error: 'No sequence provided' });
  }

  const jobId = crypto.randomUUID();
  const inputFile = path.join(__dirname, `temp_${jobId}.fasta`);
  const outputFile = path.join(__dirname, `temp_${jobId}.aln`);

  // 1. 寫入暫存檔
  try {
    fs.writeFileSync(inputFile, sequence);
    console.log(`[Job ${jobId}] 接收成功，開始運算...`);

    // 🌟 在 Docker 環境中，直接呼叫 clustalo 即可
    // 加上 --memory-limit=200 限制 clustalo 運算時的記憶體
    // 加上 --threads=1 避免多執行緒搶佔資源
    const command = `clustalo --infile="${inputFile}" --outfile="${outputFile}" --outfmt=clustal --force --threads=1`;

    // 2. 執行運算 (設定 10MB 緩衝區)
    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      
      // 運算完無論成功失敗，都要準備清理檔案
      const cleanup = () => {
        if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
      };

      if (error) {
        console.error(`[Job ${jobId}] 運算崩潰:`, stderr);
        cleanup();
        // 如果是記憶體問題，stderr 通常會包含相關訊息
        return res.status(500).json({ error: '運算超載或格式錯誤', details: stderr });
      }

      // 3. 讀取結果
      try {
        if (fs.existsSync(outputFile)) {
          const alignmentResult = fs.readFileSync(outputFile, 'utf8');
          console.log(`[Job ${jobId}] 運算完成！`);
          res.json({ status: 'SUCCESS', data: alignmentResult });
        } else {
          res.status(500).json({ error: '找不到輸出檔案' });
        }
      } catch (readError) {
        res.status(500).json({ error: '結果讀取失敗' });
      } finally {
        cleanup(); // 🌟 確保讀完後立刻刪除暫存檔
      }
    });

  } catch (writeError) {
    console.error(`[Job ${jobId}] 檔案寫入失敗:`, writeError.message);
    res.status(500).json({ error: '伺服器寫入空間不足' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 IBO Private Server 啟動成功！正在監聽 Port ${PORT}`);
  console.log(`💡 當前 Node.js 記憶體限制: ${process.env.NODE_OPTIONS || '預設'}`);
});
