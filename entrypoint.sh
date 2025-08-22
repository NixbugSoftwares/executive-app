#!/bin/sh
echo "window.__ENV__ = { EXECUTIVE_APP_API_BASE_URL: \"${EXECUTIVE_APP_API_BASE_URL}\" };" \
  > /usr/share/nginx/html/env-config.js

exec "$@"
