FROM alpine:3.19

RUN apk add --no-cache curl gettext

COPY analytics-crontab /etc/cron.d/analytics-crontab
RUN chmod 0644 /etc/cron.d/analytics-crontab

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD ["/entrypoint.sh"]
