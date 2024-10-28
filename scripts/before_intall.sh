#!/bin/bash
# Before install

if [ -f /var/www/html/cityfinance/cityfinancev2/appspec.yml ]; then
  rm /var/www/html/cityfinance/cityfinancev2/appspec.yml
fi
