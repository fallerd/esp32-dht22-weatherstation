# ESP32 & DHT22 Weatherstation

Express server requires .env for mongodb login. See .env.template for example

Arduino requires secret.h with SSID and password for wifi login as well as express server IP address. See secret.h.template for example.

To run react app via the express server, must do `npm run build` in /react-client/ dir.

TODO: create script that runs react-client build whenever express is run...

With apologies to:
https://medium.com/initial-state/how-to-build-your-own-esp32-temperature-monitor-6967b797b913