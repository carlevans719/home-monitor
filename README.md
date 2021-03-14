Turn a Raspberry PI and an old usb webcam into a smart home camera with an Android companion app

# Getting Started

1. Install Motion on the raspberry pi
1. Copy over the config files from etc_motion in this repo to /etc/motion on the pi
1. Create the Monitor and Motion_Api directories on the pi in /home/pi
1. Copy over the API source code from home-monitor-api in this repo to /home/pi/Motion_Api on the pi
1. Fill in the bcrypt hash of your default password to `constants.js` in the Motion_Api folder on the pi (change the username to your name too)
1. Install nodejs on the pi
1. Globally install forever on the pi `npm i -g forever`
1. Add the line in pi_home/.bashrc_additions to /home/pi/.bashrc on the pi
1. Also add `export API_KEY=<your api key>` to the .bashrc
1. Add the line in pi_home/crontab to the crontab on the pi with `crontab -e`
1. Copy over the on_motion_detected_camera*.sh scripts from pi_home in this repo to /home/pi on the pi
1. Set the executable bit on the scripts `chmod 755 on_motion_detected*`
1. Create the motion_events.log file in /home/pi on the pi
1. Set the group ownership on the Monitor directory & the motion_events.log, on_motion_detected_camera1.sh and on_motion_detected_camera2.sh files to "motion" - `sudo chown pi:motion Monitor motion_events.log on_motion_detected*`
1. Restart the pi (or start the motion service and api - `sudo service motion start && cd /home/pi/Motion_Api && forever start index.js`)
1. Add a domain to cloudflare and CNAME it to your duckdns.org domain name
1. (optional) If you don't have the duckdns script running elsewhere on your LAN, copy it on to the pi and follow the steps on duckdns to add a crontab entry
1. Download an origin certificate from cloudflare & copy the cert & key to /home/pi on the pi. Call them "server.crt" and "server.key"
1. Set the SSL mode to "full (strict)" for the domain on cloudflare
1. Add a port forwarding rule to your router that forwards external tcp port 8443 to internal tcp port 3000 and set your pi's internal IP address as the destination
1. If you haven't already, make sure your pi has a static internal IP by adding an entry to the address reservation table on your router
1. Add a new Firebase project and follow the steps to enable Firebase Cloud Messaging. Download the google-services.json and replace the one in home-monitor-app in this repo
1. Copy the server key from the firebase project and upload it to expo
1. Build the expo project to an APK and copy it on to your phone & install it
1. Before opening the app, go to the app settings and then in permissions, open location and make sure "enabled all the time" is selected. This will allow background geofencing to detect when you leave your house. You will only get push notifications when you're not home
1. When you sign in, the location of your phone will be set as your home, so make sure you're home when you sign in
