FROM ghcr.io/zaproxy/zaproxy:stable

USER root

RUN apt-get update && apt-get install -y \
    xvfb \
    x11vnc \
    novnc \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/zap/.vnc && \
    echo "" > /home/zap/.vnc/passwd && \
    chown -R zap:zap /home/zap/.vnc

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV DISPLAY=:99

EXPOSE 8080 5900 6080

USER zap
ENTRYPOINT ["/entrypoint.sh"]
