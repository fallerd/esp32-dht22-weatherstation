#include <WiFi.h>
#include <HTTPClient.h>
#include "DHTesp.h"
#include "secret.h"
DHTesp dht;

const char* ssid = SSID;
const char* password = PASSWORD;

HTTPClient httpClient;
int counter = 0;  
static bool hasWifi = false;

static void InitWifi()
{
  Serial.println("Connecting Wifi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  hasWifi = true;
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void setup()
{
  Serial.begin(115200);
  dht.setup(27, DHTesp::DHT22);
  Serial.println("ESP32 Device");

  hasWifi = false;
  InitWifi();
  if (!hasWifi)
  {
    return;
  }
}

void loop(){
  if (WiFi.status() == WL_CONNECTED) {
    counter = 0;
    Serial.println("Wifi is still connected with IP: "); 
    Serial.println(WiFi.localIP());
  } else if (WiFi.status() != WL_CONNECTED) { // if we lost connection, retry
    WiFi.begin(ssid);      
  }
  while (WiFi.status() != WL_CONNECTED) { // during lost connection, print dots
    delay(500);
    Serial.print(".");
    counter++;
    if (counter>=60){ // 30 seconds timeout - reset board
    ESP.restart();
    }
  }

  // Reading temperature & humidity
  float temp = dht.getTemperature();
  float humidity = dht.getHumidity();
  int chipId = ESP.getEfuseMac();

  Serial.println("*** requesting URL");

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

  //Check for the returning code
  int httpCode = httpClient.POST(httpRequestData);       
  Serial.println(httpCode);
   
  if (httpCode > 200) { 
      Serial.println("Error on HTTP request");
  }

  httpClient.end();
  Serial.println("*** End ");
  delay(60000); // send once per minute
}