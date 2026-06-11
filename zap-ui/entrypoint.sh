#!/bin/bash
set -e

Xvfb :99 -screen 0 1280x1024x24 &
sleep 1

x11vnc -display :99 -forever -nopw -rfbport 5900 &
sleep 1

mkdir -p /tmp/novnc
cp -r /usr/share/novnc/* /tmp/novnc/ 2>/dev/null || true
cat > /tmp/novnc/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head><meta http-equiv="refresh" content="0;url=vnc.html"></head>
<body><a href="vnc.html">Launch ZAP Desktop</a></body>
</html>
EOF

WEBSOCKIFY=$(find /usr -name "websockify" -type f 2>/dev/null | head -1)
if [ -n "$WEBSOCKIFY" ]; then
    $WEBSOCKIFY --web /tmp/novnc 6080 localhost:5900 &
else
    /usr/share/novnc/utils/novnc_proxy --vnc localhost:5900 --listen 6080 &
fi

sleep 2

export DISPLAY=:99
/zap/zap.sh "$@" &

wait
