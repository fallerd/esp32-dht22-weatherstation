#include <WiFi.h>
#include <HTTPClient.h>
#include "DHTesp.h"
#include "secret.h"

const char* ssid = SSID;
const char* password = PASSWORD;

DHTesp dht;
HTTPClient httpClient;
int timeout = 0;  

static void InitWifi() {
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Wifi still connected with IP: "); 
  } else {
    Serial.println("Connecting Wifi...");
    timeout = 0;
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
      delay(1000);
      Serial.print(".");
      timeout++;
      if (timeout > 60){ 
        Serial.println("Connection timed out, resetting board"); 
        ESP.restart();
      }
    }
    Serial.println("Wifi connected with IP: "); 
  }
  Serial.println(WiFi.localIP());
}

void setup() {
  Serial.begin(115200);
  dht.setup(27, DHTesp::DHT22);

  InitWifi();

  // Reading temperature & humidity
  float temp = dht.getTemperature();
  float humidity = dht.getHumidity();
  // int chipId = ESP.getEfuseMac(); // NOT UNIQUE, must manually spec unique ids
  int chipId = 1;

  Serial.print("Sensor id #");
  Serial.println(chipId);

  Serial.println("Posting data:");

  String url = URL;
  url += "addData/";
  httpClient.begin(url);
  httpClient.addHeader("Content-Type", "application/json");

  String httpRequestData = "{\"sensor\":\"";
  httpRequestData += chipId;
  httpRequestData += "\",\"temp\":";
  httpRequestData += temp;
  httpRequestData += ",\"humidity\":";
  httpRequestData += humidity;
  httpRequestData += "}";
  Serial.println(httpRequestData);

  //Check for the returning code
  int httpCode = httpClient.POST(httpRequestData);       
  Serial.println(httpCode);
   
  if (httpCode > 200 || httpCode < 0) { 
    Serial.println("Error on HTTP request");
  }

  httpClient.end();
  Serial.println("Sleeping for 10 mins");

  esp_sleep_enable_timer_wakeup(1000000 * 60 * 10);
  esp_deep_sleep_start();
}

void loop() {

}