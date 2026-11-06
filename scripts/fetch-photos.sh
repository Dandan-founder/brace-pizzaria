#!/usr/bin/env bash
# Baixa as fotos originais (Unsplash, licença gratuita) para assets-src/.
# Depois: python3 scripts/cutout-pizza.py assets-src/hero.jpg assets-src/hero-pizza.png
#         python3 scripts/smooth-cutout.py assets-src/hero-pizza.png assets-src/hero-pizza-clean.png
#         node scripts/optimize-images.mjs
set -euo pipefail
mkdir -p assets-src
while read -r name id; do
  [ -z "$name" ] && continue
  curl -fsSL -o "assets-src/$name.jpg" "https://images.unsplash.com/photo-$id?w=2400&q=85&fm=jpg"
  echo "ok $name"
done <<'EOF'
hero 1595854341625-f33ee10dbf94
oven 1579751626657-72bc17010498
chef 1577219491135-ce391730fb2c
margherita 1574071318508-1cdbab80d002
bianca 1564936281291-294551497d81
spinaci 1593560708920-61dd98c46a4e
diavola 1628840042765-356cda07504e
filante 1541745537411-b8046dc6d66c
rustica 1585238342024-78d387f4a707
tagliere 1565299624946-b28f40a0ae38
funghi 1552539618-7eec9b4d1796
capricciosa 1513104890138-7c749659a591
paddle 1613564834361-9436948817d1
tomatoes 1592924357228-91a4daadcfea
oil 1474979266404-7eaacbcd87c5
parmesan 1618164435735-413d3b066c9a
interior 1517248135467-4c7edcad34c4
wine 1510812431401-41d2bd2722f3
table 1414235077428-338989a2e8c0
slice 1600028068383-ea11a7a101f3
share 1571407970349-bc81e7e96d47
bread 1586444248902-2f64eddc13df
EOF
