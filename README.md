# Backend for Fitvate app

## Routes

### Authentication

Routes for authenticating with Google

- `[GET] /auth/google`: redirects user to consent screen
- `[GET] /auth/google/redirect`: returns the generated JWT after user has signed up/in using google
