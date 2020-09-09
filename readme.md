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
		* Go to https://docs.google.com/spreadsheets/d/1Z40cLwARx0Q4ytED6ILbe7p7Ppzlr0q3Se4xCc8xRME
		* Click on File, Make a copy.
		* Provide a name for your spreadsheet, and click "OK".

* Allow the Google Service Worker to access the document:
		* Open the .json file you downloaded earlier. Copy the email listed after "client_email". Do not include the quotes.
		* In the Google Spreadsheet, click on "Share". Click on "Add people and groups" and paste the email.
		* Set the rights to "Editor", and disable "Notify people". Click on "Share".

* Configure the Settings:
		* See Configuration further down this readme for details on how to properly configure your document.

### Set the ENV parameters.

###### Note: This application is created and tested running Ubuntu-20.04 on WSL2.
###### As such, all instructions are written with Linux in mind.
###### Windows and Mac users may need to substitute these with commands for their own OS.

* Set the Discord Token.
		* When you created the Discord App and Bot, you stored a token. You need that now.
		* Note: If you have misplaced the token, you can return to the App settings and copy it again.
		* Save the token to the "DISCORD_TOKEN" ENV parameter:
> export DISCORD_TOKEN=copiedtokenvalue



## Configuration