# Wedding RSVP System

A simple wedding RSVP system with QR code check-in functionality.

## Features

- RSVP form for wedding guests
- QR code generation for each guest
- Admin dashboard to view RSVPs
- Check-in system for the wedding day
- Server-side storage of guest information

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the example environment file:
   ```
   cp .env.local.example .env.local
   ```
4. Edit `.env.local` and set a secure admin key
5. Run the development server:
   ```
   npm run dev
   ```

## Deployment

### Important: Server-side Storage

This application uses server-side file storage to persist guest data. When deploying:

1. Make sure the `/data` directory exists on your hosting provider
2. Ensure the directory has write permissions for the web server
3. The `guests.json` file will be created automatically when the first guest registers

### Vercel Deployment

When deploying to Vercel or similar serverless platforms:

1. Set the `ADMIN_KEY` environment variable in your project settings
2. For file storage, you have two options:
   - Use a persistent storage solution like AWS S3 (requires code modification)
   - Deploy to a Vercel Pro plan with persistent storage

### Traditional Hosting

For traditional hosting (VPS, shared hosting):

1. Build the application:
   ```
   npm run build
   ```
2. Deploy the `out` directory to your server
3. Make sure the `/data` directory has proper write permissions

## Admin Access

Access the admin dashboard at `/admin` and use your admin key to log in.