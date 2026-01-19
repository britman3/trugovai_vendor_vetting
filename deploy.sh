#!/bin/bash

# TruGovAI Vendor Vetting - Deployment Script
# This script pulls from GitHub, installs dependencies, configures firewall,
# and starts the app on port 3060 using PM2

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}TruGovAI Vendor Vetting - Deployment${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration
APP_NAME="trugovai-vendor-vetting"
APP_PORT=3060
REPO_URL="https://github.com/britman3/trugovai_vendor_vetting.git"
APP_DIR="/home/user/trugovai_vendor_vetting"

# Step 1: Navigate to app directory or clone if not exists
echo -e "\n${YELLOW}Step 1: Setting up repository...${NC}"
if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    echo "Pulling latest changes from GitHub..."
    git fetch origin
    git pull origin main || git pull origin master || git pull origin claude/implement-spec-AlbbE
else
    echo "Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi

# Step 2: Install Node.js dependencies
echo -e "\n${YELLOW}Step 2: Installing dependencies...${NC}"
npm install

# Step 3: Create/Update .env file with port configuration
echo -e "\n${YELLOW}Step 3: Configuring environment...${NC}"
if [ ! -f .env ]; then
    cat > .env << EOF
# Database (update with your PostgreSQL credentials)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trugovai_vendor_vetting?schema=public"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:${APP_PORT}"

# App URL for vendor self-service links
NEXT_PUBLIC_APP_URL="http://localhost:${APP_PORT}"
EOF
    echo "Created .env file"
else
    echo ".env file already exists"
fi

# Step 4: Build the application
echo -e "\n${YELLOW}Step 4: Building application...${NC}"
npm run build

# Step 5: Install PM2 globally if not installed
echo -e "\n${YELLOW}Step 5: Setting up PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    sudo npm install -g pm2
fi

# Step 6: Create PM2 ecosystem file
echo -e "\n${YELLOW}Step 6: Creating PM2 configuration...${NC}"
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: 'npm',
    args: 'start',
    cwd: '${APP_DIR}',
    env: {
      NODE_ENV: 'production',
      PORT: ${APP_PORT}
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Step 7: Update next.config.ts to use custom port (if needed)
echo -e "\n${YELLOW}Step 7: Configuring port ${APP_PORT}...${NC}"

# Step 8: Configure firewall
echo -e "\n${YELLOW}Step 8: Configuring firewall...${NC}"

# Check which firewall is available and configure
if command -v ufw &> /dev/null; then
    echo "Configuring UFW firewall..."
    sudo ufw allow ${APP_PORT}/tcp
    sudo ufw --force enable
    echo "UFW: Port ${APP_PORT} opened"
elif command -v firewall-cmd &> /dev/null; then
    echo "Configuring firewalld..."
    sudo firewall-cmd --permanent --add-port=${APP_PORT}/tcp
    sudo firewall-cmd --reload
    echo "Firewalld: Port ${APP_PORT} opened"
elif command -v iptables &> /dev/null; then
    echo "Configuring iptables..."
    sudo iptables -A INPUT -p tcp --dport ${APP_PORT} -j ACCEPT
    # Save iptables rules (varies by distro)
    if command -v iptables-save &> /dev/null; then
        sudo iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
    fi
    echo "iptables: Port ${APP_PORT} opened"
else
    echo -e "${YELLOW}Warning: No firewall detected. Please manually open port ${APP_PORT}${NC}"
fi

# Step 9: Stop existing PM2 process if running
echo -e "\n${YELLOW}Step 9: Managing PM2 process...${NC}"
pm2 stop ${APP_NAME} 2>/dev/null || true
pm2 delete ${APP_NAME} 2>/dev/null || true

# Step 10: Start the application with PM2
echo -e "\n${YELLOW}Step 10: Starting application...${NC}"
PORT=${APP_PORT} pm2 start ecosystem.config.js

# Step 11: Save PM2 process list and configure startup
echo -e "\n${YELLOW}Step 11: Configuring PM2 startup...${NC}"
pm2 save
pm2 startup 2>/dev/null || echo "Run 'pm2 startup' manually if you want auto-start on reboot"

# Step 12: Display status
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Application: ${GREEN}${APP_NAME}${NC}"
echo -e "Port: ${GREEN}${APP_PORT}${NC}"
echo -e "URL: ${GREEN}http://localhost:${APP_PORT}${NC}"
echo ""
echo "PM2 Commands:"
echo "  pm2 status          - Check app status"
echo "  pm2 logs ${APP_NAME} - View logs"
echo "  pm2 restart ${APP_NAME} - Restart app"
echo "  pm2 stop ${APP_NAME} - Stop app"
echo ""
pm2 status
