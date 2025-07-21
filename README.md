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
4. Edit `.env.local` and set:
   - A secure admin key
   - Your MongoDB connection string (see MongoDB setup below)
5. Run the development server:
   ```
   npm run dev
   ```

## MongoDB Setup

1. Create a free MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (the free tier is sufficient)
3. In the Security section, create a database user with read/write permissions
4. In Network Access, add your IP address or allow access from anywhere (for development)
5. Click "Connect" on your cluster, select "Connect your application", and copy the connection string
6. Replace `<username>`, `<password>`, and `<dbname>` in the connection string with your credentials
7. Add this connection string to your `.env.local` file as `MONGODB_URI`

## Deployment

### MongoDB for Data Storage

This application uses MongoDB to persist guest data, which is ideal for Vercel deployment:

1. Make sure your MongoDB Atlas cluster is properly configured
2. Set the `MONGODB_URI` environment variable in your Vercel project settings
3. Ensure your MongoDB Atlas cluster allows connections from Vercel's IP addresses (you may need to allow access from anywhere for simplicity)

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