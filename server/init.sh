npm install -g n
n install 20
mv ./mc /usr/local/bin/mc
chmod +x /usr/local/bin/mc
export NODE_TLS_REJECT_UNAUTHORIZED=0
#mc alias set default http://10.200.20.120:9000 minioadmin minioadmin --json

#vi node_modules/@kubernetes/client-node/dist/gen/api/networkingApi.js