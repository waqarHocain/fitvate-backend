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

### Workout Plans

- `[GET] /users/id/workout-plans`: returns user workoutplans
- - response:
- - ```
    {
    status: "success",
      data: {
        plans: [
          {
            id: str,
            "planId": "fslajk",
            "planName": "fjdskl",
            "planDescription": null,
            "planThemeColor": null,
            "planCategory": null,
            "isPurchased": true,
            "duration": null,
            "goal": null,
            "planType": null,
            weeks: [
              {
                "id": str,
      			    "weekId": str,
      			    "isCompleted": false,
      			    "workoutPlanId": str,
      			    "days": [
                  {
                    "id": str,
                    "dayId": "str,
                    "isCompleted": boolean,
                    "weekId": str,
                    "exercises": [
                      {
                        "id": str,
                        "exerciseId": str,
                        "displayIndex": int,
                        "weightUsed": str,
                        "isCompleted": boolean,
                        "dayId": str
                      }
                    ]
              }
            ]
          },
        ]
      }
    }
    ```

- `[POST] /users/id/workout-plans`: add a new workout plan,

- - payload:
- - ```
    {
       planId: str,
       planName: str,
       planDescription: str?,
       planThemeColor: str?,
       planCategory: str?,
       isPurchased: boolean?,
       duration: str?,
       goal: str?,
       planType: str?,
       weeks: [
          {
            weekId: str,
            isCompleted: boolean?,
            days: [
              {
                dayId: str,
                isCompleted: boolean?,
                exercises: [
                  {
                    exerciseId: str,
                    weightUsed: str,
                    displayIndex: int,
                    isCompleted: boolean?,
                  }
                ]
              }
            ]
          }
        ]
      }
    ```

- - response:
- - ```
    {
      status: "success",
      data: {
         plan: {
          id: str,
          "planId": "fslajk",
          "planName": "fjdskl",
          "planDescription": null,
          "planThemeColor": null,
          "planCategory": null,
          "isPurchased": true,
          "duration": null,
          "goal": null,
          "planType": null,
          weeks: [
            {
              "id": str,
    			    "weekId": str,
    			    "isCompleted": false,
    			    "workoutPlanId": str,
    			    "days": [
                {
                  "id": str,
                  "dayId": "str,
                  "isCompleted": boolean,
                  "weekId": str,
                  "exercises": [
                    {
                      "id": str,
                      "exerciseId": str,
                      "displayIndex": int,
                      "weightUsed": str,
                      "isCompleted": boolean,
                      "dayId": str
                    }
                  ]
            }
          ]
         },
      },
    }
    ```

- `[DELETE] /users/id/workout-plans`: delete a workout plan,
- - payload: `{workoutPlanId: str}`
- - response: `{ status: "success" }`

### Challenges Progress

- `[GET] /users/id/challenges`: returns user challenges
- - response: `{status: "success", data: {challenges: [{ id, challengeId, userId }]}}`
- `[POST] /users/id/challenges`: add a new challenge,
- - payload: `{ challengeId }`
- - response: `{ status: "success", data: { challenge: { id, challengeId, userId }, }, }`
- `[DELETE] /users/id/challenges`: delete a challenge,
- - payload: `{ challengeId }`
- - response: `{ status: "success" }`

### Reminders

- `[GET] /users/id/reminders`: returns user reminders
- - response: `{status: "success", data: {reminders: [{ id, reminderId, userId }]}}`
- `[POST] /users/id/reminders`: add a new reminder,
- - payload: `{ reminderId }`
- - response: `{ status: "success", data: { reminder: { id, reminderId, userId }, }, }`
- `[DELETE] /users/id/reminders`: delete a reminder,
- - payload: `{ reminderId }`
- - response: `{ status: "success" }`

```

```
