# SupportRequestr
Electron app that creates tickets in RepairShopr.

# Pre-req's
1. The 'leads_process' folder needs to be accessible by both the app and the Internet, as it is 
contains the PHP script and 'uploads' folder to upload screenshots and files.  Best to put this folder on your webserver.

# Setup
1. Edit the PHP script under 'leads_process'
1.1 Define your own RepairShopr domain for the API_URL
1.2 Define your own RepairShopr API key for API_KEY
1.3 Define BASE_URL with the location of your 'leads_process' folder

# Installation