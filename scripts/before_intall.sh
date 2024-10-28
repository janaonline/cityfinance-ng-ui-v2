#!/bin/bash
# Before install

if [ -d /var/www/html/cityfinance/cityfinancev2 ]; then
  echo "Deleting /var/www/html/cityfinance/cityfinancev2..."
  rm -rf /var/www/html/cityfinance/cityfinancev2
fi
