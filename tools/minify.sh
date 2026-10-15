#!/usr/bin/env bash
# Regenerate css/*.min.css and js/*.min.js and bump the ?v= stamp in the HTML.
# Run after editing style.css / theme.js / quote.js, then commit everything.
set -euo pipefail
cd "$(dirname "$0")/.."

npx -y clean-css-cli -o css/style.min.css css/style.css
npx -y terser js/theme.js -c -m -o js/theme.min.js
npx -y terser js/quote.js -c -m -o js/quote.min.js

stamp=$(date +%Y%m%d)
sed -i "s|css/style.min.css?v=[a-z0-9]*|css/style.min.css?v=$stamp|g; \
        s|js/theme.min.js?v=[a-z0-9]*|js/theme.min.js?v=$stamp|g; \
        s|js/quote.min.js?v=[a-z0-9]*|js/quote.min.js?v=$stamp|g" \
  index.html gallery.html services.html quote.html contact.html 404.html

echo "Minified and stamped ?v=$stamp"
