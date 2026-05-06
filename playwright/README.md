# Overview

This directory contains the playwright tests and some of the data files used for setup

## Updating screenshot snapshots

Some tests use `toHaveScreenshot()`. Screenshots only run against the prod build and snapshots must be generated on Linux x86_64 to match the CI environment.

> **Apple Silicon (M1/M2/M3) users:** the script handles this automatically via `--platform linux/amd64`.

Make sure the prod stack is running first:

```bash
yarn build && yarn server:reset && yarn docker:start:prod
```

Then run:

```bash
yarn screenshots:update
```

This uses Docker to generate snapshots that match CI's Linux x86_64 rendering. The Playwright version is detected automatically.

Commit all generated snapshot directories matching `playwright/e2e/suites/screenshots/*Screenshots.spec.ts-snapshots/`.

## Creating new test users

Follow these steps to create new test users and give them the correct permissions

1. Run `yarn server:reset` to ensure you don't have data modifications locally
1. In terraware, change to super admin by updating cookie using e2e/utils/userUtils.ts
1. Go to Settings/People in the navbar. Add Person
1. Run this to get the link from the text email for adding the user:
   `docker logs terraware-web-terraware-server-1 | grep auth.staging.terraware.io | head -1`
1. Paste this link into an incognito window and create the user on staging keycloak (recommend using password of
   `password`). Close the window once it gets to the Check Email page.
1. Go to staging keycloak admin -> Users -> select that user
1. Set Email Verified to true, remove Verify Email from required user actions, save
1. Open terraware in incognito and log in as your new user
1. In the dev tools network tab, grab the session cookie. Save this somewhere, you'll use this for the cookies in the
   tests
1. Make any other changes now to your user (accept cookies, add roles, modify prefs, etc).
1. Run `yarn dump:docker` now, then view the `dump.sql` file and change your new user's `max_inactive_interval` and
   `expiry_time` in
   spring_session to match the others
1. Copy the spring_session and spring_session_attributes rows to `session.sql`
1. Back in staging keycloak admin, this user can now be deleted
