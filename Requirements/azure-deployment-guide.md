# Airiam RAG Service - Azure Deployment Guide

This guide outlines the steps to deploy the Airiam RAG Service frontend application to Azure using Azure Static Web Apps and Azure Functions for the backend.

## Prerequisites

- An Azure account with an active subscription
- Azure CLI installed locally
- Node.js (v16 or later) and npm installed
- Git installed

## Step 1: Prepare Your Application

1. Make sure your application is ready for production:
   ```bash
   npm install
   npm run build
   ```

2. Test the production build locally:
   ```bash
   npm start
   ```

3. Make sure your `.env.production` file has the correct values for your production environment.

## Step 2: Set Up Azure Static Web Apps

Azure Static Web Apps is perfect for hosting Next.js applications.

1. Install the Azure Static Web Apps CLI if you haven't already:
   ```bash
   npm install -g @azure/static-web-apps-cli
   ```

2. Login to Azure:
   ```bash
   az login
   ```

3. Create a resource group if you don't have one:
   ```bash
   az group create --name airiam-rag-resource-group --location eastus
   ```

4. Deploy using the Azure Portal:
   
   a. Go to the [Azure Portal](https://portal.azure.com/)
   
   b. Search for "Static Web Apps" and select "Static Web Apps"
   
   c. Click "Create"
   
   d. Fill in the details:
      - Subscription: Select your subscription
      - Resource Group: Select the resource group you created
      - Name: airiam-rag-frontend
      - Hosting Plan: Free
      - Region: Select a region close to your users
      - Source: GitHub (or other source control)
      - Organization: Your GitHub organization
      - Repository: Your repository name
      - Branch: main (or your default branch)
      - Build Presets: Next.js
      - App location: /
      - API location: /api
      - Output location: .next
   
   e. Click "Review + create" and then "Create"

5. The deployment will take a few minutes. Azure will set up a GitHub Action workflow in your repository to build and deploy your site automatically.

## Step 3: Configure Environment Variables

1. In the Azure Portal, navigate to your Static Web App.

2. Go to "Configuration" > "Application settings".

3. Add each environment variable from your `.env.production` file:
   - NEXT_PUBLIC_API_URL: Your API URL (e.g., https://api.airiam.com)
   - NEXTAUTH_URL: Your frontend URL (e.g., https://rag.airiam.com)
   - NEXTAUTH_SECRET: Your secret key
   - Other environment variables...

4. Click "Save" to apply the changes.

## Step 4: Configure Backend API

If you're deploying the backend separately, follow these steps:

1. Navigate to your backend deployment (e.g., Azure Functions, Azure App Service)

2. Set up CORS to allow requests from your frontend:
   - Allow your Static Web App's domain
   - Allow credentials if needed
   - Allow necessary HTTP methods (GET, POST, PUT, DELETE)

3. Make sure your backend is accessible from your frontend.

## Step 5: Set Up Custom Domain (Optional)

1. In the Azure Portal, navigate to your Static Web App.

2. Go to "Custom domains".

3. Click "Add" and follow the steps to configure your custom domain.

4. Update your DNS settings as instructed by Azure.

## Step 6: Set Up Continuous Deployment

When you connected your GitHub repository, Azure created a GitHub Actions workflow. For any new commits to your main branch, the site will automatically rebuild and deploy.

If you need to manually redeploy:

1. In the Azure Portal, navigate to your Static Web App.

2. Go to "GitHub Actions runs".

3. Click "Run workflow" to trigger a new build and deployment.

## Step 7: Monitoring and Logs

1. In the Azure Portal, navigate to your Static Web App.

2. Go to "Monitoring" to see performance metrics.

3. For logs, go to "Logs" or "Diagnostic settings" to configure log storage.

## Troubleshooting

- **Build Failures**: Check the GitHub Actions logs for details.
- **Runtime Errors**: Enable Application Insights for monitoring.
- **API Connection Issues**: Verify your CORS settings and network security rules.
- **Authentication Problems**: Check your auth configuration and secrets.

## Next Steps

- Set up Azure Front Door for CDN and additional security features
- Configure Azure Monitor alerts for proactive monitoring
- Implement Azure DevOps pipelines for more complex deployment scenarios
- Enable Azure Application Insights for deep application monitoring

## Resources

- [Azure Static Web Apps documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Next.js deployment documentation](https://nextjs.org/docs/deployment)
- [Azure Functions documentation](https://docs.microsoft.com/en-us/azure/azure-functions/)
