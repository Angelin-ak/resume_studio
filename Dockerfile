# Use official Ubuntu 24.04 (Noble Numbat) which contains GLIBC 2.39 (satisfying SQLite's GLIBC 2.38 requirement)
FROM ubuntu:24.04

# Prevent interactive prompts during apt package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install NodeSource Node.js 22 repository, Chromium, and font dependencies
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer configuration to use the system installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Set working directory
WORKDIR /app

# Copy backend package files from backend directory
COPY backend/package*.json ./

# Install dependencies (using npm install --omit=dev)
RUN npm install --omit=dev

# Copy backend source code from backend directory
COPY backend/ .

# Set environment variables
ENV PORT=3001 \
    NODE_ENV=production

# Expose port
EXPOSE 3001

# Run server
CMD ["node", "server.js"]
