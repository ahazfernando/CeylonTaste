# TrueTaste (Next.js)

## Auth: AWS Cognito

This app uses **AWS Cognito** for authentication (no Firebase). User profiles are stored in DynamoDB and exposed via the backend `/users/me` API.

### Setup

1. **Create a Cognito User Pool** (AWS Console → Cognito → Create user pool):
   - Sign-in: Email, Password.
   - App client: Create app client (e.g. "TrueTaste Web"), no secret for public client.
   - Note the **User Pool ID** and **App client ID**.

2. **Environment variables** (copy `.env.example` to `.env.local` and set):
   - `NEXT_PUBLIC_COGNITO_USER_POOL_ID` – User Pool ID
   - `NEXT_PUBLIC_COGNITO_CLIENT_ID` – App client ID
   - `NEXT_PUBLIC_API_BASE_URL` – Backend API base URL (must include `/users/me`; e.g. `https://xxx.execute-api.us-east-1.amazonaws.com/Prod`)

3. **Backend**: Deploy the SAM stack (`truetaste-backend`) and pass Cognito IDs as parameters (or set in template). The stack creates the `TrueTasteUsers` DynamoDB table and GET/PUT `/users/me` Lambdas.

4. **Run without Firebase**: No Firebase env vars or packages are required. Login and signup use Cognito; profile data comes from the backend.

### Admin users

Admin emails are defined in the backend (e.g. `jordan@gmail.com`, `jordan04@gmail.com`). Users with those emails get `role: 'admin'` when the profile is created.
