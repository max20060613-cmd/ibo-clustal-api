# 🌟 改用 slim 版本，體積與記憶體佔用極小
FROM node:20-slim

# 安裝 clustalo 以及 slim 版缺少的基礎套件
RUN apt-get update && apt-get install -y \
    clustalo \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
# 加上 --production 減少不必要的開發工具安裝
RUN npm install --production

COPY . .

RUN cp /usr/bin/clustalo /app/clustalo && chmod +x /app/clustalo

EXPOSE 3000

# 🌟 把 Node 的記憶體限制再降一點點，挪出更多空間給運算
CMD ["node", "--max-old-space-size=96", "server.js"]
