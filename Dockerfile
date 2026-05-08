FROM node:20

# 1. 安裝系統內建的 Clustal Omega
RUN apt-get update && apt-get install -y clustalo && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. 安裝 Node 套件
COPY package*.json ./
RUN npm install

# 3. 複製所有檔案
COPY . .

# 4. 🌟 關鍵修正：確保執行檔有執行權限
# 我們把系統安裝好的 clustalo 覆蓋過去，並強制加上執行權限 (+x)
RUN cp /usr/bin/clustalo /app/clustalo && chmod +x /app/clustalo

EXPOSE 3000

CMD ["node", "server.js"]
