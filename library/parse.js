var slackEncoding = {
  '+': ' ',
  '%26amp%3B': '&',
  '%26lt%3B': '<',
  '%26gt%3B': '>'
}
var slackChars = Object.keys(slackEncoding)

exports.httpParameters = function(parameters) {
  var parameters = parameters.split('&')
  var parametersObject = {}

  for (var x = 0; x < parameters.length; x++) {
    var components = parameters[x].split('=')
    parametersObject[components[0]] = components[1]
  }

  return parametersObject
}

exports.slackText = function(encodedText) {
  var decodedText = ''

  while (encodedText) {
    var charLength = 0
    while (charLength < 10) {
      var encodedChar = encodedText.substring(0, charLength)
      if (~slackChars.indexOf(encodedChar)) {
        decodedText += slackEncoding[encodedChar]
        encodedText = encodedText.substring(charLength, encodedText.length)
        charLength = undefined
      }
      charLength++
    }
    if (charLength) {
      if (encodedText[0] === '%') {
        try {
          decodedText += decodeURIComponent(encodedText.substring(0, 3))
          encodedText = encodedText.substring(3, encodedText.length) 
        } catch (exception) {
          decodedText += encodedText[0]
          encodedText = encodedText.substring(1, encodedText.length)
        }
      } else {
        decodedText += encodedText[0]
        encodedText = encodedText.substring(1, encodedText.length)
      }
    }
  }

  return decodedText
}
