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

- `[PUT] /users/id/workout-plans`: edit a workout plan,
- - payload:
  - ```
    {
       planId: "er23j",
       // other fields that need to be updated, like: planName: "Updated Plan",
       weeks: [
          {
            weekId: "fjdk",
            isCompleted: false,
            days: [
              {
                dayId: "fjdk",
                isCompleted: true,
                exercises: [
                  {
                    exerciseId: "4bd3e",
                    weightUsed: "4",
                    displayIndex: 1,
                    isCompleted: true,
                  }
                ]
              }
            ]
          }
        ]
      }
    ```
- - response: returns the updated plan

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
- - response:

  ```
    {
      "status": "success",
      "data": {
        "reminders": [
          {
            "id": str,
            "reminderId": str,
            "reminderName": str,
            "reminderTime": str,
            "status": str,
            "uuid": str,
            "userId": str,
            "repeatDays": [
              {
                "dayNum": 4
              },
              {
                "dayNum": 2
              }
            ]
          }
        ]
      }
    }
  ```

- `[POST] /users/id/reminders`: add a new reminder,
- - payload:

```
{
  "reminderId" : str,
	"reminderName": str,
	"reminderTime": str,
	"status": str,
	"uuid": str,
	"repeatDays": [int]
}
```

- - response:

```
{
	"status": "success",
	"data": {
		"reminder": {
			"id": str,
			"reminderId": str,
			"reminderName": str,
			"reminderTime": str,
			"status": str,
			"uuid": str,
			"userId": str,
			"repeatDays": [
				{
					"dayNum": int
				},
			]
		}
	}
}
```

- `[DELETE] /users/id/reminders`: delete a reminder,
- - payload: `{ reminderId: str }`
- - response: `{ status: "success" }`

### Articles

- `[GET] /users/id/posts`: returns a user's articles
- - response: `{status: success, data: {articles: [{ id, title, body, imageUrl?, category }]}}`

- `[POST] /users/id/posts`: creates a new article
- - payload: `{title, body, category, imageUrl?}`
  - response: `{status: success, data: { articles: [] }}`

- `[GET] /users/id/posts/articleId`: returns article for provided id
- - response: `{status: success, data: {id, title, body, imageUrl, category, userId}}`

- `[PUT] /users/id/posts/articleId`: updates articles content and returns the updated article
- - payload: it can be any of `title, body, imageUrl, category` or all of them
- - response: `{status: success, data: {id, title, body, imageUrl, category, userId}}`

- `[DELETE] /users/id/posts/articleId`: deletes an article
- - response: `{status: success}`

### Analytics

- `[GET] /analytics/dau`: returns number of active users for today, who have visited app at least once
  - response: `{date: "24-4-2024, "Active Users": 4}`
