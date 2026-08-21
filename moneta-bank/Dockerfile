FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN echo "FLAG{BANK_VAULT_BREACHED}" > /flag.txt
EXPOSE 8080
CMD ["node", "src/index.js"]