# Fister SMS Project

This is a fully integrated web application featuring a user-facing frontend and a powerful admin panel. The application is designed to interact with real-world OTP service providers like 5sim.net dynamically.

## Features

- **Dynamic API Integration:** Add and manage different API servers directly from the admin panel.
- **Real-time Operations:** Purchase numbers, check for OTPs, and cancel orders with real API calls.
- **Live Analytics:** The admin analytics dashboard updates in real-time based on user activity.
- **Secure & Modern:** Includes basic XSS protection and a modern UI with ripple-click animations.
- **No Backend Needed:** Uses the browser's `localStorage` as a database for easy setup and testing.

## How to Deploy and Test

### Step 1: Upload to GitHub

1.  Create a new repository on GitHub. **It is highly recommended to make it "Private"** to protect your API keys.
2.  Upload all the files and folders from this project (`public`, `templates`, `netlify.toml`, `README.md`) to your new repository.

### Step 2: Deploy on Netlify

1.  Log in to [Netlify](https://www.netlify.com/) with your GitHub account.
2.  Click **"Add new site" > "Import an existing project"**.
3.  Choose your GitHub repository.
4.  Netlify will automatically detect the settings from `netlify.toml`. No configuration is needed.
5.  Click **"Deploy site"**. Your website will be live in a few seconds.

### Step 3: Configure and Test

1.  **Visit Your Live URL** provided by Netlify.
2.  Click the **"Admin Panel"** link on the login page.
3.  Navigate to the **Services** tab and click **"Add Server"**.
    -   **Server Name:** Give it a name (e.g., `5sim Live`).
    -   **API Key:** Enter your actual API key from the provider.
    -   **API URLs:** Fill in the correct base URLs for purchasing, checking, canceling, and banning numbers.
      -   *Example for 5sim.net:*
        -   **Get Number URL:** `https://5sim.net/v1/user/buy/activation`
        -   **Get Message URL:** `https://5sim.net/v1/user/check`
        -   **Cancel URL:** `https://5sim.net/v1/user/cancel`
        -   **Ban URL:** `https://5sim.net/v1/user/ban`
4.  Click **"Add Service"**.
    -   Select the server you just created.
    -   Fill in the service details exactly as required by your API provider.
      -   *Example for Telegram in Russia on 5sim:*
        -   **Service Name:** `Telegram (Russia)`
        -   **Service Code:** `telegram`
        -   **Country:** `russia`
        -   **Operator:** `any`
        -   **Price:** Enter the price you want to charge.
5.  Go **"Back to Website"**, log in, and purchase the new service to test the live API integration!
