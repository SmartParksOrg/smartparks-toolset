//Globalsat v1
//globalsat_lt100_v1

// TTN decoder function, using the ChripStack decoder
function Decoder(bytes) {
  Decode(port, bytes)
}

// ChirpStack decode function
function Decode(fPort, bytes) {
  var decoded = {};
  var cnt = 0;

// GPS Update
  if (fPort === 2) {
    decoded.battery = bytes[2]; //battery capacity percentage
    decoded.latitude = ((bytes[3] << 24) | (bytes[4] << 16) | (bytes[5] << 8) | (bytes[6])) / 1000000;
    decoded.longitude = ((bytes[7] << 24) | (bytes[8] << 16) | (bytes[9] << 8) | (bytes[10])) / 1000000;
  }
  return decoded;
}
