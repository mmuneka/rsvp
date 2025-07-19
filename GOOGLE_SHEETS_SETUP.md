# Google Sheets Integration Setup

Follow these steps to set up the Google Sheets integration for the wedding RSVP app:

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API for your project

## 2. Create a Service Account

1. In your Google Cloud project, go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Enter a name and description for your service account
4. Click "Create and Continue"
5. For the role, select "Project" > "Editor" (or a more specific role if you prefer)
6. Click "Continue" and then "Done"

## 3. Create and Download Service Account Key

1. Click on the service account you just created
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Select "JSON" as the key type
5. Click "Create" to download the key file

## 4. Share Your Google Sheet

1. Open your Google Sheet (ID: 1Nwq0sYISLJyUOts9vmbe2Q-kFayjd4pRkhtGoLBd5yE)
2. Click the "Share" button
3. Add the service account email (found in the JSON key file under "client_email")
4. Give it "Editor" access
5. Make sure to uncheck "Notify people" and click "Share"

## 5. Set Up Your Application

### Use Credentials File (Simplified Method)

1. Rename your downloaded service account key file to `google-credentials.json`
2. Place this file in the root directory of your project

## 6. Test the Integration

1. Start your development server
2. Visit `/admin/sheets` in your browser
3. Click "Test Connection" to verify the integration
4. If successful, you should see a test row added to your Google Sheet

## Troubleshooting

- Make sure the Google Sheet is shared with the service account email
- Check that the Google Sheets API is enabled in your Google Cloud project
- Verify that your credentials file is correctly named and placed in the root directory
- Look for error messages in the server logs