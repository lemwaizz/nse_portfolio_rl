#!/bin/sh
set -e

nginx

exec su-exec nextjs bunx pm2-runtime start ecosystem.config.js