// TTN decoder function, using the ChripStack decoder
function Decoder(bytes) {
  return Decode(port, bytes);
}

// ChirpStack decode function
function Decode(fPort, bytes) {

  var decoded = {};
  var raw = {};

  if (fPort === 2) {
    decoded.fw_version = bytes[0];
    raw.latitude_degrees = parseFloat(String.fromCharCode(bytes[1], bytes[2]));
    raw.latitude_minutes = parseFloat(String.fromCharCode(bytes[3], bytes[4]));
    raw.latitude_seconds = parseFloat(String.fromCharCode(bytes[5], bytes[6], bytes[7], bytes[8], bytes[9], bytes[10]));
    decoded.latitude = raw.latitude_degrees + raw.latitude_minutes / 60 + raw.latitude_seconds / 60;
    raw.latitudeCardinal = String.fromCharCode(bytes[11]);
    if (raw.latitudeCardinal == "S") {
      decoded.latitude = decoded.latitude * -1;
    }
    raw.longitude_degrees = parseFloat(String.fromCharCode(bytes[12], bytes[13], bytes[14]));
    raw.longitude_minutes = parseFloat(String.fromCharCode(bytes[15], bytes[16]));
    raw.longitude_seconds = parseFloat(String.fromCharCode(bytes[17], bytes[18], bytes[19], bytes[20], bytes[21], bytes[22]));
    decoded.longitude = raw.longitude_degrees + raw.longitude_minutes / 60 + raw.longitude_seconds / 60;
    raw.longitudeCardinal = String.fromCharCode(bytes[23]);
    if (raw.longitudeCardinal == "W") {
      decoded.longitude = decoded.longitude * -1;
    }
    decoded.altitude = parseFloat(String.fromCharCode(bytes[24], bytes[25], bytes[26], bytes[27], bytes[28], bytes[29], bytes[30]));
    decoded.speed = parseFloat(String.fromCharCode(bytes[31], bytes[32], bytes[33], bytes[34], bytes[35], bytes[36], bytes[37], bytes[38]));
    decoded.course = parseFloat(String.fromCharCode(bytes[39], bytes[40], bytes[41], bytes[42], bytes[43], bytes[44], bytes[45], bytes[46]));
  } else if (fPort === 3) {
    decoded.fw_version = bytes[0];
    decoded.interval = bytes[1];
    decoded.datarate = bytes[2];
  }
  return decoded;
}
