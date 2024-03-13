# Backend for Fitvate app

## Setup

After you've cloned the repo, create a `.env` file in root directory and copy contents from `.env.example` file. Replace them with actual values.

`cp ./.env.example ./.env`

Install dependencies using `npm install`.

Run `npx prisma migrate dev` & `npx prisma generate` and you're good to go.

Run development server using `npm run dev`.

## Endpoints

### Authentication

- `[POST] /auth/google`: verify the provided `idToken` and creates / retrieves the user
- `[POST] /auth/facebook`: verify the provided `idToken` and creates / retrieves the user
- `[POST] /auth/mobile/send-otp`: sends an OTP code to provided mobile number
- `[POST] /auth/mobile/check-otp`: verify OTP, if OTP is valid creates user account and send JWT

### User Profile

- `[GET] /users/{id}`: returns user profile
- `[POST] /users/{id}`: updates user profile and returns the updated profile
- `[DELETE] /user/{id}`: deletes user profile

### Purchases

- `[GET] /users/{id}/orders`: returns orders
- `[POST] /users/{id}/orders`: create new order
- `[GET] /users/{id}/orders/{orderId}`: validate purchase from Google play
