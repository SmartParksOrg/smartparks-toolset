// TTN decoder function, using the ChripStack decoder
function Decoder(bytes) {
  return Decode(port, bytes);
}

// ChirpStack decode function
function Decode(fPort, bytes) {

  var decoded = {};

  var alarmCause_dict = {
    0: "NO ALARMS",
    1: "LOW BATTERY",
    2: "HIGH BATTERY",
    16: "LOW PULSE",
    32: "HIGH PULSE",
    128: "NO PULSE"
  };

  var datarate_dict = {
    0: "SF12",
    1: "SF11",
    2: "SF10",
    3: "SF9",
    4: "SF8",
    5: "SF7",
    6: "SF7 250kHz"
  };

  // settings
  if (fPort == 1 || fPort == 2) {
    decoded.firmware_version = bytes[0];
    decoded.alarm_status = alarmCause_dict[bytes[1]];
    decoded.battery = (bytes[2] << 8) | bytes[3];
    decoded.battery = (decoded.battery * (3600 / 4096));
    decoded.fence_voltage = (bytes[4] << 8) | bytes[5];
    decoded.fence_voltage = (((decoded.fence_voltage * 3.6) / 8192) * 13554);
    decoded.fence_pulses = (bytes[6] << 8) | bytes[7];

  } else if (fPort == 3 || fPort == 4) {
    decoded.firmware_version = bytes[0];
    decoded.heartbeat_interval = (bytes[1] << 8) | bytes[2];
    decoded.measure_interval = (bytes[4] << 8) | bytes[5];
    decoded.alarm_interval_factor = bytes[3];
    decoded.datarate = datarate_dict[bytes[6]];
    decoded.battery_high = (bytes[7] << 8) | bytes[8];
    decoded.battery_high = (decoded.battery_high * (3600 / 4096));
    decoded.battery_low = (bytes[9] << 8) | bytes[10];
    decoded.battery_low = (decoded.battery_low * (3600 / 4096));
    decoded.fence_high = (bytes[11] << 8) | bytes[12];
    decoded.fence_high = (((decoded.fence_high * 3.6) / 8192) * 13554)
    decoded.fence_low = (bytes[13] << 8) | bytes[14];
    decoded.fence_low = (((decoded.fence_low * 3.6) / 8192) * 13554)
  }

  return decoded;
}
