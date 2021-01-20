// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an object, e.g. {"temperature": 22.5}

function decode_uint8_t(bytes, index) {
  var data = bytes[index.i];
  index.i += 1;
  return data;
}

function decode_32_bits(bytes, index) {
  var data = (bytes[index.i + 3] << 24) |
    (bytes[index.i + 2] << 16) |
    (bytes[index.i + 1] << 8) |
    bytes[index.i];

  index.i += 4;
  return data;
}

function decode_nav_payload(bytes, index, nav_len) {
  var nav_payload = "";
  var one_byte;
  var one_byte_str;

  // Skip first byte
  for (var i = 1; i < nav_len; i++) {
    one_byte = bytes[index.i + i];
    one_byte_str = one_byte.toString(16);
    if (one_byte_str.length == 1) {
      nav_payload += ("0" + one_byte_str);
    } else {
      nav_payload += one_byte_str;
    }
  }

  index.i += nav_len;
  return nav_payload;

}

function decode_uint8(byte, min, max) {
  var val;
  val = byte * (max - min) / 255 + min;

  return val;
}

// TTN decoder function, using the ChripStack decoder
function Decoder(bytes) {
  Decode(port, bytes, null)
}

// ChirpStack decode function
function Decode(fPort, bytes, variables) {
  // Decode an uplink message from a buffer
  // (array) of bytes to an object of fields.
  var decoded = {};

  var index = {
    i: 0
  };

  if (fPort == 1) {

    gps_time = decode_32_bits(bytes, index);
    lat = decode_32_bits(bytes, index) / 10000000;
    lon = decode_32_bits(bytes, index) / 10000000;
    alt = decode_32_bits(bytes, index) / 1000;
    nav_len = decode_uint8_t(bytes, index);

    decoded = {
      gps_time: gps_time,
      latitude: lat,
      longitude: lon,
      altitude: alt,
      lr1110_gnss: decode_nav_payload(bytes, index, nav_len),
    };

  }

  if (fPort == 2) {

    var value = bytes[6] << 24 | bytes[5] << 16 | bytes[4] << 8 | bytes[3];
    var latitude = value / 10000000; // gps latitude,units: °
    value = bytes[10] << 24 | bytes[9] << 16 | bytes[8] << 8 | bytes[7];
    var longitude = value / 10000000; // gps longitude,units: °
    value = bytes[14] << 24 | bytes[13] << 16 | bytes[12] << 8 | bytes[11];
    var altitude = value / 1000;

    var success = bytes[0];
    var hot_retry = bytes[1];
    var cold_retry = bytes[2];

    decoded = {
      latitude: latitude,
      longitude: longitude,
      altitude: altitude,
      success: success,
      hot_retry: hot_retry,
      cold_retry: cold_retry,
    };
  }

  if (fPort == 4) {
    var reset = bytes[0];
    var err = bytes[1];
    var bat = (bytes[2] * 10) + 2500;
    var volt = bytes[3] * 100;
    var temp = decode_uint8(bytes[4], -100, 100);
    var uptime = bytes[5];
    var acc_x = decode_uint8(bytes[6], -100, 100);
    var acc_y = decode_uint8(bytes[7], -100, 100);
    var acc_z = decode_uint8(bytes[8], -100, 100);
    var version = bytes[9];
    var ver_hw_minor = version & 0x0F;
    var ver_hw_major = version >> 4;
    version = bytes[10];
    var ver_fw_minor = version & 0x0F;
    var ver_fw_major = version >> 4;
    var ver_hw_type = bytes[11];
    var lr_sat = bytes[12];
    var lr_fix = bytes[13];
    var value = bytes[16] << 16 | bytes[15] << 8 | bytes[14];
    var lat = (value - 900000) / 10000;
    value = bytes[19] << 16 | bytes[18] << 8 | bytes[17];
    var lon = (value - 1800000) / 10000;

    //Errors
    var err_lr = 0;
    if (err & 1) err_lr = 1;
    var err_ble = 0;
    if (err & 2) err_ble = 1;
    var err_ublox = 0;
    if (err & 4) err_ublox = 1;
    var err_acc = 0;
    if (err & 8) err_acc = 1;
    var err_bat = 0;
    if (err & 16) err_bat = 1;
    var err_time = 0;
    if (err & 32) err_time = 1;

    decoded = {
      reset: reset,
      bat: bat,
      volt: volt,
      temp: temp,
      uptime: uptime,
      acc_x: acc_x,
      acc_y: acc_y,
      acc_z: acc_z,
      lr_sat: lr_sat,
      lr_fix: lr_fix,
      //lat         : lat,
      //lon         : lon,
      err_lr: err_lr,
      err_ble: err_ble,
      err_ublox: err_ublox,
      err_acc: err_acc,
      err_bat: err_bat,
      err_time: err_time,
      ver_fw_major: ver_fw_major,
      ver_fw_minor: ver_fw_minor,
      ver_hw_major: ver_hw_major,
      ver_hw_minor: ver_hw_minor,
      ver_hw_type: ver_hw_type
    };

  }
  return decoded;
}

