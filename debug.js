#!/usr/bin/env node
/**
 * Debug REPL for slacker.  Allows you to execute slacker actions in real
 * time for immediate testing feedback
 */
var rl,
  readline = require("readline"),
  _ = require("lodash"),
  bot = require("./bot")
  parse = require("./library/parse")

bot.setup(repl)

/**
 * Set up the readline interface and prompt for the initial input
 */
function repl() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  prompt()
}

/**
 * Prompt for input in an asynchronous loop
 * Interpret the commands from input and display the response
 * TODO Slacker should probably be using *one* interpreter for its server
 *  as well as the debugger
 */
function prompt() {
  rl.question("> slacker ", function (answer) {
    // Keep track of how many commands have run and only prompt again after the last
    var commandLength

    // Pretend that the request came from Slack
    answer = slackEncode(answer)

    // Parse commands like the server does
    commands = parse.commands(answer)
    commandLength = commands.length

    // No commands found, so start over
    if (commandLength < 1) {
      setImmediate(prompt)
    }

    // Cycle through commands, seek actions, and respond
    _.each(commands, function (command) {
      var actionFound = _.find(bot.actions, {name: command.name})

      if (!actionFound) {
        console.error("Action " + command.name + " not found")
        setImmediate(prompt)
      }
      else {
        // Input text must be parsed separately from commands
        actionFound.execute({text: parse.slackText(answer)}, function (actionResponse) {
          // Emit response
          console.log(actionResponse)
          commandLength--

          // If this is the last command run, prompt again
          if (!commandLength) {
            setImmediate(prompt)
          }
        })
      }
    })
  })
}

/**
 * Attempts to encode a string like Slack.com would
 * Slack.com was written in PHP and based on some string examples and my
 * experience, it is running `urlencode(htmlspecialchars(string))`
 *
 * This is a JS approximation
 */
function slackEncode(text) {
  // urlencode
  text = encodeURIComponent(
    text
      // htmlspecialchars
      .replace(/&/g, "&amp;").replace(/</g, "&gt;").replace(/>/, "&lt;")
  )
  .replace(/!/g, "%21").replace(/'/g, "%27").replace(/\(/g, "%28")
  .replace(/\)/, "%29").replace(/\*/g, "%2A").replace(/%20| /g, "+")

  return text
}
