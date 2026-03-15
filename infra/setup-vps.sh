#!/usr/bin/env bash
#
# setup-vps.sh — One-time VPS setup for Croissants Idle deployment
#
# Run this script on your OVH VPS as root (or with sudo).
# It creates the deploy user, sets up SSH key auth, installs Nginx,
# and configures the site.
#
# Usage:
#   scp infra/setup-vps.sh root@YOUR_VPS_IP:/tmp/
#   ssh root@YOUR_VPS_IP 'bash /tmp/setup-vps.sh'
#
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────
DEPLOY_USER="deploy"
WEB_ROOT="/var/www/croissants-idle"
NGINX_CONF="/etc/nginx/sites-available/croissants-idle"
NGINX_ENABLED="/etc/nginx/sites-enabled/croissants-idle"

echo "=== Croissants Idle — VPS Setup ==="
echo ""

# ── 1. Create deploy user ────────────────────────────────────────────
if id "$DEPLOY_USER" &>/dev/null; then
    echo "[OK] User '$DEPLOY_USER' already exists"
else
    echo "[+] Creating user '$DEPLOY_USER'..."
    adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi

# ── 2. Setup SSH key for deploy user ─────────────────────────────────
DEPLOY_SSH_DIR="/home/$DEPLOY_USER/.ssh"
mkdir -p "$DEPLOY_SSH_DIR"
chmod 700 "$DEPLOY_SSH_DIR"

if [ ! -f "$DEPLOY_SSH_DIR/authorized_keys" ]; then
    touch "$DEPLOY_SSH_DIR/authorized_keys"
fi
chmod 600 "$DEPLOY_SSH_DIR/authorized_keys"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$DEPLOY_SSH_DIR"

echo ""
echo "[!] IMPORTANT: Add your deploy SSH public key to:"
echo "    $DEPLOY_SSH_DIR/authorized_keys"
echo ""
echo "    Generate a key pair on your local machine if you haven't:"
echo "      ssh-keygen -t ed25519 -f ~/.ssh/croissants-deploy -N ''"
echo ""
echo "    Then paste the PUBLIC key (croissants-deploy.pub) into authorized_keys:"
echo "      echo 'ssh-ed25519 AAAA...' >> $DEPLOY_SSH_DIR/authorized_keys"
echo ""

# ── 3. Create web root directory ─────────────────────────────────────
echo "[+] Creating web root: $WEB_ROOT"
mkdir -p "$WEB_ROOT"
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$WEB_ROOT"
chmod 755 "$WEB_ROOT"

# ── 4. Install Nginx ─────────────────────────────────────────────────
if command -v nginx &>/dev/null; then
    echo "[OK] Nginx is already installed"
else
    echo "[+] Installing Nginx..."
    apt-get update -qq
    apt-get install -y nginx
fi

# ── 5. Deploy Nginx configuration ────────────────────────────────────
echo "[+] Installing Nginx site configuration..."

# Check if the config was provided alongside this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/nginx/croissants-idle.conf" ]; then
    cp "$SCRIPT_DIR/nginx/croissants-idle.conf" "$NGINX_CONF"
    echo "    Copied from $SCRIPT_DIR/nginx/croissants-idle.conf"
else
    echo "    [!] Nginx config not found at $SCRIPT_DIR/nginx/croissants-idle.conf"
    echo "    Please copy infra/nginx/croissants-idle.conf to $NGINX_CONF manually."
fi

# Enable the site
if [ -f "$NGINX_CONF" ]; then
    ln -sf "$NGINX_CONF" "$NGINX_ENABLED"
    echo "[+] Site enabled"

    # Remove default site if it exists
    if [ -f /etc/nginx/sites-enabled/default ]; then
        rm -f /etc/nginx/sites-enabled/default
        echo "[+] Removed default Nginx site"
    fi
fi

# ── 6. Test and reload Nginx ─────────────────────────────────────────
echo "[+] Testing Nginx configuration..."
if nginx -t 2>&1; then
    systemctl reload nginx
    echo "[OK] Nginx reloaded successfully"
else
    echo "[!] Nginx config test failed — check the configuration"
    exit 1
fi

# ── 7. Install rsync (for deployments) ───────────────────────────────
if command -v rsync &>/dev/null; then
    echo "[OK] rsync is already installed"
else
    echo "[+] Installing rsync..."
    apt-get install -y rsync
fi

# ── 8. Firewall (optional) ───────────────────────────────────────────
if command -v ufw &>/dev/null; then
    echo "[+] Allowing HTTP/HTTPS through UFW..."
    ufw allow 'Nginx Full' >/dev/null 2>&1 || true
    ufw allow OpenSSH >/dev/null 2>&1 || true
fi

# ── Summary ───────────────────────────────────────────────────────────
echo ""
echo "=========================================="
echo "  VPS Setup Complete!"
echo "=========================================="
echo ""
echo "  Deploy user:  $DEPLOY_USER"
echo "  Web root:     $WEB_ROOT"
echo "  Nginx config: $NGINX_CONF"
echo ""
echo "  Next steps:"
echo "  1. Add the deploy SSH PUBLIC key to:"
echo "     $DEPLOY_SSH_DIR/authorized_keys"
echo ""
echo "  2. Configure GitHub Secrets in your repository:"
echo "     VPS_HOST        = $(hostname -I | awk '{print $1}')"
echo "     VPS_USER        = $DEPLOY_USER"
echo "     VPS_SSH_KEY     = (content of your PRIVATE key file)"
echo "     VPS_TARGET_PATH = $WEB_ROOT"
echo ""
echo "  3. Update server_name in $NGINX_CONF"
echo "     with your actual domain, then reload:"
echo "     sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "  4. (Optional) Setup SSL with Certbot:"
echo "     sudo apt install certbot python3-certbot-nginx"
echo "     sudo certbot --nginx -d your-domain.com"
echo ""
