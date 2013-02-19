#include <EEPROM.h>
#include <SoftwareSerial.h>
#include <AnalogInputs.h>
#include <Buttons.h>
#include "Setup.h"

#define PRECISION_LOW 250
#define PRECISION_MED 500
#define PRECISION_HI 1000

#define SERIAL_FUNC_COLOR 1
#define SERIAL_FUNC_DUMP 2
#define SERIAL_FUNC_RESET 3

byte color[3] = {0, 0, 0},
    sensorColor = 2;

int precision = PRECISION_MED;

bool sampling = 0;

unsigned long lastSample = 0;

void output(bool off = 0) {
    Serial.write(SERIAL_FUNC_COLOR);
    for(byte x=0; x<3; x++) Serial.write(color[x]);
        //DEBUG
        //if(x > 0) Serial.print(",");
        //Serial.print(color[x]);
    //}
    //Serial.println(" ");
}

void loop(void) {
    buttons.read();
    analogInputs.read();

    if(Serial.available()) {
        switch((byte) Serial.read()) {
            case 0:
                precision = PRECISION_LOW;
            break;
            case 1:
                precision = PRECISION_MED;
            break;
            case 2:
                precision = PRECISION_HI;
            break;
            case 254: //Dump EEPROM
                Serial.write(SERIAL_FUNC_DUMP);
                Serial.write(EEPROM.read(0));
                Serial.write(EEPROM.read(1));
                for(int x=2; x<(((int) EEPROM.read(0) + ((int) EEPROM.read(1) << 8)) * 3) + 2; x++) Serial.write(EEPROM.read(x));
            break;
            case 255: //Reset EEPROM
                EEPROM.write(0, 0);
                EEPROM.write(1, 0);
                Serial.write(SERIAL_FUNC_RESET);
        }
    }

    if(!sampling) return;
    unsigned long t = millis();
    if(t - lastSample < precision) return;
    lastSample = t;
    digitalWrite(sensor[sensorColor], HIGH);
    sensorColor++;
    if(sensorColor == 3) {
        sensorColor = 0;
        output();
    }
    digitalWrite(sensor[sensorColor], LOW);
}

void buttonUp(byte pin) {
    switch(pin) {
        case Button1Pin:
            sampling = 0;
            digitalWrite(sensor[sensorColor], HIGH);
            sensorColor = 2;
            output();
    }
}

void buttonDown(byte pin) {
    switch(pin) {
        case Button1Pin:
            sampling = 1;
        break;
        case Button2Pin:
            /*for(byte x=0; x<5; x++) {
                output(1);
                delay(250 - (50 * x));
                output();
                delay(250 - (50 * x));
            }

            int c = (int) EEPROM.read(0) + (EEPROM.read(1) << 8),
                x = (c * 3) + 2;

            for(int y=0; y<3; y++) EEPROM.write(x + y, color[y]);
            c++;
            EEPROM.write(0, lowByte(c));
            EEPROM.write(1, highByte(c));*/
        break;
    }
}

void onChange(byte pin, int read) {
    if(!sampling) return;
    color[sensorColor] = map(constrain(read, calibration[sensorColor], calibration[sensorColor + 3]), calibration[sensorColor], calibration[sensorColor + 3], 0, 255);
}
