#!/bin/bash
set -euo pipefail

# ===========================================
# EventFlow - DigitalOcean Droplet Setup
# ===========================================
# Usage: scp deploy.sh root@YOUR_DROPLET_IP:~ && ssh root@YOUR_DROPLET_IP 'bash deploy.sh'

DOMAIN="ec-central-1.console.awscommunity.ec"
APP_DIR="/opt/eventflow"
REPO_URL="git@github.com:JonathanTeran/eventflow.git"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# -------------------------------------------
# 1. System updates & swap
# -------------------------------------------
info "Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

if [ ! -f /swapfile ]; then
    info "Creating 2GB swap file (helps with 2GB RAM Droplet)..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    # Optimize swap usage
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
else
    info "Swap already exists, skipping."
fi

# -------------------------------------------
# 2. Install Docker
# -------------------------------------------
if ! command -v docker &> /dev/null; then
    info "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
else
    info "Docker already installed."
fi

# -------------------------------------------
# 3. Firewall (UFW)
# -------------------------------------------
info "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable
info "Firewall configured (SSH, HTTP, HTTPS only)."

# -------------------------------------------
# 4. Deploy Key for GitHub (private repo)
# -------------------------------------------
if [ ! -f /root/.ssh/deploy_key ]; then
    info "Generating SSH deploy key for GitHub..."
    ssh-keygen -t ed25519 -f /root/.ssh/deploy_key -N "" -C "eventflow-deploy@$(hostname)"

    # Configure SSH to use deploy key for GitHub
    cat >> /root/.ssh/config <<EOF

Host github.com
    IdentityFile /root/.ssh/deploy_key
    StrictHostKeyChecking no
EOF
    chmod 600 /root/.ssh/config

    echo ""
    echo "============================================"
    echo -e "${YELLOW}DEPLOY KEY - Add this to your GitHub repo:${NC}"
    echo "Go to: GitHub repo > Settings > Deploy keys > Add deploy key"
    echo "============================================"
    cat /root/.ssh/deploy_key.pub
    echo "============================================"
    echo ""
    read -p "Press ENTER after you've added the deploy key to GitHub..."
else
    info "Deploy key already exists."
fi

# -------------------------------------------
# 5. Clone repository
# -------------------------------------------
if [ -z "$REPO_URL" ]; then
    read -p "Enter your GitHub repo SSH URL (e.g., git@github.com:user/eventflow.git): " REPO_URL
fi

if [ ! -d "$APP_DIR" ]; then
    info "Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
else
    info "Repository already cloned. Pulling latest changes..."
    cd "$APP_DIR" && git pull origin main
fi

cd "$APP_DIR"

# -------------------------------------------
# 6. Configure environment
# -------------------------------------------
info "Configuring environment variables..."

# Generate passwords
DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)
REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)
REVERB_APP_KEY=$(openssl rand -hex 16)
REVERB_APP_SECRET=$(openssl rand -hex 16)

if [ ! -f backend/.env ]; then
    cp backend/.env.production backend/.env

    # Replace placeholders
    sed -i "s|__DOMAIN__|${DOMAIN}|g" backend/.env
    sed -i "s|__DB_PASSWORD__|${DB_PASSWORD}|g" backend/.env
    sed -i "s|__REDIS_PASSWORD__|${REDIS_PASSWORD}|g" backend/.env
    sed -i "s|__REVERB_APP_KEY__|${REVERB_APP_KEY}|g" backend/.env
    sed -i "s|__REVERB_APP_SECRET__|${REVERB_APP_SECRET}|g" backend/.env

    # Mail placeholders - user needs to configure
    warn "Mail settings need to be configured manually in backend/.env"
    warn "Edit: nano ${APP_DIR}/backend/.env"

    info "Environment file created."
else
    info ".env already exists, skipping. Delete it to regenerate."
fi

# Configure Nginx with domain
sed -i "s|__DOMAIN__|${DOMAIN}|g" docker/nginx/prod.conf

# -------------------------------------------
# 7. SSL Certificate (Let's Encrypt)
# -------------------------------------------
info "Obtaining SSL certificate for ${DOMAIN}..."

if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    # Install certbot standalone to get initial certificate
    apt-get install -y -qq certbot

    certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email "admin@${DOMAIN}" \
        --domain "${DOMAIN}" \
        -d "www.${DOMAIN}" \
        || warn "SSL certificate failed. Make sure DNS A record points to this server's IP."

    # Copy certs to Docker volume location
    info "SSL certificate obtained."
else
    info "SSL certificate already exists."
fi

# -------------------------------------------
# 8. Build and start containers
# -------------------------------------------
info "Building and starting Docker containers..."

# Create .env file for docker-compose (postgres/redis passwords)
cat > .env <<EOF
DB_DATABASE=eventflow
DB_USERNAME=eventflow
DB_PASSWORD=${DB_PASSWORD}
REDIS_PASSWORD=${REDIS_PASSWORD}
EOF

# Map host certbot certs into Docker volume
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
info "Waiting for services to start..."
sleep 10

# -------------------------------------------
# 9. Laravel setup
# -------------------------------------------
info "Running Laravel setup..."

# Generate app key
docker compose -f docker-compose.prod.yml exec -T app php artisan key:generate --force

# Run migrations
docker compose -f docker-compose.prod.yml exec -T app php artisan migrate --force --seed

# Cache everything for production
docker compose -f docker-compose.prod.yml exec -T app php artisan config:cache
docker compose -f docker-compose.prod.yml exec -T app php artisan route:cache
docker compose -f docker-compose.prod.yml exec -T app php artisan view:cache

info "Laravel setup completed."

# -------------------------------------------
# 10. SSL auto-renewal cron
# -------------------------------------------
info "Setting up SSL auto-renewal cron..."
CRON_JOB="0 3 * * * cd ${APP_DIR} && docker compose -f docker-compose.prod.yml exec -T certbot certbot renew --quiet && docker compose -f docker-compose.prod.yml exec -T nginx nginx -s reload"
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_JOB") | crontab -

# -------------------------------------------
# Done!
# -------------------------------------------
echo ""
echo "============================================"
info "EventFlow deployed successfully!"
echo "============================================"
echo ""
echo "  App:     https://${DOMAIN}"
echo "  Domain:  ${DOMAIN}"
echo ""
echo "  Credentials:"
echo "    Super Admin: superadmin@eventflow.app / password"
echo "    Org Admin:   admin@eventflow.app / password"
echo ""
echo "  Passwords (save these!):"
echo "    DB Password:    ${DB_PASSWORD}"
echo "    Redis Password: ${REDIS_PASSWORD}"
echo ""
echo "  Useful commands:"
echo "    cd ${APP_DIR}"
echo "    make prod-logs     # View logs"
echo "    make prod-down     # Stop services"
echo "    make prod-up       # Start services"
echo "    make prod-deploy   # Re-deploy (pull + rebuild)"
echo ""
echo "  IMPORTANT: Configure mail settings in backend/.env"
echo "============================================"
