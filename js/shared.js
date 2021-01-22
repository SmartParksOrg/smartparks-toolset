/*
Returns: Parsed Json loaded from URL
 */
function loadJSON(url) {
	return new Promise((resolve) => {
		const xObj = new XMLHttpRequest();
		xObj.overrideMimeType("application/json");
		xObj.open('GET', url, true);
		xObj.onreadystatechange = function () {
			if (xObj.readyState === 4 && xObj.status === 200) {
				// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
				resolve(JSON.parse(xObj.responseText));
			}
		};
		xObj.send(null);
	});
}

/*
async import js from url as text. Used for filling a text field with a pre defined encoder or decoder
 */
function loadJsAsText(url) {
  return new Promise((resolve) => {
    const xObj = new XMLHttpRequest();
    xObj.overrideMimeType("application/text");
    xObj.open('GET', url, true);
    xObj.onreadystatechange = function () {
      if (xObj.readyState === 4 && xObj.status === 200) {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        resolve(xObj.responseText);
      }
    };
    xObj.send(null);
  });
}

/*
syntax highlight stringified json
 */
function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let cls = 'number';
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

/*
Clipboard Copy the value of the element selected by id.
 */
function copyText(id) {
  /* Get the text field */
  let copyText = document.getElementById(id);

  if (id === 'resultSetCopy') {
    copyText.style.visibility = "visible";
  }

  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  document.execCommand("copy");

  if (id === 'resultSetCopy') {
    copyText.style.visibility = "hidden";
  }
}

/*
resolve input string to hex, parses array with result and input datatype
 */
function hexFromBaseOrHex(str) {
  if (isHex(str)) {
    return [str.toUpperCase(), 'hexadecimal'];
  } else if (isBase64(str)) {
    return [base64ToHexString(str), 'base 64'];
  }
  return [null, 'invalid'];
}

/*
validate if string is hex
 */
function isHex(str) {
  return /^[a-fA-F0-9]+$/.test(str);
}

/*
validate if string is base64,
!!!! also has false positives for hex !!!!
 */
function isBase64(str) {
  return str.length % 4 === 0 && /^[A-Za-z0-9+/]+[=]{0,3}$/.test(str);
}

/*
hex string to bytes array
 */
function parseHexStringToBytesArray(str) {
  let result = [];
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16));

    str = str.substring(2, str.length);
  }

  return result;
}

/*
bytes array to hex string
 */
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

/*
Hex to Base64
 */
function hexToBase64String(str) {
  return btoa(String.fromCharCode.apply(null,
    str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
  );
}

/*
Base64 to Hex
 */
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

