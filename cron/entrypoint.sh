#!/bin/sh

# Substitute environment variables in crontab
envsubst < /etc/cron.d/analytics-crontab > /tmp/crontab
crontab /tmp/crontab

# Create log file
touch /var/log/cron.log

echo "Cron started. Processing analytics every minute..."
echo "Worker secret configured: $([ -n \"$ANALYTICS_WORKER_SECRET\" ] && echo 'Yes' || echo 'No')"

# Run cron in foreground and tail the log
crond -f -l 2 &
tail -f /var/log/cron.log
