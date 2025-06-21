# ESP32 & DHT22 Weatherstation

Express server requires .env for mongodb login. See .env.template for example

Arduino requires secret.h with SSID and password for wifi login as well as express server IP address. See secret.h.template for example.

To run react app via the express server, must first do `npm run build` in /react-client/ dir. 

TODO: create script that runs react-client build whenever express is run...

Raspberry Pi Zero W 2 doesn't have enough ram to build node modules for react-client, so just SFTP the build files to the PI instead.
`scp -r ./react-client/build d@raspberrypi.local:~/Desktop/esp32-dht22-weatherstation/react-client` - MUST run from project root

```
// quick rebuild/deploy script 1 liner run from repo root:
(cd react-client && npm run build) && \
scp -r ./react-client/build d@raspberrypi.local:~/Desktop/esp32-dht22-weatherstation/react-client && \
ssh d@raspberrypi.local 'cd ~/Desktop/esp32-dht22-weatherstation/express-server && pm2 restart index.js'
```

```
(cd react-client && npm run build)
scp -r ./react-client/build d@raspberrypi.local:~/Desktop/esp32-dht22-weatherstation/react-client
ssh -t d@raspberrypi.local "cd ~/Desktop/esp32-dht22-weatherstation/express-server; bash"
pm2 list
pm2 del 0 // view/kill old process if alive
pm2 start index.js // must run inside express-server because that is where the .env resides. 
```

Some credit to:
https://medium.com/initial-state/how-to-build-your-own-esp32-temperature-monitor-6967b797b913