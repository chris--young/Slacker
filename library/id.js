/**
 * library/id.js
 *
 * @description: uuid v4
 * @author: Chris Young <cyoung@mobiquityinc.com>
 */

var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

module.exports = function id() {
  var uuid = new Array(36);
  var random = 0;

  for (var index = 0; index < 36; index++) {
    if (index === 8 || index === 13 || index === 18 || index === 23)
      uuid[index] = '-';
    else if (index === 14)
      uuid[14] = '4';
    else {
      if (random <= 0x02)
        random = 33554432 + (Math.random() * 16777216) | 0;
      var r = random & 0xf;
      random = random >> 4;
      uuid[index] = chars[(index === 19) ? (r & 0x3) | 0x8 : r];
    }
  }

  return uuid.join('');
};
