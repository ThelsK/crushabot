# Crusha Bot

Crusha Bot is a Discord Bot meant to run in a single Discord Server. Members of that Discord Server can use commands to choose values that will be stored in a Google Sheet, one row per member. Crusha Bot is intended to be used by streamers, allowing their patrons to specify features such as the name of their ingame character, but it can be used for other purposes where someone wants to gather values from individual members.

Crusha Bot uses ENV parameters to connect to Discord and the Google Sheet. All other configuration settings are loaded from the Google Sheet, to simplify further configuration. Crusha Bot can be configured to only allow members of a specific rank or higher to specify features. Crusha Bot can also include the rank of each member, allowing the use of further weights. Crusha Bot accepts commands from both channel messages and direct messages.

## Dependencies

### [Discord.js](https://discord.js.org)

The official Discord API for Node.js. Used for all interaction with Discord.

### [google-spreadsheet](https://theoephraim.github.io/node-google-spreadsheet)

A third party Google Sheets API wrapper for Node.js. Used for reading from and writing to the Google Sheet.

### [dateformat](https://github.com/felixge/node-dateformat)

A function to format date and time. Used for formatting dates.

## Installation

