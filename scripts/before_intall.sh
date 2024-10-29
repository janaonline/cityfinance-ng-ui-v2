
# Before install
#!/bin/bash

rm -rf /var/www/html/cityfinance/cityfinancev2/
mkdir -p /var/www/html/cityfinance/cityfinancev2/

mv /var/www/html/cityfinance/cityfinancev2-deploy/.* /var/www/html/cityfinance/cityfinancev2/ 2>/dev/null
mv /var/www/html/cityfinance/cityfinancev2-deploy/* /var/www/html/cityfinance/cityfinancev2/

rm -rf /var/www/html/cityfinance/cityfinancev2-deploy/
