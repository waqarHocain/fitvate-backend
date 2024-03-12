# Backend for Fitvate app

## Routes

### Authentication

Routes for authenticating with Google

- `[GET] /auth/google`: redirects user to consent screen
- `[GET] /auth/google/redirect`: returns the generated JWT after user has signed up/in using google

- `[GET] /users/{id}`: returns user profile
- `[POST] /users/{id}`: updates user profile and returns the updated profile
- `[DELETE] /user/{id}`: deletes user profile
