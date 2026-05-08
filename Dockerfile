FROM node:20

# 1. 安裝系統內建的 Clustal Omega
RUN apt-get update && apt-get install -y clustalo && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. 安裝 Node 套件
COPY package*.json ./
RUN npm install

# 3. 複製所有檔案
COPY . .

# 4. 確保執行檔有執行權限
RUN cp /usr/bin/clustalo /app/clustalo && chmod +x /app/clustalo

EXPOSE 3000

# 🌟 修改點：限制 Node.js 的記憶體 (Heap)，把剩下的 300 多 MB 留給作業系統和 clustalo
CMD ["node", "--max-old-space-size=128", "server.js"]
