# SupportRequestr
Electron app that creates tickets in RepairShopr.

# Pre-req's
1. The 'leads_process' folder needs to be accessible by both the app and the Internet, as it is 
contains the PHP script and 'uploads' folder to upload screenshots and files.  Best to put this folder on your webserver.
2. The 'ticket_type' values in index.html need to match your Ticket Issue Types in your RepairShopr settings.  Admin -> Ticket Settings -> Ticket Issue Types.

# Known Issues
1. The 'hostname' variable only half works.  When running the app, it will pull the hostname into the "Device" field, but doesn't yet POST to RepairShopr.


# Setup
1. Edit the PHP script under 'leads_process'
   - Define your own RepairShopr domain for the API_URL
   - Define your own RepairShopr API key for API_KEY
   - Define BASE_URL with the location of your 'leads_process' folder

# Links
RepairShopr API:  https://feedback.repairshopr.com/knowledgebase/articles/376312-repairshopr-http-rest-api-beta
RepairShopr PHP:  http://feedback.repairshopr.com/knowledgebase/articles/379711-repairshopr-api-leads
