#!/bin/sh
set -eu

LOG_FILE="${LOG_FILE:-/var/log/log-generator/output.log}"
mkdir -p "$(dirname "$LOG_FILE")"
: >> "$LOG_FILE"

RANDOM_ID="$(od -An -N16 -tx1 /dev/urandom | tr -d ' \n')"

while :; do
	TIMESTAMP="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
	printf '%s: %s\n' "$TIMESTAMP" "$RANDOM_ID" >> "$LOG_FILE"
	sleep 5
done