var assert = require('assert')

var parse = require(__dirname + '/../library/parse.js')

describe('library/parse.js >', function() {
  describe('parse.slackText()', function() {
    it('parses Slack percent encoded text', function(done) {
      var ascii = ' !"#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~'
      var slackText = '+%21%22%23%24%25%26amp%3B%28%29%2A%2B%2C-.%2F0123456789%3A%3B%26lt%3B%3D%26gt%3B%3F%40ABCDEFGHIJKLMNOPQRSTUVWXYZ%5B%5D%5E_%60abcdefghijklmnopqrstuvwxyz%7B%7C%7D%7E'
      
      assert.equal(ascii, parse.slackText(slackText))
      done()
    })
  })
})
