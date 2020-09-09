# Crusha Bot

Crusha Bot is a Discord Bot meant to run in a single Discord Server. Members of that Discord Server can use commands to choose values that will be stored in a Google Sheet, one row per member. Crusha Bot is intended to be used by streamers, allowing their patrons to specify features such as the name of their ingame character, but it can be used for other purposes where someone wants to gather values from individual members.

Crusha Bot uses ENV parameters to connect to Discord and the Google Sheet. All other configuration settings are loaded from the Google Sheet, to simplify further configuration. Crusha Bot can be configured to only allow members of a specific rank or higher to specify features. Crusha Bot can also include the rank of each member, allowing the use of further weights. Crusha Bot accepts commands from both channel messages and direct messages.

Note, to support direct messages, the Bot can only support a single Discord Server. If the Bot would support multiple Discord Servers, it would have no way of telling for which Discord Server the direct messages are intended. To support another Discord Server, you must run a separate bot with separate ENV parameters.

## Dependencies

### [Discord.js](https://discord.js.org)

The official Discord API for Node.js. Used for all interaction with Discord.

### [google-spreadsheet](https://theoephraim.github.io/node-google-spreadsheet)

A third party Google Sheets API wrapper for Node.js. Used for reading from and writing to the Google Sheet.

### [dateformat](https://github.com/felixge/node-dateformat)

A function to format date and time. Used for formatting dates.

## Installation

### Create the Discord App and Bot, and invite it to the Server.

* Go to https://discord.com/developers
* Click on "New Application". Provide a name for your Application, and click Create.

* Go to the Bot page. Click on "Add Bot", and click "Yes, do it!".
* Optionally click on the icon to provide your own image for the Bot.
* Set "Public Bot" to off, then click on Save Changes at the bottom of the page.
* Copy the Token and store it. We need to specify this token as the ENV parameter "DISCORD_TOKEN".

* Go to the OAuth2 page. For Scopes, enable "bot".
* For Bot Permissions, enable "View Channels" and "Send Messages".
* If you want the Bot to be able to delete messages, also enable "Manage Messages".
* Copy the link at the bottom of the Scopes section.

* Note: Opening the link invites the Bot to your Discord Server. You do not need to do this right away.
* If you are the owner of the Discord Server, open the link in your browser, and confirm the Bot permissions.
* If someone else is the owner of the Discord Server, send the link to the owner. They must open it and confirm the Bot permissions.

### Create the Google Service Worker.

* Go to https://console.developers.google.com/cloud-resource-manager
* Click on "Create Project". Provide a name for your Project, and click Create.
