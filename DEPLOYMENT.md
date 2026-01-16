# 🚀 Organizational Chart Pro - Monday.com Deployment Guide

## Overview
This guide will help you deploy the Organizational Chart Pro app to Monday.com as a custom app.

## Prerequisites
- Monday.com developer account
- Web hosting service (Netlify, Vercel, AWS S3, Firebase, etc.)
- Node.js and npm installed

## Step 1: Build the Application

```bash
# Install dependencies
npm install

# Build for production (optimized for Monday.com)
npm run build
```

The `build` folder will contain your production-ready app.

## Step 2: Upload to Hosting Service

### Option A: Netlify (Recommended)
1. Go to [Netlify](https://netlify.com)
2. Drag and drop the entire `build` folder
3. Get the deployment URL

### Option B: Vercel
1. Go to [Vercel](https://vercel.com)
2. Upload the `build` folder
3. Get the deployment URL

### Option C: Manual Upload
Upload the `build` folder contents to any static hosting service.

## Step 3: Create Monday.com App

1. Go to [Monday.com Developers](https://developer.monday.com/)
2. Click "Create New App"
3. Choose "App Features" → "Board Views" or "Dashboard Widgets"
4. Upload the `monday.json` file from your project root
5. Set the App URL to your hosted app URL

## Step 4: Configure OAuth Permissions

In your Monday.com app settings, add these OAuth scopes:
- `boards:read` - Read board data and structure
- `items:read` - Read board items and their data
- `users:read` - Read user information

## Step 5: Test Your App

1. In Monday.com, go to a board
2. Click the "+" button to add a view
3. Find "Organizational Chart Pro" in the list
4. Select it and configure as needed

## Configuration Files

### monday.json
Contains app metadata, features, and permissions required by Monday.com.

### env-example.txt
Contains environment variables you can set for customization.

## Troubleshooting

### App Not Loading
- Check that your hosting service supports HTTPS
- Verify the app URL in Monday.com developer console
- Check browser console for CORS errors

### Data Not Loading
- Ensure your Monday.com app has the correct OAuth scopes
- Check that your board has the expected column structure
- Verify API permissions in Monday.com

### Theme Not Syncing
- The app automatically syncs with Monday.com themes
- Check that context is properly initialized

## Development

For local development with Monday.com integration:

```bash
# Install dependencies
npm install

# Start development server
npm start

# The app will automatically enter development mode with mock data
```

Use these keyboard shortcuts in development:
- `Ctrl+M` - Trigger mock Monday.com context
- `Ctrl+L` - Light theme
- `Ctrl+D` - Dark theme
- `Ctrl+N` - Night theme

## Support

For issues or questions:
- Check the browser console for error messages
- Ensure all OAuth scopes are properly configured
- Verify your hosting service supports iframe embedding

---

**Happy deploying! 🎉**










