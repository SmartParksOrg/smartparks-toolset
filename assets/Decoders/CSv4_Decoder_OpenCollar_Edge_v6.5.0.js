function decode_uint8(byte, min, max) {
    var val;
    val = byte * (max - min) / 255 + min;
    return val;
}
function decode_nav_payload(bytes, index, nav_len) {
    var nav_payload = "";
    var one_byte;
    var one_byte_str;
    // Skip first byte
    for (var i = 1; i < nav_len; i++) {
        one_byte = bytes[index + i];
        one_byte_str = one_byte.toString(16);
        if (one_byte_str.length == 1) {
            nav_payload += ("0" + one_byte_str);
        }
        else {
            nav_payload += one_byte_str;
        }
    }
    return nav_payload;
}
function get_constellation_name(id) {
    var name;
    if (id == 1) {
        name = "GPS";
    }
    else if (id == 2) {
        name = "GLONASS";
    }
    else if (id == 3) {
        name = "combined";
    }
    else if (id == 4) {
        name = "Galileo";
    }
    else if (id == 5) {
        name = "BeiDou";
    }
    else {
        name = "";
    }
    return name;
}
function decodeGNSSMessage(bytes) {
    //Skip header 0 and 1
    var nav_len = bytes[1];
    var decoded = {
        nav_payload: decode_nav_payload(bytes, 2, nav_len),
    };
    return decoded;
}
function decodeUbloxLocationMessage(bytes) {
    var success = bytes[2];
    var hot_retry = bytes[3];
    var cold_retry = bytes[4];
    var ttf = bytes[6] << 8 | bytes[5];
    var value = bytes[10] << 24 | bytes[9] << 16 | bytes[8] << 8 | bytes[7];
    var latitude = value / 10000000; // gps latitude,units: °
    value = bytes[14] << 24 | bytes[13] << 16 | bytes[12] << 8 | bytes[11];
    var longitude = value / 10000000; // gps longitude,units: °
    value = bytes[18] << 24 | bytes[17] << 16 | bytes[16] << 8 | bytes[15];
    var altitude = value / 1000;
    var fixType = bytes[19];
    var SIV = bytes[20];
    var h_acc_est = bytes[22] << 8 | bytes[21];
    var pDOP = bytes[23];
    var fix_time = bytes[27] << 24 | bytes[26] << 16 | bytes[25] << 8 | bytes[24];
    var active_tracking = bytes[28];
    value = bytes[29] << 8 | bytes[30];
    var cog = (value - 18000) / 100;
    var sog = bytes[31] * 3.6;
    var decoded = {
        latitude: latitude,
        longitude: longitude,
        altitude: altitude,
        success: success,
        hot_retry: hot_retry,
        cold_retry: cold_retry,
        ttf: ttf,
        fixType: fixType,
        SIV: SIV,
        h_acc_est: h_acc_est,
        pDOP: pDOP,
        fix_timestamp: fix_time,
        active_t: active_tracking,
    };

    if (active_tracking) {
        decoded["cog"] = cog;
        decoded["sog"] = sog;
    }
    return decoded;
}
function decodeStatusMessage(bytes) {
    //Skip header 0 and 1
    var reset = bytes[2];
    var err = bytes[3];
    var bat = (bytes[4] * 10) + 2500;
    var operation = bytes[5];
    var msg = 0;
    if (operation & 1) msg = 1;
    var locked = 0;
    if (operation & 2) locked = 1;
    var lr_join = 0;
    if (operation & 4) lr_join = 1;
    var lr_sat = operation >> 4;
    var temp = decode_uint8(bytes[6], -100, 100);
    var uptime = bytes[7];
    var acc_x = decode_uint8(bytes[8], -100, 100);
    var acc_y = decode_uint8(bytes[9], -100, 100);
    var acc_z = decode_uint8(bytes[10], -100, 100);
    var version = bytes[11];
    var ver_hw_minor = version & 0x0F;
    var ver_hw_major = version >> 4;
    version = bytes[12];
    var ver_fw_minor = version & 0x0F;
    var ver_fw_major = version >> 4;
    var ver_hw_type = bytes[13] & 0x0F;
    var ver_fw_type = bytes[13] >> 4;
    var chg = 0;
    if (bytes[14] > 0) chg = (bytes[14] * 100) + 5000;
    var features = bytes[15];
    var sat_support = 0;
    if (features & 1) sat_support = 1;
    var rf_scan = 0;
    if (features & 2) rf_scan = 1;
    var fence = 0;
    if (features & 4) fence = 1;
    var sat_try = features >> 4;
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
    var err_ublox_fix = 0;
    if (err & 32) err_ublox_fix = 1;
    var err_flash = 0;
    if (err & 64) err_flash = 1;
    var decoded = {
        reset: reset,
        bat: bat,
        chg: chg,
        temp: temp,
        uptime: uptime,
        locked: locked,
        msg: msg,
        acc_x: acc_x,
        acc_y: acc_y,
        acc_z: acc_z,
        lr_sat: lr_sat,
        err_lr: err_lr,
        err_lr_join: lr_join,
        err_ble: err_ble,
        err_ublox: err_ublox,
        err_acc: err_acc,
        err_bat: err_bat,
        err_ublox_fix: err_ublox_fix,
        err_flash: err_flash,
        ver_fw_major: ver_fw_major,
        ver_fw_minor: ver_fw_minor,
        ver_hw_major: ver_hw_major,
        ver_hw_minor: ver_hw_minor,
        ver_hw_type: ver_hw_type,
        ver_fw_type: ver_fw_type,
        sat_support: sat_support,
        sat_try: sat_try,
        rf_scan: rf_scan,
        fence: fence,
    };
    return decoded;
}
function decodeLRSatellitesMessage(bytes) {
    //Skip header 0
    var len = bytes[1];
    var n_sat = bytes[2];
    var decoded = {
        N_sat: n_sat,
    };
    var i = 0;
    var idx = 2;
    var object = [];
    while (i < n_sat && idx < len) {
        object[i] = {
            id: bytes[2 * i + 3],
            cnr: bytes[2 * i + 4],
        };
        decoded[String(1 + i)] = object[i];
        i++;
        idx += 2;
    }
    decoded["N_reported"] = i;
    return decoded;
}
function decodeScanMessage(bytes, fPort) {
    //Skip header 0
    var len = bytes[1];
    var n_wifi_res = bytes[2];
    var decoded = {};
    if (fPort == 6 || fPort == 10) {
        decoded = {
            N_wifi_res: n_wifi_res,
        };
    }
    else {
        decoded = {
            N_BT_res: n_wifi_res,
        };
    }
    var i = 0;
    var idx = 0;
    var object = [];
    var mac = [];
    while (i < n_wifi_res && idx < len - 1) {
        mac[i] = "";
        for (var j = 2; j > 0; j--) {
            mac[i] = mac[i].concat(bytes[3 + i * 9 + j].toString(16) + ":");
        }
        mac[i] = mac[i].concat(bytes[3 + i * 9 + 0].toString(16));
        object[i] = {
            rssi: bytes[3 + i * 9 + 3] - 128,
            count: bytes[3 + i * 9 + 4],
            mac: mac[i],
            t: bytes[3 + i * 9 + 8] << 24 | bytes[3 + i * 9 + 7] << 16 | bytes[3 + i * 9 + 6] << 8 | bytes[3 + i * 9 + 5],
        };
        decoded[String(1 + i)] = object[i];
        i++;
        idx += 9;
    }
    return decoded;
}
function decodeLastScanMessage(bytes) {
    //Skip header 0
    var len = bytes[1];
    var timestamp = bytes[5] << 24 | bytes[4] << 16 | bytes[3] << 8 | bytes[2];
    var n_wifi_res = bytes[6];
    var decoded = {
        N_BT_res: n_wifi_res,
        t: timestamp,
    };
    var i = 0;
    var idx = 5; //Set index to end of timestamp and data count
    var object = [];
    var mac = [];
    while (i < n_wifi_res && idx < len - 1) {
        mac[i] = "";
        for (var j = 2; j > 0; j--) {
            mac[i] = mac[i].concat(bytes[7 + i * 4 + j].toString(16) + ":");
        }
        mac[i] = mac[i].concat(bytes[7 + i * 4 + 0].toString(16));
        object[i] = {
            rssi: bytes[7 + i * 4 + 3] - 128,
            mac: mac[i],
        };
        decoded[String(1 + i)] = object[i];
        i++;
        idx += 4;
    }
    return decoded;
}
function decodeUbloxSatellitesMessage(bytes) {
    //Skip header 0 and 1
    var len = bytes[1];
    var n_sat = bytes[2];
    var decoded = {
        N_sat: n_sat,
    };
    var i = 0;
    var idx = 2;
    var object = [];
    while (i < n_sat && idx < len - 1) {
        object[i] = {
            id: bytes[6 * i + 3],
            cn0: bytes[6 * i + 4],
            ele: bytes[6 * i + 5],
            azi: bytes[6 * i + 7] << 8 | bytes[6 * i + 6],
            con: get_constellation_name(bytes[6 * i + 8]),
        };
        decoded[String(1 + i)] = object[i];
        i++;
        idx += 6;
    }
    decoded["N_reported"] = i;
    return decoded;
}
function decodeReadFlashMessage(bytes) {
    var decoded = {};
    var msg_len = bytes.length;
    var i = 0;
    var fPort = 0;
    var len = 0;
    var msg = [];
    var msg_idx = 0;
    var timestamp = [];
    var object = [];
    var parsed_msg = {};
    while (i < msg_len - 7) {
        fPort = bytes[i]; //Read fPort
        //We do not need id
        len = bytes[i + 2]; //Read msg len
        msg = bytes.slice(i + 1, i + len + 3); //Slice message part
        i += len + 3;
        timestamp = bytes[i + 3] << 24 | bytes[i + 2] << 16 | bytes[i + 1] << 8 | bytes[i];
        i += 4;
        parsed_msg = {};
        if (fPort != 29) {
            parsed_msg = Decoder(msg, fPort);
        }
        object[msg_idx] = {
            data: parsed_msg,
            fPort: fPort,
            timestamp: timestamp,
        };
        decoded[String(1 + msg_idx)] = object[msg_idx];
        msg_idx++;
    }
    return decoded;
}

function decodeUbloxLocationMessageShort(bytes){
    var fix_timestamp = bytes[5] << 24 | bytes[4] << 16| bytes[3] << 8 | bytes[2];
    var latitude = bytes[9] << 24 | bytes[8] << 16| bytes[7] << 8 | bytes[6];
    latitude = latitude / 10000000; 
    var longitude = bytes[13] << 24 | bytes[12] << 16| bytes[11] << 8 | bytes[10];
    longitude = longitude / 10000000; 
    var h_acc_est = bytes[15] << 8 | bytes[14];
    var decoded = {
        fix_timestamp: fix_timestamp,
        latitude: latitude,
        longitude: longitude,
        h_acc_est: h_acc_est
    };
    return decoded;
}

function decodeDeviceMessage(bytes) {
    var len = bytes[1];
    var msg_len = bytes[2];
    var msg = bytes.slice(3, 3 + msg_len);
    var seq = bytes[3 + msg_len]
    var retry = bytes[4 + msg_len];

    var decoded = {
        len: len,
        msg_len: msg_len,
        msg: msg,
        seq: seq,
        retry: retry,
    };

    return decoded;
}

function decodedMemfault(bytes) {
    var len = bytes[1];
    var msg = bytes.slice(2);

    var decoded = {
        len: len,
        msg: msg,
    };

    return decoded;
}



function uint16(b1, b2) {
    return (b1 & 0xff) | ((b2 & 0xff) << 8);
}

function getBandDisplayName(start, stop) {
    if (start >= 1920 && stop <= 1980) {
        return "1";
    } else if (start >= 2110 && stop <= 2170) {
        return "1d";
    } else if (start >= 1710 && stop <= 1785) {
        return "3";
    } else if (start >= 1805 && stop <= 1880) {
        return "3d";
    } else if (start >= 2500 && stop <= 2570) {
        return "7";
    } else if (start >= 2620 && stop <= 2690) {
        return "7d";
    } else if (start >= 880 && stop <= 915) {
        return "8";
    } else if (start >= 925 && stop <= 960) {
        return "8d";
    } else if (start >= 832 && stop <= 862) {
        return "20";
    } else if (start >= 791 && stop <= 821) {
        return "20d";
    } else if (start >= 2401 && stop <= 2484) {
        return "wifi_bt";
    } else {
        return "unknown";
    }
}

function decodeRfScannerMessage(bytes) {
    var len = bytes[1];
    var msg = bytes.slice(2);
    var decoded = {
        version: msg[0],
        should_alert: msg[1],
    };
    var offset = 2;
    var range_len = 6;
    for (var i = 0; i < (len - offset) / range_len; i++) {
        var x = offset + range_len * i;
        var c = 0;
        start = uint16(msg[x + c++], msg[x + c++]) / 10;
        stop = uint16(msg[x + c++], msg[x + c++]) / 10;
        decoded["band_" + getBandDisplayName(start, stop)] = {
            start: start,
            stop: stop,
            peak_count: msg[x + c++],
            max_rssi: -msg[x + c++],
        };
    }
    return decoded;
}

function decodeFence(bytes) {
    //Skip header 0
    var len = bytes[1];
    var success = bytes[2];
    var N = bytes[3];
    var voltage = uint16(bytes[4], bytes[5]);
    var energy = uint16(bytes[6], bytes[7]);

    var decoded = {
        success: success,
        N: N,
        voltage: voltage,
        energy: energy,
    };

    return decoded;
}

function decodeFlashStatusMessage(bytes) {
    //Skip header 0
    var len = bytes[1];
    var percentage = bytes[2];
    var n_msg = bytes[6] << 24 | bytes[5] << 16 | bytes[4] << 8 | bytes[3];

    var decoded = {
        percentage: percentage,
        n_msg: n_msg,
    };

    return decoded;
}

function decodeBluetoothCMDQMessage(bytes) {
    var len = bytes[1];
    var n_res = Math.floor(len / 13);
    var decoded = {};
    for(var i = 0; i < n_res; i++) {
        var offset = 2 + (i * 13);
        var measurement_timestamp = ((bytes[offset + 3] & 0xff) << 24)| ((bytes[offset + 2] & 0xff) << 16) | ((bytes[offset + 1] & 0xff) << 8) | (bytes[offset] & 0xff);
        var rr_median = bytes[offset + 4];
        var rr_median_modesum = bytes[offset + 5];
        var activity_average = bytes[offset + 6];
        var activity_max = bytes[offset + 7];
        var active_min_in_last_hour = bytes[offset + 8];
        var raw_temperature = uint16(bytes[offset + 10], bytes[offset + 9]);
        var temperature = 0;
        var cmdq_success = 0;
        if (raw_temperature > 0) {
            temperature = (raw_temperature*0.0248) - 18.09;
            cmdq_success = 1;
        }
        var h_impedance = uint16(bytes[offset + 12], bytes[offset + 11]); 
        decoded[i]= {
            cmdq_timestamp: measurement_timestamp,
            cmdq_rr_median: rr_median,
            cmdq_rr_median_modesum: rr_median_modesum,
            cmdq_activity_average: activity_average,
            cmdq_activity_max: activity_max,
            cmdq_active_min_in_last_hour: active_min_in_last_hour,
            cmdq_temp: temperature,
            cmdq_raw_temp: raw_temperature,
            cmdq_h_impedance: h_impedance,
            cmdq_success:cmdq_success 
        }
    }
    return decoded;
}

function decodeOpenSkyDetection(bytes){
    var decoded = {};
    var len = bytes[1];
    var n_res = Math.floor(len / 2);
    for(var i = 0; i < n_res; i++) {
        decoded[i] = {
            average_rssi: -bytes[2 + (i * 2)],
            max_rssi: -bytes[3 + (i * 2)]
        }
    }
    return decoded;
}

function decodeLastPosition(bytes) {
    if (bytes[0] == 0xfe) {
    var value = bytes[5] << 24 | bytes[4] << 16 | bytes[3] << 8 | bytes[2];
    var latitude = value / 10000000; // gps latitude,units: °
    value = bytes[9] << 24 | bytes[8] << 16 | bytes[7] << 8 | bytes[6];
    var longitude = value / 10000000; // gps longitude,units: °
    value = bytes[13] << 24 | bytes[12] << 16 | bytes[11] << 8 | bytes[10];
    var altitude = value / 1000;
    var fix_time = bytes[17] << 24 | bytes[16] << 16 | bytes[15] << 8 | bytes[14];
    var decoded = {
        latitude: latitude,
        longitude: longitude,
        altitude: altitude,
        fix_time: fix_time,
    };
  };
    return decoded;
  }

function Decode(fPort, bytes, variables) {
    // Decode an uplink message from a buffer
    // (array) of bytes to an object of fields.
    var decoded = {};
    if (fPort == 1) {
        decoded = decodeGNSSMessage(bytes);
    }
    else if (fPort == 2) {
        decoded = decodeUbloxLocationMessage(bytes);
    }
    else if (fPort == 4) {
        decoded = decodeStatusMessage(bytes);
    }
    else if (fPort == 5) {
        decoded = decodeLRSatellitesMessage(bytes);
    }
    else if (fPort == 6 || fPort == 7 || fPort == 10) {
        decoded = decodeScanMessage(bytes, fPort);
    }
    else if (fPort == 8) {
        decoded = decodeRfScannerMessage(bytes);
    }
    else if (fPort == 9) {
        decoded = decodeUbloxSatellitesMessage(bytes);
    }
    else if (fPort == 11) {
        decoded = decodeLastScanMessage(bytes);
    }
    else if (fPort == 12) {
        decoded = decodeFence(bytes);
    }
    else if (fPort == 13) {
        decoded = decodeUbloxLocationMessageShort(bytes);
    }
    else if (fPort == 14) {
        decoded = decodeFlashStatusMessage(bytes);
    }
    else if (fPort == 15) {
        decoded = decodeBluetoothCMDQMessage(bytes);
    }
    else if (fPort == 16) {
        decoded = decodeUbloxLocationMessageShort(bytes);
    }
    else if (fPort == 17) {
        decoded = decodeOpenSkyDetection(bytes);
    }
    else if (fPort == 27) {
        decoded = decodedMemfault(bytes);
    }
    else if (fPort == 28) {
        decoded = decodeDeviceMessage(bytes);
    }
    else if (fPort == 29) {
        decoded = decodeReadFlashMessage(bytes);
    }
    else if (fPort == 31) {
        decoded = decodeLastPosition(bytes);
    }
    return decoded;
}

// v3 to v4 compatibility wrapper
function decodeUplink(input) {
  return {
    data: Decode(input.fPort, input.bytes, input.variables)
  };
}