# Crusha Bot

Crusha Bot is a Discord Bot meant to run in a single Discord Server. Members of that Discord Server can use commands to choose values that will be stored in a Google Sheet, one row per member. The Bot is intended to be used by streamers, allowing their patrons to specify features such as the name of their ingame character, but it can be used for other purposes where someone wants to gather values from individual members.

The Bot uses ENV parameters to connect to Discord and the Google Sheet. All other configuration settings are loaded from the Google Sheet, to simplify further configuration. The Bot can be configured to only allow members of specific ranks to specify features. The Bot can also include a weight based on the rank or ranks of each member, which can be used to affect random selection chances. The Bot accepts commands from both channel messages and direct messages.

Most of the configuration and all of the output is stored in a Google Spreadsheet, making it easy for people to see or alter the configuration and output data. A template is included, which you can copy and use as the basis of your own configuration and output. This template includes buttons to randomly pick users from your output data based on their weight value.

Note, to support direct messages, the Bot can only support a single Discord Server. If the Bot would support multiple Discord Servers, it would have no way of telling for which Discord Server the direct messages are intended. To support another Discord Server, you must run a separate bot with separate ENV parameters.

## _Requirements_

You need an environment to run the Bot in. The Bot has been developed in Ubuntu-20.04 running on WSL2. The installation instructions assume you have access to a Linux terminal. It should be possible to run the bot on Windows or Mac, but you will need to figure out yourself how to download and run the source code.

* To install and run the Bot, the following packages must already be installed:
	* Node.js version 12.0.0 or higher
	* NPM

* In addition, you must have the following accounts, and be logged in on those accounts. Free accounts qualify:
	* A Github account
	* A Google account
	* A Discord account

* Finally, you must have a Discord server to run the Bot on. You do not need to be the owner of the server. However, you will need the owner's assistance to get the Bot to connect to the server.

## _Dependencies_

### [Discord.js](https://discord.js.org)

The official Discord API for Node.js. Used for all interaction with Discord.

### [google-spreadsheet](https://theoephraim.github.io/node-google-spreadsheet)

A third party Google Sheets API wrapper for Node.js. Used for reading from and writing to the Google Spreadsheet.

### [dateformat](https://github.com/felixge/node-dateformat)

A function to format date and time. Used for formatting dates.

## _Installation_

### Create the Discord App and Bot, and invite it to the Server.

* Create the Application:
	* Go to https://discord.com/developers
	* Click on "New Application". Provide a name for your Application, and click Create.

* Create the Bot:
	* Go to the Bot page. Click on "Add Bot", and click "Yes, do it!".
	* Optionally click on the icon to provide your own image for the Bot.
	* Set "Public Bot" to off, then click on Save Changes at the bottom of the page.
	* Copy the Token and store it. Later on, you need to specify this token as the ENV parameter "CRUSHABOT_DISCORD_TOKEN".

* Create an invitation link:
	* Go to the OAuth2 page. For Scopes, enable "bot".
	* For Bot Permissions, enable "View Channels" and "Send Messages".
	* If you want the Bot to be able to delete messages, also enable "Manage Messages".
	* Copy the link at the bottom of the Scopes section.
	* Go to the Bot page. Enable "Presence Intent" and "Server Members Intent".

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

* Enable the Google Sheets API:
	* Click on "Google APIs" in the top left corner of the page.
	* Click on "Enable APIs and Services", click on "Google Sheets API", and click on Enable.

### Create the Google Spreadsheet document.

You can either create a new spreadsheet from scratch and fill in everything yourself, or create a copy of the template document and adjust it to your needs. The latter is recommended.

* Method 1: Create a new blank document:
	* Go to https://docs.google.com/spreadsheets
	* Click on Blank to create a new document.
	* Click on "Untitled spreadsheet" to provide a name for your spreadsheet.

* Method 2: Create a copy of the template document (recommended):
	* Go to https://docs.google.com/spreadsheets/d/1jx2pXn8Ew3sLKl4FhkOA6A5Jkc8q4-5g4KjrdAAjKqE
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
	* Save the token to the "CRUSHABOT_DISCORD_TOKEN" ENV parameter:
		* ```export CRUSHABOT_DISCORD_TOKEN=copiedtokenvalue```

* Set the Google Service Worker credentials ENV parameters:
	* When you created the Google Service Worker, you downloaded a .json file. Open that file now.
	* Note: If you have misplaced the file, you need to generate a new key for your Service Worker.
	* Copy the email listed after "client_email", up to and including the quotes.
	* Save the email to the "CRUSHABOT_GOOGLE_CLIENT_EMAIL" ENV parameter:
		* ```export CRUSHABOT_GOOGLE_CLIENT_EMAIL=copiedclientemail```
	* Copy the key listed after "private_key", up to and including the quotes.
	* Save the key to the "CRUSHABOT_GOOGLE_PRIVATE_KEY" ENV parameter:
		* ```export CRUSHABOT_GOOGLE_PRIVATE_KEY=copiedprivatekey```

* Set the Google Spreadsheet document ID ENV parameter:
	* Copy the Document ID from the URL of your Google Spreadsheet document (in between "/d/" and "/edit").
	* Save the id to the "CRUSHABOT_GOOGLE_DOCUMENT_ID" ENV parameter:
		* ```export CRUSHABOT_GOOGLE_DOCUMENT_ID=copieddocumentid```

* Optionally set the Bot Configuration worksheet name:
	* On default, the Bot assumes that the Configuration is stored on the Worksheet called "botconfig".
	* If you want to use a different name for the Worksheet, save the name to the "CRUSHABOT_GOOGLE_BOT_CONFIG" ENV parameter:
		* ```export CRUSHABOT_GOOGLE_BOT_CONFIG=worksheetname```

* Install the Bot:
	* Download the code to your computer:
		* ```git clone git@github.com:ThelsK/crushabot.git```
	* Enter the directory to which the code is downloaded:
		* ```cd crushabot```
	* Install the dependencies:
		* ```npm i```
	* Run the bot:
		* ```node .```

## _Configuration_

The Bot makes use of three different Worksheet tabs:
* One tab is used for general configuration settings.
* One tab is used to define the commands available to users.
* One tab is used to output the values that users enter using the input commands.

If the instructions are unclear, please check the [https://docs.google.com/spreadsheets/d/1jx2pXn8Ew3sLKl4FhkOA6A5Jkc8q4-5g4KjrdAAjKqE](Crusha Bot Template) for an example.

Note: Some settings require you to provide a Server ID, Role ID, Channel ID or User ID. To access IDs, you need to enable Developer mode inside your Discord client. Go to Settings, Appearance, and scroll to the bottom to enable Developer mode. Once enabled, you can rightclick Channels and Users to get their ID. Server and Role IDs can be found in the Server settings.

### General Configuration

On default, the Bot checks for a Worksheet named "botconfig" to find the general configuration. If you want to give this Worksheet a different name, you need to store that name in an ENV parameter, as described in the installation procedure.

The general configuration sheet must have a cell on the first row with the text "property" and another cell on the first row with the text "value". The property column contains the key of the configuration settings, while the value column contains the value that should be assigned to that key.

The configuration settings "serverid", "ranksheet", "commandsheet", "outputsheet", "allothersrankid", "leftserverrankid" and "discordidcolumn" are mandatory. They must be present with a correct value. The other configuration settings are optional. They can be missing from the property column, or have a blank cell for their value.

* serverid (Mandatory)
	* This is the Server ID for your Discord Server. To find your Server ID, rightclick your Discord Server, and open Serverconfiguration > Widget. 
* inputchannelid (Optional)
	* If set, the Bot will only listen to channel messages in the channel with this Channel ID, and ignore all other channels. If left blank, the Bot will listen to channel messages in any channel. This does not affect direct messages.
* errorchannelid (Optional)
	* If set, when the Bot runs into a configuration error, it will try to report the error to the channel with this Channel ID. If both this and erroruserid are left blank, the error is either replied to a user entering a command, or not reported at all. Note that input errors from users are always replied to the user. Errors are always logged to the console log.
* erroruserid (Optional)
	* If set, when the Bot runs into a configuration error, it will try to report the error to the user with this User ID. If both this and errorchannelid are left blank, the error is either replied to a user entering a command, or not reported at all. Note that input errors from users are always replied to the user. Errors are always logged to the console log.
* nocommandinchannel (Optional)
	* If set to "TRUE", when a user performs an invalid command starting with "!" as a channel message, the Bot will reply to the user that the command is invalid. If left blank, the Bot will not reply anything.
* nocommandindm (Optional)
	* If set to "TRUE", when a user performs an invalid command as a direct message, the Bot will reply to the user that the command is invalid. If left blank, the Bot will not reply anything.
* replyindm (Optional)
	* If set to "TRUE", when a user performs an invalid command starting with "!" as a channel message, the Bot will reply to the user as a direct message. If left blank, the Bot will reply to channel messages as a channel message. For valid commands, this can be set per command. Note that this setting has no effect when nocommandinchannel is not set to "TRUE".
* deletemsg (Optional)
	* If set to "TRUE", when a user performs an invalid command starting with "!" as a channel message, the Bot will delete the user's message. If left blank, the Bot will not delete any messages. Direct messages will never be deleted. For valid commands, this can be set per command.
* ranksheet (Mandatory)
	* This is the name of the Worksheet that contains the ranks upon which users are filtered.
* commandsheet (Mandatory)
	* This is the name of the Worksheet that contains the commands available to users.
* outputsheet (Mandatory)
	* This is the name of the Worksheet to which the Bot will output the values that users enter using the input commands.
* allothersrankid (Mandatory)
	* This is the fictional Rank ID on the rank Worksheet that is used for users that do not match any of the other ranks.
* leftserverrankid (Mandatory)
	* This is the fictional Rank ID on the rank Worksheet that is used for users that are not connected to the server.
* discordidcolumn (Mandatory)
	* This is the name of the column on the output Worksheet that contains the Discord ID of a user that put in data.
* discordtagcolumn (Optional)
	* This is the name of the column on the output Worksheet that contains the Discord Tag of a user that put in data. This value is automatically updated every hour. If left blank, this data is not stored. This is included to make it easier to recognize users.
* discordnamecolumn (Optional)
	* This is the name of the column on the output Worksheet that contains the Discord Name that the user uses on your specific Discord Server. This value is automatically updated every hour. If left blank, this data is not stored. This is included to make it easier to recognize users.
* discordrankcolumn (Optional)
	* This is the name of the column on the output Worksheet that contains the name of the highest Discord Role that the user belongs to on your specific Discord Server. This value is automatically updated every hour. If left blank, this data is not stored. This is included so you can apply different weights to different roles.
* lastupdatedcolumn (Optional)
	* This is the name of the column on the output Worksheet that contains the moment that the user last updated their values in descriptive UTC date and time. If left blank, this data is not stored.
* updatedvaluecolumn (Optional)
	* This is the name of the column on the output Worksheet that contains the moment that the user last updated their values in milliseconds since January 1st 1970 Midnight UTC. If left blank, this data is not stored. This value is included to make it easier to sort the users by activity. When displayed as part of a data command, if the type on the Output Worksheet is set to date, it will be displayed as a properly readable date.
* discordrankcolumn (Optional)
	* This is the name of the column on the output Worksheet that contains the Rank ID of the highest matching rank found on the Ranks worksheet. This value is automatically updated every hour. If left blank, this data is not stored.
* ranknamecolumn (Optional)
	* This is the name of the column on the output Worksheet that contains the Rank Name of the highest matching rank found on the Ranks worksheet. This value is automatically updated every hour. If left blank, this data is not stored. This is included to make it easier to recognize ranks.
* rankweightcolumn (Optional)
	* This is the name of the column on the output Worksheet that contains the Rank Weight of the highest matching rank found on the Ranks worksheet. This value is automatically updated every hour. If left blank, this data is not stored. When copying the template, this value is used to determine the likelyhood of this row being randomly selected on the roll worksheet.
* textenabled (Optional)
	* When flags are displayed as part of a data command, flags that are set to true will list this as their value. In addition, this is an acceptable parameter for a data command (case insensitive). if left blank, flags that are set to true will list "On" as their value.
* textdisabled (Optional)
	* When flags are displayed as part of a data command, flags that are set to false will list this as their value. In addition, this is an acceptable parameter for a data command (case insensitive). if left blank, flags that are set to false will list "Off" as their value.
* dateformat (Optional)
	* This is the mask used to display dates. If left blank, "dddd dd mmmm yyyy, HH:MM:ss" is used as the mask. See https://github.com/felixge/node-dateformat for available mask options. Do not include "UTC:" in the mask.
* rollsheet (Optional, Template only)
	* This value is not used by the bot at all. When copying the template, this value is used by the Roll worksheet to determine to which worksheet the results of the Roll buttons will be posted.
* entriestolist (Optional, Template only)
	* This value is not used by the bot at all. When copying the template, this value is used by the Roll worksheet to determine how many entries to list as part of a single roll.
* allowduplicates (Optional, Template only)
	* This value is not used by the bot at all. When copying the template, this value is used by the Roll worksheet to determine if a single entry can be selected multiple times during a single roll.

### Available User Ranks

The name of the Worksheet that contains the available user ranks is specified in the general configuration.

The available user commands sheet must have cells on the first row with the texts "rankid", "rank", "weight" and "command".

Each rank must be placed on its own row, with the applicable values in the column with the matching header text. The ranks must be listed from most to least important. If a user matches multiple ranks in the list, that user uses the values of the rank listed highest on the worksheet, even if other ranks have a higher weight or command value. Note that you only need to include ranks with a unique weight and command value. Ranks that don't give their users any privileges can be omitted.

You must also include two special ranks, with the ids listed for "allothersrankid" and "leftserverrankid". These two fictional ranks are used for people that do not match any of the other ranks and people that are not connected to the server. The position of these two ranks in the list does not matter. They are skipped by anyone that matches any of the other available ranks.

* rankid
	* This is the ID of the Rank (or the fake ids listed for "allothersrankid" and "leftserverrankid"), that is compared to the Ranks that each user has.
* rank
	* This is a description of the rank. If "ranknamecolumn" is set on the configuration worksheet, then this description will be included in that column on the output worksheet. This value does not need to match the name of the rank on your Discord Server. This is included to make it easier to recognize ranks.
* weight
	* This is the weight of the rank. If "rankweightcolumn" is set on the configuration worksheet, then this value will be included in that column on the output worksheet. When copying the template, this value is used to determine the likelyhood of users with this rank being randomly selected on the roll worksheet.
* command
	* This value indicates which commands users with this rank are allowed to use. See the "minrank" setting for Available User Commands below for details.

### Available User Commands

The name of the Worksheet that contains the available user commands is specified in the general configuration.

The available user commands sheet must have cells on the first row with the texts "command", "inchannel", "indm", "replyindm", "deletemsg", "type", "minimum", "maximum", "forbidden", "minrank", "reference" and "reply".

Each command must be placed on its own row, with the applicable values in the column with the matching header text. Most values are optional and can be left blank.

* command
	* This is a command that users may perform. All other values on the same row apply to this command. The command must be entered in lowercase on the Worksheet. The command is case insensitive when entered in Discord.
* inchannel
	* If set to "TRUE", this command can be used in channel messages on your Discord Server. If left blank, this command cannot be used in channel messages. Note that if you set an inputchannel in the general configuration, commands are restricted to that inputchannel.
* indm
	* If set to "TRUE", this command can be used in direct messages to the Bot. If left blank, this command cannot be used in direct messages. Note that both inchannel and indm can be set to "TRUE".
* replyindm
	* If set to "TRUE", and this command is used in a channel message on your Discord Server, the Bot will reply as a direct message. If left blank, the Bot will reply as a channel message. This does not affect commands that are used in a direct message.
* deletemsg
	* If set to "TRUE", and this command is used in a channel message on your Discord Server, the Bot will delete the channel message. If left blank, the Bot will not delete the channel message. This does not affect commands that are used in a direct message.
* type
	* This is the type of command. The type must be entered in lowercase, and is mandatory for all commands. The following command types are available:
		* "info": This command only provides static information (included in the reply column).
		* "data": This command reports the data that is currently stored for the user entering the command.
		* "flag": This command allows the user to input an on or off value, which will be stored on the Output Worksheet.
		* "text": This command allows the user to input a text value, which will be stored on the Output Worksheet.
		* "number": This command allows the user to input a number value, which will be stored on the Output Worksheet.
		* "date": This command allows the user to input a date and time value, which will be stored on the Output Worksheet.
		* "alias": This command is an alias for another command. Note that an alias can never refer to another alias. Also, the Bot ignores all settings except command, type and reference for alias commands, instead using the settings for the command that it refers to.
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
	* If set, only users with a rank that has a command value (on the Ranks worksheet) equal to or higher than this value may perform this command. If left blank, any user may perform this command.
* reference
	* For flag, text, number and date commands, this is the name of the column on the output Worksheet to which this data will be stored.
	* For alias command, this is the command that the alias refers to. Remember that it cannot refer to another alias.
* reply
	* When the Bot replies to the command, it will start the reply with this text.

### Value Output

The name of the Worksheet that contains the output is specified in the general configuration.

The value output sheet must have cells on the first row with the texts matching the values of the "discordidcolumn", "discordtagcolumn", "discordnamecolumn", "lastupdatedcolumn", "updatedvaluecolumn", "discordrankcolumn", "ranknamecolumn" and "rankweightcolumn" configuration settings, except for those that are blank or missing. There must also be cells on the first row with the texts matching the references of the flag, text, number and date commands.

Each user will be assigned its own row, with their Discord ID stored in the column with the "discordidcolumn" value. This column is the primary key column. All other values on the same row are linked to that Discord ID. Users are automatically added when they first specify any value (using a flag, text, number or date command).

Every hour, the Bot checks all users on the sheet, and updates their Discord Tag, Discord Name, Rank ID, Rank Name and Rank Weight. If the user is no longer found on the Server, the "leftserver" Rank ID, Rank Name and Rank Weight are applied instead. The Bot never automatically deletes users from the Worksheet.

Keep in mind that if you specify a minimum rank for certain commands, these values remain, even if the user is demoted and no longer has sufficient rank, or if the user is removed from the server. However, the Rank ID, Rank Name and Rank Weight are updated to the "allothers" or "leftserver" ranks. If you want to exclude these values, either manually delete them, or filter based on their Rank Weight. If you use the Roll buttons from the template, rows with a Rank Weight of 0 are ignored.

Two rows hold settings that are used for displaying the values when a user performs a data command to see their stored values. These rows must have the texts "type" and "description" in the column with the "discordidcolumn" value. The "type" row determines in what format the value in that column is displayed (flag, text, number or date). If left blank, the value in that column is not displayed. The "description" row holds the label for the value, so the user can see which value is what. Note that these rows do not need to be near the top of the Worksheet.

### Roll Worksheet (Template only)

When copying the template, your spreadsheet includes a roll worksheet. This can be used to quickly select one or more entries from the output worksheet. Note that this worksheet is not used by the bot at all. Instead, the roll worksheet has its own code, that can be accessed through Tools, Script editor. This code is used when clicking the buttons.

The script uses the "outputsheet", "discordidcolumn", "rankweightcolumn", "rollsheet", "entriestolist" and "allowduplicates" values from the Configuration tab. Each of the buttons checks a different column on the Output sheet. Only the rows where the value in that column are set to TRUE are eligible for selection. The Rank Weight value determines the likelyhood that a certain row is selected. For example, a row with a Rank Weight of 10 is twice as likely to get selected as a row with a Rank Weight of 5.

If you name the Configuration worksheet to something other than "botconfig", you must change the value of configSheet at the top of the script (Tools, Script editor) to match the new name. If you want to add or edit buttons for different categories, be sure to add new functions for those categories in the script (Tools, Script editor), and then assign those new functions to the new buttons.

## _Version History_

* 1.1.0
	* Overhaul the way the Bot determines a user's rank. It no longer selects the user's highest rank, but instead compares the user's rank against a whitelist of ranks.
		* A new Ranks worksheet tab must be added to the Google spreadsheet with 4 columns: "rankid", "rank", "weight" and "command".
		* The Bot goes through this list from top to bottom, until it finds a rankid that matches one of the user's ranks, and assigns that rank to the user.
		* If none of the whitelisted ranks are found, but the user is still on the server, the Bot assigns the "allothers" rank instead.
		* If the user is not on the server or has left the server, the Bot assigns the "leftserver" rank instead.
		* The weight value from this whitelist is now included with the output. See "Available User Ranks" above for more information.
	* Add an option to output configuration errors to a particular channel instead of or in addition to outputting these errors to a particular user.
	* Switch to user IDs instead of user Tags as the primary key for storing data on the output sheet. Note that this invalidates all older information on the output sheet.
	* Rename the "inputchannel" configuration setting to "inputchannelid". In addition, this configuration setting now uses the channel id instead of the channel name.
	* Rename the "ownertag" configuration setting to "erroruserid". In addition, this configuration setting now uses the user id instead of the user tag.
	* Remove the "rankvaluecolumn" configuration setting.
	* Add new configuration settings: "errorchannelid", "ranksheet", "allothersrankid", "leftserverrankid", "discordidcolumn", "ranknamecolumn", "rankweightcolumn", "rollsheet", "entriestolist" and "allowduplicates". See "General Configuration" above on how to configure these settings.
	* Fix: In certain situations, the Bot did not prevent a command in the channel from being deleted. This has been fixed.
	* Fix: The Bot now replies to all direct messages, including direct messages that do not start with "!".
	* Fix: The Bot now re-authenticates with the Google API on a daily basis, to prevent the authentication from expiring.
* 1.0.3
	* Fix: Arrayformulas are no longer accepted as valid commands.
	* Fix: Commands no longer overwrite arrayformulas.
* 1.0.2
	* Add an option to prevent the Bot from replying to invalid commands, or commands entered in the incorrect way (channel vs dm). See the "nocommandinchannel" and "nocommandindm" configuration settings for details.
* 1.0.1
	* Add a "CRUSHABOT_" prefix to all the ENV parameters. The old ENV parameters are still supported as a fallback, if the new ENV parameters are not found.
* 1.0.0
	* Initial release.
