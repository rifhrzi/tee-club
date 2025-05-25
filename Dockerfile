# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment variables for build
ENV NODE_ENV="development"
ENV DATABASE_URL="postgresql://postgres:Fatur123@db:5432/teelite?schema=public"
ENV NEXT_PUBLIC_BASE_URL="http://localhost:3000"
ENV JWT_ACCESS_SECRET="G0A6ruhpXO+XbDHXllPd3UcwWTi7GVdUoVtVPO8BQ78="
ENV JWT_REFRESH_SECRET="ikxoJmR8D3+qEL58B7ok3q0U2hMi65ZFe4p4KBLKq1s="
ENV MIDTRANS_SERVER_KEY="SB-Mid-server-FLgSZO5-583rAd3BXvadHcNL"
ENV MIDTRANS_CLIENT_KEY="SB-Mid-client-oISDZp8SG839bmMP"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV NEXTAUTH_SECRET="supersecretkey123456789"

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# Expose the port Next.js runs on
EXPOSE 3000

# Start the app
CMD ["node", ".next/standalone/server.js"]