# Coolify Deployment Guide

## Prerequisites
- A Coolify instance set up
- A MongoDB database (MongoDB Atlas or self-hosted)

## Deployment Steps

### 1. Push your code to a Git repository
Make sure your code is pushed to GitHub, GitLab, or any Git provider that Coolify supports.

### 2. Create a new application in Coolify
1. Log in to your Coolify dashboard
2. Click "New Resource" → "Application"
3. Select your Git repository
4. Choose the branch you want to deploy

### 3. Configure Environment Variables
In Coolify, add the following environment variable:

```
MONGO_DB_CONNECTION_STRING=your_mongodb_connection_string_here
```

### 4. Build Configuration
Coolify should auto-detect the Dockerfile. If not, set:
- **Build Pack**: Dockerfile
- **Port**: 3000

### 5. Deploy
Click "Deploy" and Coolify will:
- Build the Docker image
- Start the container
- Expose it on your domain

## Local Testing with Docker

Build and run locally:
```bash
docker build -t adapter-moral-machine .
docker run -p 3000:3000 -e MONGO_DB_CONNECTION_STRING="your_connection_string" adapter-moral-machine
```

Or use docker-compose:
```bash
# Create a .env file with MONGO_DB_CONNECTION_STRING
docker-compose up
```

## Health Check
The application includes a health check endpoint that monitors `/questions-data` to ensure the app is running correctly.
