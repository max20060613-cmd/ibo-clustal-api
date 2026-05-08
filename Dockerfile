# 使用官方 Node 環境
FROM node:20

# 🌟 關鍵：直接叫 Linux 裝好 Clustal Omega 和它需要的所有零件
RUN apt-get update && apt-get install -y clustalo && rm -rf /var/lib/apt/lists/*

# 設定工作目錄
WORKDIR /app

# 先複製 package.json 安裝套件
COPY package*.json ./
RUN npm install

# 複製其餘程式碼
COPY . .

# 🌟 為了不改你的 server.js，我們把系統裝好的 clustalo 複製到你的目錄下
RUN cp /usr/bin/clustalo /app/clustalo

# 開放 Port
EXPOSE 3000

# 啟動伺服器
CMD ["node", "server.js"]
