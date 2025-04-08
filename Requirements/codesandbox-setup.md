# Airiam RAG Service - CodeSandbox Setup Guide

This guide outlines the steps to set up and run the Airiam RAG Service frontend application on CodeSandbox.

## What is CodeSandbox?

[CodeSandbox](https://codesandbox.io/) is an online code editor and development environment that allows you to create, share, and collaborate on web applications directly in your browser.

## Prerequisites

- A CodeSandbox account (you can sign up with GitHub)
- Basic knowledge of Next.js and React

## Step 1: Create a New Sandbox

1. Go to [CodeSandbox](https://codesandbox.io/).
2. Click on "Create" to start a new sandbox.
3. Select "Import Project" from the options.
4. Paste your GitHub repository URL or upload a ZIP file of your project.

Alternatively, you can create a new sandbox with a Next.js template:

1. From the CodeSandbox dashboard, click "Create Sandbox".
2. Search for "Next.js" in the template search.
3. Select the Next.js template.
4. This will create a basic Next.js application that you can modify.

## Step 2: Set Up Environment Variables

1. In the CodeSandbox editor, click on the gear icon (⚙️) in the left sidebar to open the workspace settings.
2. Click on "Secrets" in the left menu.
3. Add each environment variable from your `.env.local` file:
   - NEXT_PUBLIC_API_URL
   - NEXTAUTH_URL
   - NEXTAUTH_SECRET
   - Other environment variables...
4. Click "Save" for each secret.

Note: In CodeSandbox, environment variables prefixed with `NEXT_PUBLIC_` will be exposed to the browser, just like in a regular Next.js application.

## Step 3: Install Dependencies

If you imported your project and it doesn't automatically install dependencies:

1. Open the terminal in CodeSandbox (click on "Terminal" in the bottom panel).
2. Run:
   ```bash
   npm install
   ```

## Step 4: Run the Development Server

1. In the terminal, run:
   ```bash
   npm run dev
   ```
2. CodeSandbox will show you a preview of your application in the right panel.
3. You can also click on the "Open in new window" button to see your application in a separate browser tab.

## Step 5: Configure Backend API (Mock or Real)

### Option 1: Use a Mock Backend

If you want to develop without a real backend:

1. Create mock API handlers in your project:
   ```jsx
   // pages/api/mock/users.js
   export default function handler(req, res) {
     res.status(200).json([
       { id: 1, name: 'User 1' },
       { id: 2, name: 'User 2' },
     ]);
   }
   ```

2. Update your frontend code to use these mock endpoints during development.

### Option 2: Connect to a Real Backend

If you have a deployed backend:

1. Update your environment variables to point to your real API:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   ```

2. Make sure your backend allows CORS requests from CodeSandbox domains:
   - `https://*.codesandbox.io`
   - The specific URL of your sandbox

## Step 6: Share Your Sandbox

1. Click on the "Share" button in the top-right corner.
2. You can:
   - Get a shareable link
   - Embed the sandbox in a website
   - Copy the sandbox for others to edit
   - Make the sandbox public or private

## Tips for CodeSandbox Development

1. **Performance**: CodeSandbox can sometimes be slower than local development. For complex applications, consider using CodeSandbox's GitHub integration to develop locally and push changes.

2. **Browser Console**: You can access the browser console by clicking on "Console" in the bottom panel.

3. **Dependencies**: If you need to add new dependencies, you can edit the `package.json` file or use the terminal to run `npm install <package-name>`.

4. **Forking**: If you're working with someone else's sandbox, click "Fork" to create your own copy.

5. **GitHub Integration**: You can connect your sandbox to a GitHub repository:
   - Click on "GitHub" in the left sidebar
   - Connect to GitHub and select a repository
   - This allows you to commit and push changes directly from CodeSandbox

6. **Environment Variables**: Remember that environment variables in CodeSandbox are not shared when you share your sandbox link. Others will need to set up their own environment variables.

## Troubleshooting

- **Module Not Found Errors**: Make sure all dependencies are installed correctly.
- **API Connection Issues**: Check CORS settings on your backend.
- **Sandbox Freezing**: Try refreshing the page or creating a new sandbox.
- **Build Errors**: Look at the terminal output for detailed error messages.

## Resources

- [CodeSandbox Documentation](https://codesandbox.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Working with Environment Variables in CodeSandbox](https://codesandbox.io/docs/learn/environment/secrets)
