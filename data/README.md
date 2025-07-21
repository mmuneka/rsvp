# Guest Data Directory

This directory is used to store guest information for the wedding RSVP system.

## Important Notes

- The `guests.json` file will be created automatically when the first guest registers
- This file contains all guest registration data
- The file is excluded from git via .gitignore to protect guest privacy
- When deploying, make sure this directory exists on the server

## Deployment Instructions

1. Make sure the `/data` directory exists on your hosting provider
2. Ensure the directory has write permissions for the web server
3. For Vercel or similar serverless platforms, use environment variables to specify an alternative storage method

## Backup Recommendations

Regularly backup the `guests.json` file to prevent data loss.