//SodaqOne v2
//tracker-v1.1

// TTN decoder function, using the ChripStack decoder
function Decoder(bytes) {
  return Decode(port, bytes);
}

// ChirpStack decode function
function Decode(fPort, bytes) {
  var decoded = {};
  var cnt = 0;

// GPS Update
  if (fPort === 1) {
    decoded.time = bytes[cnt++] | (bytes[cnt++] << 8) | (bytes[cnt++] << 16) | (bytes[cnt++] << 24);
    var d = new Date(decoded.time * 1000);
    decoded.time_decoded = d.toLocaleString();
    decoded.battery = bytes[cnt++] * 10 + 3000; //mV
    decoded.temperature = bytes[cnt++];
    decoded.latitude = (bytes[cnt++] | (bytes[cnt++] << 8) | (bytes[cnt++] << 16) | (bytes[cnt++] << 24)) / 10000000;
    decoded.longitude = (bytes[cnt++] | (bytes[cnt++] << 8) | (bytes[cnt++] << 16) | (bytes[cnt++] << 24)) / 10000000;
    decoded.altitude = bytes[cnt++] | (bytes[cnt++] << 8);
    decoded.speed = bytes[cnt++] | (bytes[cnt++] << 8);
    decoded.course = bytes[cnt++];
    decoded.satellites = bytes[cnt++];
    decoded.time_to_fix = bytes[cnt++];
    if (decoded.latitude === 0.0 && decoded.longitude === 0.0) {
      delete decoded.latitude;
      delete decoded.longitude;
      delete decoded.altitude;
      delete decoded.speed;
      delete decoded.course;
    }
  }
  return decoded;
}
