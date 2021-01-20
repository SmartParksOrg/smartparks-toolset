window.addEventListener('load', () => {
  runApp();
})

const runApp = async () => {
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

    let decodedJson = runDecoder(portIn, hexPayload);
    let stringifiedJson = JSON.stringify(decodedJson, undefined, 4);
    setResultset(stringifiedJson);
  });
}

function runDecoder(port, payload) {
  let decoder = document.getElementById('decoder').value;

  return Function(
    "let bytes = new Uint8Array(parseHexStringToBytesArray('" + payload + "'));" +
    decoder +
    "return Decode(" + port + ", bytes );"
  )();
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

function copyText(id) {
  /* Get the text field */
  let copyText = document.getElementById(id);

  if (id === 'resultSetCopy'){
    copyText.style.visibility = "visible";
  }

  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  document.execCommand("copy");

    if (id === 'resultSetCopy'){
        copyText.style.visibility = "hidden";
  }
}

// resolve input string to hex, parses array with result and input datatype
function hexFromBaseOrHex(str) {
  if (isHex(str)) {
    return [str.toUpperCase(), 'hexadecimal'];
  } else if (isBase64(str)) {
    return [base64ToHexString(str), 'base 64'];
  }
  return [null, 'invalid'];
}

// validate if string is hex
function isHex(str) {
  return /^[a-fA-F0-9]+$/.test(str);
}

// validate if string is base64,
// !!!! also has false positives for hex !!!!
function isBase64(str) {
  return str.length % 4 === 0 && /^[A-Za-z0-9+/]+[=]{0,3}$/.test(str);
}

// hex string to bytes array
function parseHexStringToBytesArray(str) {
  let result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));

    str = str.substring(2, str.length);
  }

  return result;
}

// bytes array to hex string
function parseBytesArrayToHexString(arr) {
  let result = "";
  let z;

  for (let i = 0; i < arr.length; i++) {
    let str = arr[i].toString(16);

    z = 2 - str.length + 1;
    str = Array(z).join("") + str;

    result += str;
  }

  return result.toUpperCase();
}

// Hex to Base64
function hexToBase64String(str) {
  return btoa(String.fromCharCode.apply(null,
    str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
  );
}

// Base64 to Hex
function base64ToHexString(str) {

  let bin = atob(str.replace(/[ \r|\n]+$/, ""));
  let hex = [];
  for (let i = 0; i < bin.length; ++i) {
    let tmp = bin.charCodeAt(i).toString(16);
    if (tmp.length === 1) tmp = "0" + tmp;
    hex[hex.length] = tmp;
  }
  return hex.join('').toUpperCase();
  // return hex;
}


function setResultset(inp) {
  document.getElementById('resultSet').innerHTML = syntaxHighlight(inp);
  document.getElementById('resultSetCopy').value = inp;
}

function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    var cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}
