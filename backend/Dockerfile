# Use official Node.js image with Chromium dependencies (Node 22 is required by Puppeteer)
FROM node:22-slim

# Install Chromium and its dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer configuration to use the system installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (using npm install --omit=dev to avoid package-lock mismatch failures)
RUN npm install --omit=dev

# Copy backend source code
COPY . .

# Set environment variables
ENV PORT=3001 \
    NODE_ENV=production

# Expose port
EXPOSE 3001

# Run server
CMD ["node", "server.js"]
