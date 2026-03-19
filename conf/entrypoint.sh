#!/bin/sh

EMAIL="coolmartun@gmail.com"
DOMAIN="blobox.games"

# Check if the LetsEncrypt certificate already exists
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "Certificates not found. Generating via Certbot..."
    
    # Start Nginx in the background
    nginx -g "daemon on;"
    
    # Run Certbot non-interactively. 
    # The --nginx flag tells Certbot to automatically edit your nginx.conf to add the 443 SSL block!
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos -m $EMAIL --redirect
    
    # Stop the background Nginx daemon
    nginx -s quit
    sleep 3
else
    echo "Certificates already exist. Skipping Certbot generation."
fi

(while true; do sleep 96h; certbot renew --quiet; nginx -s reload; done) &

# Start Nginx in the foreground as the primary process
echo "Starting Nginx..."
exec nginx -g "daemon off;"