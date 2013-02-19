/*
    Setup.h - Pin Declarations, common variables & setup function for ColorPicker.
    Created by Daniel Esteban, February 16, 2013.
*/

#ifndef Config_h
#define Config_h

#include <Arduino.h>
#include <SoftwareSerial.h>
#include <AnalogInputs.h>
#include <Buttons.h>

//#define SerialSpeed 57600
#define SerialSpeed 19200

//Pin Declarations
#define PhotoResistorPin 0
#define Button1Pin 1
#define Button2Pin 2
#define LedPin 3
#define SensorRedPin 8
#define SensorGreenPin 7
#define SensorBluePin 6
#define SerialRxPin 9
#define SerialTxPin 10

const byte sensor[3] = {
		SensorRedPin,
		SensorGreenPin,
		SensorBluePin
	};

//Calibration Variables
const int calibration[6] = {
	900, 600, 670, //Get this running the hardware test sketch over a black sample.
	925, 725, 730  //Same here, but over a white sample.
};

//STOP EDITING HERE...

//Library and setup function
extern void buttonUp(byte pin);
extern void buttonDown(byte pin);
Buttons buttons(buttonUp, buttonDown);

extern void onChange(byte pin, int read);
AnalogInputs analogInputs(onChange);

SoftwareSerial Serial(SerialRxPin, SerialTxPin);

void setup() {
	pinMode(SerialRxPin, INPUT);
	pinMode(SerialTxPin, OUTPUT);
	Serial.begin(SerialSpeed);
	
	pinMode(LedPin, OUTPUT);
	//digitalWrite(LedPin, HIGH);

	analogInputs.setup(PhotoResistorPin);
		
	buttons.setup(Button1Pin);
	buttons.setup(Button2Pin);
	
	for(byte x=0; x<3; x++) {
		pinMode(sensor[x], OUTPUT);
		digitalWrite(sensor[x], HIGH);
	}
}

#endif
