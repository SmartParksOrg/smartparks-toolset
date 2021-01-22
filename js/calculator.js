window.addEventListener('load', () => {
	// TODO: IMPORT JSON BATTERY PROFILE
	// TODO: EXPORT JSON BATTERY PROFILE
	runCalculator();
})

const runCalculator = async () => {
	// load sensor config
	let sensorConfiguration = await loadJSON('assets/Calculator/sensor_configuration.json');
	fillSensorTypeOptions(sensorConfiguration);

	// constants
	let batteryVoltage = 3.6

	let inputForm = document.getElementById('inputForm');
	inputForm.addEventListener('change', () => {
		// GUI setup
		showFormOnSensorSelect();

		combinePortStatusInput();
		combinePortGPSInput();
		combineGPSFixFixedTimeInput();

		// GPSFixTime
		let GPSFixTimeSector = document.getElementById('GPSFixTimeSector').value;
		hideOnGPSFixTimeSector(GPSFixTimeSector);
		document.getElementById('batteryV').value = batteryVoltage;

		// interactively select sensor
		let sensorType = document.getElementById('sensorType').value;
		let selectedSensor = sensorConfiguration[sensorType];

		// interactively calculate and print resultSet
		let batteryCapacity = calcBatteryMAH(selectedSensor);
		let consumptionPerHour = calcConsumptionPerHour(selectedSensor, batteryVoltage);
		calcTheoreticalBatteryLife(batteryCapacity, consumptionPerHour, batteryVoltage);
		calcPredictedBatteryLife(batteryCapacity, consumptionPerHour, batteryVoltage);
	})
}

function combinePortStatusInput() {
	document.getElementById('resetPortStatus').addEventListener('click', () => {
		document.getElementById('portStatus').value = 30;
		document.getElementById('portStatusRange').value = 30;
		document.getElementById('inputForm').dispatchEvent(new Event('change'));
	});

	document.getElementById('portStatus').addEventListener('change', () => {
		document.getElementById('portStatusRange').value = document.getElementById('portStatus').value;
	});
	document.getElementById('portStatusRange').addEventListener('change', () => {
		document.getElementById('portStatus').value = document.getElementById('portStatusRange').value;
	});
}

function combinePortGPSInput() {
	document.getElementById('resetPortGPS').addEventListener('click', () => {
		document.getElementById('portGPS').value = 30;
		document.getElementById('portGPSRange').value = 30;
		document.getElementById('inputForm').dispatchEvent(new Event('change'));
	});

	document.getElementById('portGPS').addEventListener('change', () => {
		document.getElementById('portGPSRange').value = document.getElementById('portGPS').value;
	});
	document.getElementById('portGPSRange').addEventListener('change', () => {
		document.getElementById('portGPS').value = document.getElementById('portGPSRange').value;
	});
}

function combineGPSFixFixedTimeInput() {
	document.getElementById('resetGPSFixFixedTime').addEventListener('click', () => {
		document.getElementById('GPSFixFixedTime').value = 30;
		document.getElementById('GPSFixFixedTimeRange').value = 30;
		document.getElementById('inputForm').dispatchEvent(new Event('change'));
	});

	document.getElementById('GPSFixFixedTime').addEventListener('change', () => {
		document.getElementById('GPSFixFixedTimeRange').value = document.getElementById('GPSFixFixedTime').value;
	});
	document.getElementById('GPSFixFixedTimeRange').addEventListener('change', () => {
		document.getElementById('GPSFixFixedTime').value = document.getElementById('GPSFixFixedTimeRange').value;
	});
}

function calcBatteryMAH(selectedSensor) {
	let batteryMAH = selectedSensor.batteryCapacity * selectedSensor.batteryCount;
	printBatteryMAH(batteryMAH);
	return batteryMAH;
}

function loraConsumptionPerMessage() {
	// constants for milli seconds on lora per message type
	let loraTimePerType = {
		'SF7': 56,
		'SF8': 102,
		'SF9': 185,
		'SF10': 370,
		'SF11': 741,
		'SF12': 1320
	}
	let loraType = document.getElementById('loraType').value;
	let loraTime = loraTimePerType[loraType];
	return (loraTime / 1000 * 40 * 3) / 3600;
}

function GPSConsumptionPerFix() {
	if (document.getElementById('GPSFixTimeSector').value === "FIXED") {
		return ((document.getElementById('GPSFixFixedTime').value * 1000) / 1000 * 20) / 3600 * 3.6;
	}
	// assert adjusted
	let gpsInterval = (document.getElementById('portGPS').value);

	// calculate adjusted time
	let gpsAdjustedTime = (0.146 * gpsInterval + 5.0205);
	// set adjusted time bounds
	if (gpsAdjustedTime > 60) {
		gpsAdjustedTime = 60
	}
	if (gpsAdjustedTime < 5) {
		gpsAdjustedTime = 5;
	}

	return (gpsAdjustedTime * 20) / 3600 * 3.6;
}

function calcConsumptionPerHour(selectedSensor, batteryVoltage) {
	let baseConsumptionInMilliWattHour = (3600 * 0.015) / 3600 * batteryVoltage;
	let loraConsumption = loraConsumptionPerMessage();
	let gpsConsumption = GPSConsumptionPerFix();

	let port12Interval = document.getElementById('portStatus').value;
	let port1Interval = document.getElementById('portGPS').value;

	let port12PerHour = 0;
	if (port12Interval > 0) {
		port12PerHour = (60 / port12Interval) * loraConsumption;
	}
	let port1PerHour = 0;
	if (port1Interval > 0) {
		port1PerHour = (60 / port1Interval) * (loraConsumption + gpsConsumption);
	}

	let totalConsumptionPerHour = baseConsumptionInMilliWattHour + port12PerHour + port1PerHour;

	printConsumption(totalConsumptionPerHour);
	return totalConsumptionPerHour;
}

function calcTheoreticalBatteryLife(batteryCapacity, consumptionPerHour, voltage) {
	let theoreticalBatteryLifeInHours = batteryCapacity * voltage / consumptionPerHour;
	printTheoreticalBatteryLife(theoreticalBatteryLifeInHours);
}

function calcPredictedBatteryLife(batteryCapacity, consumptionPerHour, voltage) {
	let theoreticalBatteryLifeInHours = batteryCapacity * voltage / consumptionPerHour;
	let predictedBatteryLifeInHours = 0.9 * theoreticalBatteryLifeInHours;
	printPredictedBatteryLife(predictedBatteryLifeInHours);
}

function printBatteryMAH(mAh) {
	document.getElementById('batteryMAH').value = mAh;
}

function printConsumption(consumption) {
	document.getElementById('consumptionPH').value = consumption.toFixed(6);
}

function printTheoreticalBatteryLife(tMaxLifeHours) {
	document.getElementById('tMaxLifeHours').value = tMaxLifeHours.toFixed(0);
	document.getElementById('tMaxLifeDays').value = (tMaxLifeHours / 24).toFixed(1);
	document.getElementById('tMaxLifeMonths').value = (tMaxLifeHours / 24 / 30).toFixed(1);
	document.getElementById('tMaxLifeYears').value = (tMaxLifeHours / 24 / 365).toFixed(2);
}

function printPredictedBatteryLife(pLifeHours) {
	document.getElementById('pLifeHours').value = pLifeHours.toFixed(0);
	document.getElementById('pLifeDays').value = (pLifeHours / 24).toFixed(1);
	document.getElementById('pLifeMonths').value = (pLifeHours / 24 / 30).toFixed(1);
	document.getElementById('pLifeYears').value = (pLifeHours / 24 / 365).toFixed(2);
}

function hideOnGPSFixTimeSector(val) {
	let field = document.getElementById('GPSFixFixedTimeField');
	field.hidden = val === "ADJUSTED";
}

function showFormOnSensorSelect() {
	if (document.getElementById('sensorType').value !== null) {
		document.getElementById('showOnSensorType1').hidden = false;
		document.getElementById('showOnSensorType2').hidden = false;
	}
}

function fillSensorTypeOptions(configuration) {
	let select = document.getElementById('sensorType')
	for (let [key, value] of Object.entries(configuration)) {
		let option = document.createElement('option');
		let rechargeable = value.batteryRechargeable ? "Rechargeable" : "Primary";
		option.text = value.sensorName + " " + rechargeable + " (" + value.batteryCount + " x " + value.batteryType + ")";
		option.value = key;
		select.options.add(option);
	}
}


