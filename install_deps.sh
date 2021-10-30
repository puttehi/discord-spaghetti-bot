#!/bin/bash

# TODO: Make things into arguments so shit doesn't break so easily

apt-get install ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 \
libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 \
libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils gconf-service \
libgconf-2-4 libgdk-pixbuf2.0-0 libappindicator1
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
apt install ./google-chrome-stable_current_amd64.deb
cp -p /home/putte/spaghetti/node_modules/puppeteer/.local-chromium/linux-901912/chrome-linux/chrome_sandbox /usr/local/sbin/chrome-devel-sandbox
chown putte:putte -R /home/putte/spaghetti/
chown root:root /usr/local/sbin/chrome-devel-sandbox
chmod 4755 /usr/local/sbin/chrome-devel-sandbox
echo "export CHROME_DEVEL_SANDBOX=/usr/local/sbin/chrome-devel-sandbox" >> /home/putte/.bashrc
echo "$CHROME_DEVEL_SANDBOX"
