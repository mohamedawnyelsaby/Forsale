FROM node:20-slim

WORKDIR /app

# تثبيت متطلبات prisma
RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
RUN npm install

COPY . .

# توليد ملفات prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
