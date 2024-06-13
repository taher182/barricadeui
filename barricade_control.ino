// Define pin numbers
const int redLEDPin = 0;
const int greenLEDPin = 1;
const int safetySensorPin = 2;
const int openRelayPin = 3;          // Relay pin for clockwise rotation
const int closeRelayPin = 4;         // Relay pin for anti-clockwise rotation (active LOW)
const int pushButtonPin = 5;         // Push button pin
const int openLimitSwitchPin = 6;    // Limit switch pin for fully open position
const int closeLimitSwitchPin = 7;   // Limit switch pin for fully closed position

// State variables
bool isOpening = false;
bool isClosing = false;
bool lastButtonState = HIGH;         // Previous state of the push button (HIGH for pull-up)
bool barricadeState = LOW;           // Current state of the barricade (LOW = closed, HIGH = open)
bool buttonLock = false;             // Lock the button when the gate is in motion

void setup() {
  // Initialize pin modes
  pinMode(redLEDPin, OUTPUT);
  pinMode(greenLEDPin, OUTPUT);
  pinMode(openRelayPin, OUTPUT);
  pinMode(closeRelayPin, OUTPUT);
  pinMode(pushButtonPin, INPUT_PULLUP);         // Use internal pull-up resistor
  pinMode(openLimitSwitchPin, INPUT_PULLUP);    // Use internal pull-up resistor
  pinMode(closeLimitSwitchPin, INPUT_PULLUP);   // Use internal pull-up resistor

  // Initial relay states
  digitalWrite(redLEDPin, HIGH);
  digitalWrite(greenLEDPin, LOW);
  digitalWrite(openRelayPin, HIGH);
  digitalWrite(closeRelayPin, HIGH); // Deactivate close relay (active LOW)
  
}

void loop() {
  // Read the state of the push button
  bool buttonState = digitalRead(pushButtonPin);

  // Detect a button press (change from HIGH to LOW) if the button is not locked
  if (buttonState == LOW && lastButtonState == HIGH && !buttonLock) {
    // Change the state of the barricade
    barricadeState = !barricadeState;

    if (barricadeState == HIGH) {
      // Start opening the barricade
      isOpening = true;
      digitalWrite(openRelayPin, LOW);
      digitalWrite(greenLEDPin, HIGH);
      digitalWrite(redLEDPin, LOW);
      digitalWrite(closeRelayPin, HIGH); // Ensure close relay is deactivated
    } else {
      // Start closing the barricade
      isClosing = true;
      digitalWrite(closeRelayPin, LOW);  // Set LOW to activate
       digitalWrite(greenLEDPin, LOW);
      digitalWrite(redLEDPin, HIGH);
      digitalWrite(openRelayPin, HIGH);   // Ensure open relay is deactivated
    }

    // Lock the button to prevent intermediate presses
    buttonLock = true;
  }

  // Update the last button state
  lastButtonState = buttonState;

  // Check limit switches to stop the motor
  if (isOpening && digitalRead(openLimitSwitchPin) == LOW) {
    // Stop the motor when fully open
    digitalWrite(openRelayPin, HIGH);
    isOpening = false;
    // Unlock the button after operation
    buttonLock = false;
  }

  if (isClosing && digitalRead(closeLimitSwitchPin) == LOW) {
    // Stop the motor when fully closed
    digitalWrite(closeRelayPin, HIGH); // Set HIGH to deactivate
    isClosing = false;
    // Unlock the button after operation
    buttonLock = false;
  }
}
