# Email Services for the Reply Worker

## Implement a new service

If your favourite service is missing and you would like to implement it, follow these steps:

1. Create a new file in the `email/services` directory,
   with a class that implements the EmailService interface from `email/service.interface.ts`
2. Add any required environment variable names like API tokens to `env.ts`
3. Add the name of the service to the `EmailServices` array in `email/index.ts`
4. Add a validation for the env variables inside the `checkEnv()` function
5.
