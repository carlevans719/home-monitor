#!/bin/sh

echo "cam1 detected $1" >> /home/pi/motion_events.log

filename=$(ls -lart /home/pi/Monitor/*.mkv | tail -n 1 | awk '{print $9}' | sed 's#.*Monitor/##')
camera=1
query="API_KEY=$API_KEY&camera=$camera&filename=$filename"
curl -kX POST https://127.0.0.1:3000/motion-detected?$query

