# Crusha BOT

Crusha Bot is a Discord Bot meant to run in a single Discord Server. Members of that Discord Server can use commands to choose values that will be stored in a Google Sheet, one row per member. The Bot is intended to be used by streamers, allowing their patrons to specify features such as the name of their ingame character, but it can be used for other purposes where someone wants to gather values from individual members.

The Bot uses ENV parameters to connect to Discord and the Google Sheet. All other configuration settings are loaded from the Google Sheet, to simplify further configuration. The Bot can be configured to only allow members of a specific rank or higher to specify features. The Bot can also include the rank of each member, allowing the use of further weights. The Bot accepts commands from both channel messages and direct messages.

Note, to support direct messages, the Bot can only support a single Discord Server. If the Bot would support multiple Discord Servers, it would have no way of telling for which Discord Server the direct messages are intended. To support another Discord Server, you must run a separate bot with separate ENV parameters.

## Requirements

You need an environment to run the Bot in. The Bot has been developed in Ubuntu-20.04 running on WSL2. The installation instructions assume you have access to a Linux terminal. It should be possible to run the bot on Windows or Mac, but you will need to figure out yourself how to download and run the source code.

* To install and run the Bot, the following packages must already be installed:
	* Node.js version 12.0.0 or higher
	* NPM

* In addition, you must have the following accounts, and be logged in on those accounts. Free accounts qualify:
	* A Github account
	* A Google account
	* A Discord account

Finally, you must have a Discord server to run the Bot on. You do not need to be the owner of the server. However, you will need the owner's assistance to get the Bot to connect to the server.

## Dependencies

### [Discord.js](https://discord.js.org)

The official Discord API for Node.js. Used for all interaction with Discord.

### [google-spreadsheet](https://theoephraim.github.io/node-google-spreadsheet)

A third party Google Sheets API wrapper for Node.js. Used for reading from and writing to the Google Sheet.

### [dateformat](https://github.com/felixge/node-dateformat)

A function to format date and time. Used for formatting dates.

## Installation

### Create the Discord App and Bot, and invite it to the Server.

* Create the Application:
	* Go to https://discord.com/developers
	* Click on "New Application". Provide a name for your Application, and click Create.

* Create the Bot:
	* Go to the Bot page. Click on "Add Bot", and click "Yes, do it!".
	* Optionally click on the icon to provide your own image for the Bot.
	* Set "Public Bot" to off, then click on Save Changes at the bottom of the page.
	* Copy the Token and store it. Later on, you need to specify this token as the ENV parameter "DISCORD_TOKEN".

* Create an invitation link:
	* Go to the OAuth2 page. For Scopes, enable "bot".
	* For Bot Permissions, enable "View Channels" and "Send Messages".
	* If you want the Bot to be able to delete messages, also enable "Manage Messages".
	* Copy the link at the bottom of the Scopes section.

* Invite the Bot to your Discord Server:
	* Note: Opening the link invites the Bot to your Discord Server. You do not need to do this right away.
	* If you are the owner of the Discord Server, open the link in your browser, and confirm the Bot permissions.
	* If someone else is the owner of the Discord Server, send the link to the owner. They must open it and confirm the Bot permissions.

### Create the Google Service Worker.

* Create a Google Project:
	* Go to https://console.developers.google.com/cloud-resource-manager
	* Click on "Create Project". Provide a name for your Project, and click Create.
	* Click the three dots right of your Project, and click "Settings". Note: You may need to expand "No organization".

* Create a Google Service Worker:
	* Make sure the correct Project is opened, and go to the Service Accounts page.
	* Click on "Create Service Account". Provide a Service account name, and click "Create".
	* For Service account permissions, leave the role blank, and click "Continue".
	* For Grant users access to this service account (optional), leave the rules blank, and click "Done".

* Create credentials for the Google Service Worker:
	* Open the Service account by clicking on the Email link.
	* Click on "Add Key", "Create new key". Select "JSON", then click "Create".
	* This should cause the download of a .json file. Store it. You will need it later on.
	* Note: You are unable to download these credentials later on. If you misplace the file, you need to create a new key.

### Create the Google Worksheet document.

* Method 1: Create a new blank document:
	* Go to https://docs.google.com/spreadsheets
	* Click on Blank to create a new document.
	* Click on "Untitled spreadsheet" to provide a name for your spreadsheet.

* Method 2: Create a copy of the template document:
	* Go to https://docs.google.com/spreadsheets/d/1X60przJGEr8byNhf-mRPQz1inTMp21pQYnovdOXGwVQ
	* Click on File, Make a copy.
	* Provide a name for your spreadsheet, and click "OK".

* Configure the Settings:
	* See Configuration further down this readme for details on how to properly configure your document.

* Allow the Google Service Worker to access the document:
	* When you created the Google Service Worker, you downloaded a .json file. Open that file now.
	* Note: If you have misplaced the file, you need to generate a new key for your Service Worker.
	* Copy the email listed after "client_email". Do not include the quotes.
	* In the Google Spreadsheet, click on "Share". Click on "Add people and groups" and paste the email.
	* Set the rights to "Editor", and disable "Notify people". Click on "Share".

### Set ENV parameters and install the Bot.

* Set the Discord Token ENV parameter:
	* When you created the Discord App and Bot, you stored a token. You need that now.
	* Note: If you have misplaced the token, you can return to the App settings and copy it again.
	* Save the token to the "DISCORD_TOKEN" ENV parameter:
		* ```export DISCORD_TOKEN=copiedtokenvalue```

* Set the Google Service Worker credentials ENV parameters:
	* When you created the Google Service Worker, you downloaded a .json file. Open that file now.
	* Note: If you have misplaced the file, you need to generate a new key for your Service Worker.
	* Copy the email listed after "client_email", up to and including the quotes.
	* Save the email to the "GOOGLE_CLIENT_EMAIL" ENV parameter:
		* ```export GOOGLE_CLIENT_EMAIL=copiedclientemail```
	* Copy the key listed after "private_key", up to and including the quotes.
	* Save the key to the "GOOGLE_PRIVATE_KEY" ENV parameter:
		* ```export GOOGLE_PRIVATE_KEY=copiedprivatekey```

* Set the Google Spreadsheet document ID ENV parameter:
	* Copy the Document ID from the URL of your Google Spreadsheet document (in between "/d/" and "/edit").
	* Save the id to the "GOOGLE_DOCUMENT_ID" ENV parameter:
		* ```export GOOGLE_DOCUMENT_ID=copieddocumentid```

* Optionally set the Bot Configuration worksheet name:
	* On default, the Bot assumes that the Configuration is stored on the Worksheet called "botconfig".
	* If you want to use a different name for the Worksheet, save the name to the "GOOGLE_BOT_CONFIG" ENV parameter:
		* ```export GOOGLE_BOT_CONFIG=worksheetname```

* Install the Bot:
	* Download the code to your computer:
		* ```git clone git@github.com:ThelsK/crushabot.git```
	* Enter the directory to which the code is downloaded:
		* ```cd crushabot```
	* Install the dependencies:
		* ```npm i```
	* Run the bot:
		* ```node .```

## Configuration

The Bot makes use of three different Worksheet tabs:
* One tab is used for general configuration settings.
* One tab is used to define the commands available to users.
* One tab is used to output the values that users enter using the input commands.

If the instructions are unclear, please check the [https://docs.google.com/spreadsheets/d/1X60przJGEr8byNhf-mRPQz1inTMp21pQYnovdOXGwVQ](Crusha Bot Template) for an example.

### General Configuration

On default, the Bot checks for a Worksheet named "botconfig" to find the general configuration. If you want to give this Worksheet a different name, you need to store that name in an ENV parameter, as described in the installation procedure.

The general configuration sheet must have a cell on the first row with the text "property" and another cell on the first row with the text "value". The property column contains the key of the configuration settings, while the value column contains the value that should be assigned to that key.

The configuration settings "serverid", "commandsheet", "outputsheet" and "discordtagcolumn" are mandatory. They must be present with a correct value. The other configuration settings are optional. They can be missing from the property column, or have a blank cell for their value.

* serverid (Mandatory)
	* This is the Server ID for your Discord Server. To find your Server ID, rightclick your Discord Server, and open Serverconfiguration > Widget. 
* inputchannel (Optional)
	* If set, the Bot will only listen to channel messages in that channel, and ignore all other channels. If left blank, the Bot will listen to channel messages in any channel. This does not affect direct messages. Do not include the # character.
* ownertag (Optional)
	* If set, when the Bot runs into a configuration error, it will try to report the error to you as a direct message. If left blank, the error is either replied to a user entering a command, or not reported at all. Note that input errors from users are always replied to the user. Errors are always logged to the console log.
* replyindm (Optional)
	* If set to "TRUE", when a user performs an invalid command, the Bot will reply to the user as a direct message. If left blank, the Bot will reply to channel messages as a channel message, and to direct messages as a direct message. For valid commands, this can be set per command.
* deletemsg (Optional)
	* If set to "TRUE", when a user performs a command as a channel message, the Bot will delete the user's message. If left blank, the Bot will not delete any messages. Direct messages will never be deleted. For valid commands, this can be set per command.
* commandsheet (Mandatory)
	* This is the name of the Worksheet that contains the commands available to users.
* outputsheet (Mandatory)
	* This is the name of the Worksheet to which the Bot will output the values that users enter using the input commands.
* discordtagcolumn (Mandatory)
	* This is the name of the column on the output Worksheet that contains the Discord Tags of the users that put in data.
* discordnamecolumn (Optional)
	* This is the name of the column on the output Worksheet that contains the Discord name that the user uses on your specific Discord Server. This value is automatically updated every hour. If left blank, this data is not stored. This is included to make it easier to recognize users.
* discordrankcolumn (Optional)
	* This is the name of the column on the output Worksheet that contains the name of the highest Discord Role that the user belongs to on your specific Discord Server. This value is automatically updated every hour. If left blank, this data is not stored. This is included so you can apply different weights to different roles.
* rankvaluecolumn (Optional)
	* This is the name of the column on the output Worksheet that contains the value of the highest Discord Role that the user belongs to on your specific Discord Server. This value is automatically updated every hour. If left blank, this data is not stored. Users without roles have a value of 0. Users with only the lowest role have a value of 1, and from there it counts up. Note that adding or deleting a role or bot updates these values. It is therefor recommended to base any weights on the name of the Discord Role, and not the value. The value is only included to make it easier to sort the users.
* lastupdatedcolumn (Optional)
	* This is the name of the column on the output Worksheet that contains the moment that the user last updated their values in descriptive UTC date and time. If left blank, this data is not stored.
* updatedvaluecolumn (Optional)
	* This is the name of the column on the output Worksheet that contains the moment that the user last updated their values in milliseconds since January 1st 1970 Midnight UTC. If left blank, this data is not stored. This value is included to make it easier to sort the users. When displayed as part of a data command, if the type on the Output Worksheet is set to date, it will be displayed as a properly readable date.
* textenabled (Optional)
	* When flags are displayed as part of a data command, flags that are set to true will list this as their value. In addition, this is an acceptable parameter for a data command (case insensitive). if left blank, flags that are set to true will list "On" as their value.
* textdisabled (Optional)
	* When flags are displayed as part of a data command, flags that are set to false will list this as their value. In addition, this is an acceptable parameter for a data command (case insensitive). if left blank, flags that are set to false will list "Off" as their value.
* dateformat (Optional)
	* This is the mask used to display dates. If left blank, "dddd dd mmmm yyyy, HH:MM:ss" is used as the mask. See https://github.com/felixge/node-dateformat for available mask options. Do not include "UTC:" in the mask.

### Available User Commands

The name of the Worksheet that contains the available user commands is specified in the general configuration.

The available user commands sheet must have cells on the first row with the texts "command", "inchannel", "indm", "replyindm", "deletemsg", "type", "minimum", "maximum", "forbidden", "minrank", "reference" and "reply".

Each command must be placed on its own row, with the applicable values in the column with the matching header text. Most values are optional and can be left blank.

* command
	* This is a command that users may perform. All other values on the same row apply to this command. The command must be entered in lowercase on the Worksheet. The command is case insensitive when entered in Discord.
* inchannel
	* If set to "TRUE", this command can be used in channel messages on your Discord Server. If left blank, this command cannot be used in channel messages. Note that if you set an inputchannel, commands are restricted to that inputchannel.
* indm
	* If set to "TRUE", this command can be used in direct messages to the Bot. If left blank, this command cannot be used in direct messages. Note that both inchannel and indm can be set to "TRUE".
* replyindm
	* If set to "TRUE", and this command is used in a channel message on your Discord Server, the Bot will reply as a direct message. If left blank, the Bot will reply as a channel message. This does not affect commands that are used in a direct message.
* deletemsg
	* If set to "TRUE", and this command is used in a channel message on your Discord Server, the Bot will delete the channel message. If left blank, the Bot will not delete the channel message. This does not affect commands that are used in a direct message.
* type
	* This is the type of command. The type must be entered in lowercase, and is mandatory for all commands. The following command types are available:
		* "info": This command only provides static information (included in the reply).
		* "data": This command reports the data that is currently stored for the user entering the command.
		* "flag": This command allows the user to input an on or off value, which will be stored on the Output Worksheet.
		* "text": This command allows the user to input a text value, which will be stored on the Output Worksheet.
		* "number": This command allows the user to input a number value, which will be stored on the Output Worksheet.
		* "date": This command allows the user to input a date and time value.
		* "alias": This command is an alias for another command. Note that an alias can never refer to another alias. Also, the Bot ignores most settings for alias commands, instead using the settings for the command that it refers to.
* minimum
	* For text commands, this specifies the minimum length of the text. If left blank, there is no minimum length.
	* For number commands, this specifies the minimum value of the number. If left blank, there is no minimum value.
	* For date commands, this specifies the earliest possible date that can be provided. If left blank, there is no earliest possible date.
* maximum
	* For text commands, this specifies the maximum length of the text. If left blank, there is no maximum length.
	* For number commands, this specifies the maximum value of the number. If left blank, there is no maximum value.
	* For date commands, this specifies the latest possible date that can be provided. If left blank, there is no latest possible date.
* forbidden
	* For text commands, these characters cannot be included in the text. The characters do not need to be separated. If left blank, there are no forbidden characters.
	* For number commands, if set to "TRUE", the value must be a round number. If left blank, the value may include decimals.
* minrank
	* If set, only users with this role or a higher role may perform this command. If left blank, any user may perform this command.
* reference
	* For data, flag, text and number commands, this is the name of the column on the output Worksheet to which this data will be stored.
	* For alias command, this is the command that the alias refers to. Remember that it cannot refer to another alias.
* reply
	* When the Bot replies to the command, it will start the reply with this text.

### Available User Commands

The name of the Worksheet that contains the available user commands is specified in the general configuration.

The available user commands sheet must have cells on the first row with the texts "command", "inchannel", "indm", "replyindm", "deletemsg", "type", "minimum", "maximum", "forbidden", "minrank", "reference" and "reply".

Each command must be placed on its own row, with the applicable values in the column with the matching header text. Most values are optional and can be left blank.

