/*
 ____  _  _   __   ____  ____ 
/ ___)( \/ ) / _\ (  _ \(_  _)
\___ \/ \/ \/    \ )   /  )(  
(____/\_)(_/\_/\_/(__\_) (__) 
 ____   __   ____  __ _  ____ 
(  _ \ / _\ (  _ \(  / )/ ___)
 ) __//    \ )   / )  ( \___ \
(__)  \_/\_/(__\_)(__\_)(____/

Smart Parks - VE.Direct Decoder.
Use it as it is or remove the bugs :)
www.smartparks.org
tim@smartparks.org

TEST PAYLOAD: 927e8a2800290407cd0190a156cd419604cdeaec05ccbe240525ccdc08a24f4e06cd29ea

?		927e8a		
ERR		2800		00 = geen errors									---> klopt
CS		2904		4 = Absorption 										---> klopt
IL		07cd0190	cd negeren / 0190 = 400 mA / 1000 = 0.4 A 			---> klopt
?		a156cd		
V		4196		16790 / 1000 = 16.79 Volt							---> klopt
VPV		04cdeaec	cd negeren / eaec = 60140 mV / 1000 = 60.14 Volt 	---> klopt
PPV		05ccbe		cc negeren / be = 190 Watt							---> klopt
H20		2405		05 = 5 * 0.01 kWh = 0.05 kWh						---> klopt
H21		25ccdc		cc negeren / dc = 220 W								---> klopt
LOAD	08a24f4e	a2 = ASCI 2 bytes / 4f4e = ON					---> klopt
I		06cd29ea	cd negeren / 29ea = 10730 mA / 1000 = 10.73 A		---> klopt

*/

var TYPE_A1 = 0xA1; // Filler
var TYPE_A2 = 0xA2; // TO DO: find out what this is
var TYPE_A4 = 0xA4; // MPPT mode
var TYPE_START = 0x92; // Start of partial payload
var TYPE_V = 0x00; // Battery voltage
var TYPE_VS = 0x01; // Auxiliary voltage
var TYPE_VM = 0x02; // Mid-point voltage of the battery bank
var TYPE_DM = 0x03; // Mid-point deviation of the battery bank
var TYPE_VPV = 0x04; // Panel voltage
var TYPE_PPV = 0x05; // Panel power
var TYPE_I = 0x06; // Battery current
var TYPE_IL = 0x07; // Load current
var TYPE_LOAD = 0x08; // Load output state (on/off)
var TYPE_T = 0x09; // Battery temperature
var TYPE_P = 0x0A; // Instantaneous power
var TYPE_CE = 0x0B; // Consumed Amp Hours
var TYPE_SOC = 0x0C; // State-of-charge
var TYPE_TTG = 0x0D; // Time-to-go
var TYPE_ALARM = 0x0E; // Alarm condition active
var TYPE_RELAY = 0x0F; // Relay state
var TYPE_AR = 0x10; // Alarm reason
var TYPE_H1 = 0x11; // Depth of the deepest discharge
var TYPE_H2 = 0x12; // Depth of the last discharge
var TYPE_H3 = 0x13; // Depth of the average discharge
var TYPE_H4 = 0x14; // Number of charge cycles
var TYPE_H5 = 0x15; // Number of full discharges
var TYPE_H6 = 0x16; // Cumulative Amp Hours drawn
var TYPE_H7 = 0x17; // Minimum main (battery) voltage
var TYPE_H8 = 0x18; // Maximum main (battery) voltage
var TYPE_H9 = 0x19; // Number of seconds since last full charge
var TYPE_H10 = 0x1A; // Number of automatic synchronizations
var TYPE_H11 = 0x1B; // Number of low main voltage alarms
var TYPE_H12 = 0x1C; // Number of high main voltage alarms
var TYPE_H13 = 0x1D; // Number of low auxiliary voltage alarms
var TYPE_H14 = 0x1E; // Number of high auxiliary voltage alarms
var TYPE_H15 = 0x1F; // Minimum auxiliary (battery) voltage
var TYPE_H16 = 0x20; // Maximum auxiliary (battery) voltage
var TYPE_H17 = 0x21; // Amount of discharged energy
var TYPE_H18 = 0x22; // Amount of charged energy
var TYPE_H19 = 0x23; // Yield total (user resettable counter)
var TYPE_H20 = 0x24; // Yield Today
var TYPE_H21 = 0x25; // Maximum Power Today
var TYPE_H22 = 0x26; // Yield yesterday
var TYPE_H23 = 0x27; // Maximum power yesterday
var TYPE_ERR = 0x28; // Error code
var TYPE_CS = 0x29; // State of operation
var TYPE_BMV = 0x2A; // Model description (deprecated)
var TYPE_FW = 0x2B; // Firmware version
var TYPE_PID = 0x2C; // Product ID
var TYPE_SER = 0x2D; // Serial number
var TYPE_HSDS = 0x2E; // Day sequence number (0..364)
var TYPE_MODE = 0x2F; // Device mode
var TYPE_AC_OUT_V = 0x30; // AC output voltage
var TYPE_AC_OUT_I = 0x31; // AC output current
var TYPE_WARN = 0x32; // Warning reason
var TYPE_v = 0x33; // Attributes used by Coupling

var CS_dict = {
    0: "OFF",
    1: "LOW POWER",
    2: "FAULT",
    3: "BULK",
    4: "ABSOPTION",
    5: "FLOAT",
    9: "INVERTING"
  };

var ERR_dict = {
    0: "No error",
    2: "Battery voltage too high",
    17: "Charger temperature too high",
    18: "Charger over current",
    19: "Charger current reversed",
    20: "Bulk time limit exceeded",
    21: "Current sensor issue (sensor bias/sensor broken)",
	26: "Terminals overheated",
	33: "Input voltage too high (solar panel)",
	34: "Input current too high (solar panel)",
	38: "Input shutdown (due to excessive battery voltage)",
	116: "Factory calibration data lost",
	117: "Invalid/incompatible firmware",
	119: "User settings invalid"	
  };

function bin16dec(bin) {
  var num = bin & 0xFFFF;
  if (0x8000 & num)
    num = -(0x010000 - num);
  return num;
}

function bin8dec(bin) {
  var num = bin & 0xFF;
  if (0x80 & num)
    num = -(0x0100 - num);
  return num;
}

function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

function hexToAscii(hex) {
	var hex  = hex.toString();
	var str = '';
	for (var n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
 }

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

function DecodePayload(data) {
  var obj = new Object();
  for (i = 0; i < data.length; i++) {
    //console.log(data[i]);
    
	switch (data[i]) {
      
	  case TYPE_A4: // MPPT mode
		var MODE = (data[i + 1]) | (data[i + 2]) | (data[i + 3]) | (data[i + 4]);
		obj.MODE = "MPPT";
		var MPPT = (data[i + 5]);
		obj.MPPT = MPPT;
		i += 5;
		break
	  case TYPE_A2: // TO DO: unknown variable
		i += 16;
		break	
	  case TYPE_A1: // Filler and Voltage
        var A1 = (data[i + 1] << 8) | (data[i + 2]);
		obj.A1 = A1;
		i += 2; // shifting an extra 2 bytes to take into account Voltage reading if needed
		var V = (data[i + 1] << 8) | (data[i + 2]);
		obj.V = V;
        i += 2;ac
	    break
	  case TYPE_START: // Start of partial payload
		if ((data[i + 1]) === 0xCC) {
			var START = (data[i + 1] << 8) | (data[i + 2]);
			obj.START = START;
			i += 3;
		}
		else if ((data[i + 1]) === 0xCD) {
			var START = (data[i + 1] << 8) | (data[i + 2]) | (data[i + 3]);
			obj.START = START;
			i += 4;
		}
		else {
			var START = (data[i + 1] << 8) | (data[i + 2]);
			obj.START = START;
			i += 2;
		}	
        break
    //  case TYPE_V: // Battery voltage
    //    var V = (data[i + 1] << 8) | (data[i + 2]);
    //    obj.V = V;
    //    i += 2;
    //    break
	  case TYPE_VPV: // Panel voltage
		if ((data[i + 1]) === 0xCD) {
			var VPV = (data[i + 2] << 8) | (data[i + 3]);
			obj.VPV = VPV;
			i += 3;
		}
		else {
			var VPV = (data[i + 1]);
			obj.VPV = VPV;
			i += 1;
		}
		break
	  case TYPE_PPV: // Panel power
       if ((data[i + 1]) === 0xCC) {
			var PPV = (data[i + 2]);
			obj.PPV = PPV;
			i += 2;
        }
		else {
			var PPV = (data[i + 1]);
			obj.PPV = PPV;
			i += 1;
		}		
		break
	  case TYPE_H19: // Yield total (user resettable counter)
		if ((data[i + 1]) === 0xCD) {
			var H19 = (data[i + 2] << 8) | (data[i + 3]);
			obj.H19 = H19;
			i += 3;
		}
		else {
			var H19 = (data[i + 1]);
			obj.H19 = H19;
			i += 1;
		}	
        break
	  case TYPE_H20: // Yield Today
        var H20 = (data[i + 1]);
		obj.H20 = H20;
        i += 1;
        break
	  case TYPE_H21: // Amount of discharged energy
		if ((data[i + 1]) === 0xCC) {
			var H21 = (data[i + 2]);
			obj.H21 = H21;
			i += 2;
		}
		else if ((data[i + 1]) === 0xCD) {
			var H21 = (data[i + 2] << 8) | (data[i + 3]);
			obj.H21 = H21;
			i += 3;
		}
		else {
			var H21 = (data[i + 1]);
			obj.H21 = H21;
			i += 1;
		}
        break
	  case TYPE_H22: // Yield yesterday
		if ((data[i + 1]) === 0xCC) {
			var H22 = (data[i + 2]);
			obj.H22 = H22;
			i += 2;
		}
		else if ((data[i + 1]) === 0xCD) {
			var H22 = (data[i + 2] << 8) | (data[i + 3]);
			obj.H22 = H22;
			i += 3;
		}
		else {
			var H22 = (data[i + 1]);
			obj.H22 = H22;
			i += 1;
		}
        break
	  case TYPE_H23: // Maximum power yesterday
		if ((data[i + 1]) === 0xCC) {
			var H23 = (data[i + 2]);
			obj.H23 = H23;
			i += 2;
		}
		else if ((data[i + 1]) === 0xCD) {
			var H23 = (data[i + 2] << 8) | (data[i + 3]);
			obj.H23 = H23;
			i += 3;
		}
		else {
			var H23 = (data[i + 1]);
			obj.H23 = H23;
			i += 1;
		}
        break
	  case TYPE_LOAD: // Load output state (on/off)
        if ((data[i + 1]) === 0xA2) {
			var LOAD = (data[i + 2] << 8) | (data[i + 3]);
			//obj.LOADSTRING = JSON.stringify(LOAD);
			//obj.LOAD_ASCI = hexToAscii(LOAD); /// TO DO: convert HEX to ASCI
			obj.LOAD = "ON";
			i += 3;
		}
		else {
			var LOAD = (data[i + 2] << 8) | (data[i + 3]) | (data[i + 4]);
			obj.LOAD = "OFF";
			i += 4;
		}
        break
	  case TYPE_I: // Battery current
        if ((data[i + 1]) === 0xCD) {
			var I = (data[i + 2] << 8) | (data[i + 3]);
			I = bin16dec(I);
			obj.I = I;
			i += 3;
		}
		else if ((data[i + 1]) === 0xD1) {
			var I = (data[i + 2] << 8) | (data[i + 3]);
			I = bin16dec(I); // TO DO: convert number to signed 2's complement
			obj.I = I;
			i += 3;
		}	
        break
	  case TYPE_ERR: // Error code
        var ERR = (data[i + 1]);
        obj.ERR = ERR_dict[ERR];
        i += 1;
        break
	  case TYPE_CS: // State of operation
        var CS = (data[i + 1]);
		obj.CS = CS_dict[CS];
        i += 1;
        break
	  case TYPE_IL: // Load current
        if ((data[i + 1]) === 0xCC) {
			var IL = (data[i + 2]);
			IL = bin16dec(IL);
			obj.IL = IL;
			i += 2;
        }
		else if ((data[i + 1]) === 0xCD) {
			var IL = (data[i + 2] << 8) | (data[i + 3]);
			IL = bin16dec(IL);
			obj.IL = IL;
			i += 3;
        }
		break
	  case TYPE_FW: // Firmware version
        var FW = (data[i + 1]);
        obj.FW = FW;
        i += 13;
        break
	  case TYPE_PID: // Product ID
        if ((data[i + 1]) === 0xA6) {
			var PID = (data[i + 2] << 8) | (data[i + 3]) | (data[i + 4]) | (data[i + 5]) | (data[i + 6]) | (data[i + 7]);
			obj.PID = PID; // convert HEX string to ASCII
			i += 7;
		}
        break
	  case TYPE_SER: // Serial number
        var SER = (data[i + 2] << 8) | (data[i + 3]) | (data[i + 4]) | (data[i + 5]) | (data[i + 6]) | (data[i + 7]);
		obj.SER = SER; // convert HEX string to ASCII
		i += 11;
        break 
	  case TYPE_HSDS: // Day sequence number (0..364)
        var HSDS = (data[i + 1]);
		obj.HSDS = HSDS;
		i += 1;
        break 
	  case TYPE_v: // Attributes used by Coupling
        if ((data[i + 1]) === 0xB6) {
			var v = (data[i + 2] << 8) | (data[i + 3]) | (data[i + 4]) | (data[i + 5]) | (data[i + 6]) | (data[i + 7]);
			obj.v = v; // convert HEX string to ASCII
			i += 22;
        }
		break 
	  
	  default: //something is wrong with data
        i = data.length;
        break
    }
  }
  return obj;
}

// TTN decoder function, using the Chirpstack decoder
function Decoder(bytes) {
  return Decode(port, bytes);
}

// Chirpstack decode function
function Decode(fPort, bytes) {
  return DecodePayload(bytes);
}
