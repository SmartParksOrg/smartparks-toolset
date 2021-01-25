const decoderBaseUrl = 'assets/Decoders/';
let updateDecoder;

window.addEventListener('load', () => {
  let app = runApp();
})

const runApp = async () => {
  // gui setup
  selectPreDefinedPort();
  // load decoder config
  let decoderList = await loadJSON(decoderBaseUrl + 'decoders.json');
  fillDecoderList(decoderList);


  let inputForm = document.getElementById('inputForm');
  inputForm.addEventListener('change', () => {

    let payloadIn = document.getElementById('payloadIn').value;
    payloadIn = payloadIn.replace(/\s/g, "");
    setTranslatedPayload(payloadIn);
    let hexPayloadArray = hexFromBaseOrHex(payloadIn);
    let hexPayload = hexPayloadArray[0];
    document.getElementById('payloadInType').innerText = "Recognized type: " + hexPayloadArray[1];
    let portIn = document.getElementById('portIn').value;

    let variables = fetchStringifiedVariablesObject();

    setDecoder();
    let decodedJson = runDecoder(portIn, hexPayload, variables);
    let stringifiedJson = JSON.stringify(decodedJson, undefined, 4);
    setResultSet(stringifiedJson);
  });
}

function runDecoder(port, payload, variables) {
  let decoder = document.getElementById('decoder').value;

  if (decoder.length === 0) {
    return "No decoder selected yet."
  }
  let resultSet = "Are you sure everything is OK? Your decoder is not defined yet or invalid.";
  try {
    resultSet = Function(
      "let variables = JSON.parse('" + variables + "');" +
      "let bytes = new Uint8Array(parseHexStringToBytesArray('" + payload + "'));" +
      decoder +
      "return Decode(" + port + ", bytes, variables);"
    )();
  } catch (err) {
    resultSet = 'Error in decoder : ' + err;

    //document.getElementById("demo").innerHTML = err.message;
  }
  return resultSet;
}

/*
 input: raw payload
 */
function setTranslatedPayload(payload) {
  let type = hexFromBaseOrHex(payload)[1];
  let translated = '';
  let translatedType = '';
  if (type === 'hexadecimal') {
    translatedType = 'base 64';
    translated = hexToBase64String(payload);
  } else if (type === 'base 64') {
    translatedType = 'hexadecimal';
    translated = base64ToHexString(payload);
  }

  document.getElementById('translatedPayloadInType').innerText = translatedType;
  document.getElementById('translatedPayloadIn').value = translated;
}

function setResultSet(inp) {
  document.getElementById('resultSet').innerHTML = syntaxHighlight(inp);
  document.getElementById('resultSetCopy').value = inp;
}

async function setDecoder() {
  let val = document.getElementById('decoderList').value;
  if (val !== 'custom') {
    if (updateDecoder !== val) {
      let js = await loadJsAsText(decoderBaseUrl + document.getElementById('decoderList').value)
      document.getElementById('decoder').value = js;
      updateDecoder = val;
      document.getElementById('inputForm').dispatchEvent(new Event('change'));
    }
  }
}

function fillDecoderList(decoderList) {
  let select = document.getElementById('decoderList')
  for (let [key, value] of Object.entries(decoderList)) {
    let option = document.createElement('option');
    option.text = key;
    option.value = value;
    select.options.add(option);
  }
}

function fetchStringifiedVariablesObject(){
  let variablesKey1 = document.getElementById('variables-key-1').value;
  let variablesValue1 = document.getElementById('variables-value-1').value;
  let variables = {
    [variablesKey1] : variablesValue1,
  };
  return JSON.stringify(variables);
}
