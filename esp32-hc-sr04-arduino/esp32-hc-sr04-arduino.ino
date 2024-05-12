#include <WiFi.h>
#include <HTTPClient.h>
#include "secret.h"

const char* ssid = SSID;
const char* password = PASSWORD;

HTTPClient httpClient;
int timeout = 0;  

const int trigPin = 5;
const int echoPin = 18;

//define sound speed in cm/uS
#define SOUND_SPEED 0.034
#define CM_TO_INCH 0.393701

long duration;
float distanceCm;
float distanceInch;

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

static void getDistance() {
  // Clears the trigPin
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  // Sets the trigPin on HIGH state for 10 micro seconds
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Reads the echoPin, returns the sound wave travel time in microseconds
  duration = pulseIn(echoPin, HIGH);
  
  // Calculate the distance
  distanceCm = duration * SOUND_SPEED/2;
  
  // Convert to inches
  distanceInch = distanceCm * CM_TO_INCH;
}

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT); // Sets the trigPin as an Output
  pinMode(echoPin, INPUT); // Sets the echoPin as an Input
  
  InitWifi();

  getDistance();

  Serial.println("Posting data:");

  String url = URL;
  url += "postDistance/";
  httpClient.begin(url);
  httpClient.addHeader("Content-Type", "application/json");

  String httpRequestData = "{\"distance\":";
  httpRequestData += distanceInch;
  httpRequestData += "}";
  Serial.println(httpRequestData);

  //Check for the returning code
  int httpCode = httpClient.POST(httpRequestData);       
  Serial.println(httpCode);
   
  if (httpCode > 200 || httpCode < 0) { 
    Serial.println("Error on HTTP request");
  }

  httpClient.end();
  Serial.println("Sleeping for 1 mins");

  esp_sleep_enable_timer_wakeup(1000000 * 60 * 1);
  esp_deep_sleep_start();
}

void loop() {

}