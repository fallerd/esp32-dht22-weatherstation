# ESP32 & DHT22 Weatherstation

Express server requires .env for mongodb login. See .env.template for example

Arduino requires secret.h with SSID and password for wifi login as well as express server IP address. See secret.h.template for example.

To run react app via the express server, must first do `npm run build` in /react-client/ dir.

TODO: create script that runs react-client build whenever express is run...

With apologies to:
https://medium.com/initial-state/how-to-build-your-own-esp32-temperature-monitor-6967b797b913

Raspberry Pi Zero W 2 doesn't have enough ram to build node modules for react-client, so just SFTP the build files to the PI instead.
`scp -r ~/Desktop/Programming\ Projects/esp32\ dht22\ express\ server/react-client/build d@raspberrypi.local:~/Desktop/esp32-dht22-weatherstation/react-client`

`ssh -t d@raspberrypi.local "cd ~/Desktop/esp32-dht22-weatherstation; bash"`
