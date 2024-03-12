# Backend for Fitvate app

## Routes

### Authentication

- `[GET] /auth/google`: redirects user to consent screen
- `[GET] /auth/google/redirect`: returns the generated JWT after user has signed up/in using google
- `[GET] /auth/facebook`: redirects user to facebook consent screen
- `[GET] /auth/facebook/redirect`: returns the generated JWT after user has signed up/in using facebook
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
