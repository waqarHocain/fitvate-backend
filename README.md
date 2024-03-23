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
- `[POST] /auth/refresh`: generates a new access token, payload: `{refreshToken: "valid refresh token"}`

### User Profile

- `[GET] /users/{id}`: returns user profile
- `[POST] /users/{id}`: updates user profile and returns the updated profile
- `[DELETE] /user/{id}`: deletes user profile

### Purchases

- `[GET] /users/{id}/orders`: returns orders
- - response: `{status: "success", data: { data: [{id, orderId, purchaseToken, userId}] } }`
- `[POST] /users/{id}/orders`: verifies and add the purcashe to user orders list
- - payload: `{orderId, productId, purchaseToken}`
- - response: `{ status: "success", data: { purchase: { id, orderId, purchaseToken, userId }, },}`
- ~~`[GET] /users/{id}/orders/{orderId}`: validate purchase from Google play~~

### Liked Exercises

- `[GET] /users/id/liked-exercises`: returns user liked exercises
- - response: `{status: "success", data: {exercises: [{ id, exerciseId, userId }]}}`
- `[POST] /users/id/liked-exercises`: add a new exercise to liked exercises,
- - payload: `{exerciseId: "exercise id"}`
- - response: `{ status: "success", data: { exercise: { id, exerciseId, userId }, }, }`
- `[DELETE] /users/id/liked-exercises`: delete exercise from liked exercises,
- - payload: `{exerciseId: "exercise id"}`
- - response: `{ status: "success" }`

### Liked Articles

- `[GET] /users/id/liked-articles`: returns user liked articles
- - response: `{status: "success", data: {articles: [{ id, articleId, userId }]}}`
- `[POST] /users/id/liked-articles`: add a new article to liked articles,
- - payload: `{articleId: "article id"}`
- - response: `{ status: "success", data: { article: { id, articleId, userId }, }, }`
- `[DELETE] /users/id/liked-articles`: delete article from liked exercises,
- - payload: `{articleId: "article id"}`
- - response: `{ status: "success" }`
