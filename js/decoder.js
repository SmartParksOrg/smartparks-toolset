const decoderBaseUrl = 'assets/Decoders/';
let updateDecoder;

window.addEventListener('load', () => {
  runApp();
})

const runApp = async () => {
  // gui setup
  selectPreDefinedPort();
  // load decoder config
  let decoderList = await loadJSON(decoderBaseUrl + 'decoders.json');
  fillDecoderList(decoderList);


  let inputForm = document.getElementById('inputForm');
  inputForm.addEventListener('change', () => {


    /*
    let base64Value = 'yhmyg55GDwBDPDMjAABpJIhf';
    let hexString = "ca19b2839e460f00433c332300006924885f";
     */

    let payloadIn = document.getElementById('payloadIn').value;
    setTranslatedPayload(payloadIn);
    let hexPayloadArray = hexFromBaseOrHex(payloadIn);
    let hexPayload = hexPayloadArray[0];
    document.getElementById('payloadInType').innerText = "Recognized type: " + hexPayloadArray[1];
    let portIn = document.getElementById('portIn').value;

    setDecoder();
    let decodedJson = runDecoder(portIn, hexPayload);
    let stringifiedJson = JSON.stringify(decodedJson, undefined, 4);
    setResultSet(stringifiedJson);
  });
}

function runDecoder(port, payload) {
  let decoder = document.getElementById('decoder').value;

  if (decoder.length === 0) {
    return "No decoder selected yet."
  }
  let resultSet = "Are you sure everything is OK? Your decoder is not defined yet or invalid.";
  try {
    resultSet = Function(
      "let bytes = new Uint8Array(parseHexStringToBytesArray('" + payload + "'));" +
      decoder +
      "return Decode(" + port + ", bytes );"
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

function selectPreDefinedPort() {
  let buttonCount = document.getElementsByClassName('preDefinePort').length;
  for (let i = 0; i < buttonCount; i++) {
    document.getElementsByClassName('preDefinePort').item(i).addEventListener('click', () => {
      document.getElementById('portIn').value = document.getElementsByClassName('preDefinePort').item(i).value;
      document.getElementById('inputForm').dispatchEvent(new Event('change'));
    });
  }
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
