# Deploy ke VPS Ubuntu

## Requirements
- Ubuntu 20.04 / 22.04
- Node.js 18+
- PM2

## Langkah Deploy

### 1. Install Node.js (kalau belum)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Install PM2
```bash
npm install -g pm2
```

### 3. Upload project ke VPS
```bash
# Dari lokal — zip dan scp, atau pakai git
scp -r ./Rest-NanaApis-clean user@IP_VPS:/var/www/yorutech
```

### 4. Di dalam VPS
```bash
cd /var/www/yorutech
npm install
npm run build
```

### 5. Jalankan dengan PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # biar auto-start pas reboot
```

### 6. (Opsional) Setup Nginx reverse proxy
```nginx
server {
    listen 80;
    server_name domain-kamu.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo apt install nginx
sudo nano /etc/nginx/sites-available/yorutech
# paste config di atas
sudo ln -s /etc/nginx/sites-available/yorutech /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 7. (Opsional) SSL dengan Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d domain-kamu.com
```

## Perintah PM2 berguna
```bash
pm2 status          # cek status
pm2 logs yorutech-api   # lihat log
pm2 restart yorutech-api  # restart
pm2 stop yorutech-api    # stop
```
