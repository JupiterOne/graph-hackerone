# Development

This integration focuses on HackerOne and is using the HackerOne API for
requesting resources.

## HackerOne account setup

It is assumed you have admin access to the HackerOne console.

1. Go to hackerone.com and login
2. Navigate to `Organization Settings` by clicking on the top nav.
3. Next, click `API Tokens` on the left hand side
4. Click the `Create API token`
5. Enter an identifier. This will be your `API Key Name`.
6. Check the program you want to grant access to.
7. Select `Standard` group permission.
8. Click `Create API token`.
9. Copy API Token, store in safe place in accordance with best practices.
10. Navigate to `Program Settings` via the top header
11. Take note of the program `Handle` found in the `Information` form.

## Authentication

Copy the `.env.example` to `.env` file and fill in the variables using the user
information and API token information generated from instructions above. The
mapping is as follows:

```txt
HACKERONE_API_KEY -> the token
HACKERONE_API_KEY_NAME ->  the token name
HACKERONE_PROGRAM_HANDLE -> the program handle
```
