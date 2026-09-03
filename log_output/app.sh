#!/bin/bash

RANDOM_ID=$(cat /proc/sys/kernel/random/uuid)

while true; do
	TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
	echo "$TIMESTAMP: $RANDOM_ID"
	sleep 5
done