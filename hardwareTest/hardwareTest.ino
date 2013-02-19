#include <SoftwareSerial.h>
#include <AnalogInputs.h>
#include <Buttons.h>
#include "Setup.h"

#define CALIBRATION 1
#ifdef CALIBRATION
	int values[3] = {0, 0, 0};
#endif

byte c = 2;
unsigned long lt = 0;

void loop(void) {
	analogInputs.read();
	buttons.read();
	
	unsigned long t = millis();
	if(t - lt > 1000) {
		#ifdef CALIBRATION
			Serial.println(values[c], DEC);
		#endif
		digitalWrite(sensor[c], HIGH);
		c++;
		if(c >= 3) c = 0;
		Serial.print(c == 0 ? "RED" : c == 1 ? "GREEN" : "BLUE");
		Serial.println(" LEDS TEST");
		digitalWrite(sensor[c], LOW);
		lt = millis();
	}
}

void buttonUp(byte pin) {
	Serial.print("BUTTON ");
	Serial.print(pin, DEC);
	Serial.println(" UP");
	switch(pin) {
		case Button1Pin:
			c = 0;	
	}
}

void buttonDown(byte pin) {
	Serial.print("BUTTON ");
	Serial.print(pin, DEC);
	Serial.println(" DOWN");
}

void onChange(byte pin, int read) {
	switch(pin) {
		case PhotoResistorPin:
			#ifdef CALIBRATION
				values[c] = read;
			#else
				Serial.print("PHOTO RESISTOR: ");
				Serial.println(analogRead(PhotoResistorPin), DEC);
			#endif
	}
}
