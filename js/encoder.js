const encoderBaseUrl = 'assets/Encoders/';
let updateEncoder;
let updateInputJson;

window.addEventListener('load', () => {
  let app = runApp();
})
const runApp = async () => {
  // gui setup
  selectPreDefinedPort();

  // load predefined encoder json
  let predefinedJson = await loadJSON(encoderBaseUrl + 'predefinedSettings/predefined.json');
  fillPredefinedJson(predefinedJson);

  // load encoder config
  let encoderList = await loadJSON(encoderBaseUrl + 'encoders.json');
  fillEncoderList(encoderList);


  let inputForm = document.getElementById('inputForm');
  inputForm.addEventListener('change', () => {
    setPredefinedJson();
    setEncoder();

    let inputJson = getInput();
    let portIn = document.getElementById('portIn').value;

    let encoded = runEncoder(portIn, inputJson);
    setResultSet(encoded);
  });
}

function getInput() {
  let inputJson = document.getElementById('inputJson').value;
  if (inputJson.length === 0) {
    return '{}';
  }
  return inputJson.replace(/\n/g, " ");
}

function runEncoder(port, json) {
  let encoder = document.getElementById('encoder').value;

  if (encoder.length === 0) {
    return "No encoder selected yet."
  }
  let resultSet = "Are you sure everything is OK? Your encoder is not defined yet or invalid.";
  try {
    resultSet = Function(
      "let object = JSON.parse('" + json + "');" +
      encoder +
      "return Encode(" + port + ", object);"
    )();
  } catch (err) {
    resultSet = 'Error in encoder : ' + err;
  }
  return parseBytesArrayToHexString(resultSet);
}

async function setEncoder() {
  let val = document.getElementById('encoderList').value;
  if (val !== 'custom') {
    if (updateEncoder !== val) {
      let js = await loadJsAsText(encoderBaseUrl + document.getElementById('encoderList').value)
      document.getElementById('encoder').value = js;
      updateEncoder = val;
      document.getElementById('inputForm').dispatchEvent(new Event('change'));
    }
  }
}

async function setPredefinedJson() {
  let val = document.getElementById('predefinedJsonList').value;
  if (val !== 'custom') {
    if (updateInputJson !== val) {
      let js = await loadJsAsText(encoderBaseUrl + 'predefinedSettings/' + document.getElementById('predefinedJsonList').value)
      js = JSON.parse(js);
      js = JSON.stringify(js, undefined, 4)
      document.getElementById('inputJson').value = js;
      updateInputJson = val;
      document.getElementById('inputForm').dispatchEvent(new Event('change'));
    }
  }
}

function fillEncoderList(encoderList) {
  let select = document.getElementById('encoderList')
  for (let [key, value] of Object.entries(encoderList)) {
    let option = document.createElement('option');
    option.text = key;
    option.value = value;
    select.options.add(option);
  }
}

function fillPredefinedJson(predefinedList) {
  let select = document.getElementById('predefinedJsonList')
  for (let [key, value] of Object.entries(predefinedList)) {
    let option = document.createElement('option');
    option.text = key;
    option.value = value;
    select.options.add(option);
  }
}

function setResultSet(inp) {
  document.getElementById('hexPayloadOut').value = inp;
  if (isHex(inp)) {
    document.getElementById('base64PayloadOut').value = hexToBase64String(inp);
  }
}
