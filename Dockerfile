FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Apply migrations (safe for production, no data loss)
RUN npx prisma migrate deploy

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]