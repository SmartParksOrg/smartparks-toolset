// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
// The function must return an object, e.g. {"temperature": 22.5}

// TTN decoder function, using the ChripStack decoder
function Decoder(bytes) {
  Decode(port, bytes)
}

// ChirpStack decode function
function Decode(fPort, bytes) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.

  var alarm = (bytes[6] & 0x40) ? true : false;//Alarm status
  var value = ((bytes[6] & 0x3f) << 8) | bytes[7];
  var batV = value;//Battery,units:MiliVolts

  value = bytes[8] << 8 | bytes[9];
  if (bytes[8] & 0x80) {
    value |= 0xFFFF0000;
  }
  var roll = value / 100; //roll,units: °

  value = bytes[10] << 8 | bytes[11];
  if (bytes[10] & 0x80) {
    value |= 0xFFFF0000;
  }
  var pitch = value / 100; //pitch,units: °

  var json = {
    roll: roll,
    pitch: pitch,
    battery: batV,
    alarm: alarm
  }

  var lat = bytes[0] << 16 | bytes[1] << 8 | bytes[2];
  if (bytes[0] & 0x80) {
    lat |= 0xFFFFFF000000;
  }
  var lon = bytes[3] << 16 | bytes[4] << 8 | bytes[5];
  if (bytes[3] & 0x80) {
    lon |= 0xFFFFFF000000;
  }
  if (lat == 0x0FFFF && lon == 0x0FFFF) {
    // gps disabled (low battery)
    json.gps_status = "disabled";
    json.latitude = 0;
    json.longitude = 0;
  } else if (lat === 0 && lon === 0) {
    // gps no position yet
    json.gps_status = "no_fix";
    json.latitude = 0;
    json.longitude = 0;
  } else {
    json.gps_status = "fix";
    json.latitude = lat / 10000; // gps latitude,units: °
    json.longitude = lon / 10000; // gps longitude,units: °
  }
  return json;
}
