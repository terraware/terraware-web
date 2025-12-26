# Terraware Web

This is the front end web app for the [Terraware](https://terraware.io/) application from [Terraformation](https://terraformation.com/).

The web app provides seed inventory management capabilities - with two main areas of focus: the seed processing workflow and monitoring of a seed bank's physical infrastructure.

## About this open-source project

If you're not a Terraformation employee, thanks for checking this repo out!

We're offering this project as Apache-licensed open source in the interest of sharing our technology with the world and being transparent about our work. Our mission is to accelerate global native forest restoration, and we believe we'll get there faster by sharing what we do.

For the moment, we're not asking for code contributions from the community. (Check our [careers page](https://www.terraformation.com/about/careers) if you're itching to work on this code!)

You may see references to some private repositories in the documentation. We're working toward opening more of our code, but not everything is ready yet.

## Requirements

- Docker Desktop version `4.32.0` or later

## How to Run the App in Development Mode

1. Copy `.env.sample` from the root directory of this repo to the same directory, with the filename `.env`
   1. If you work for Terraformation and are using existing Keycloak setup, refer to the secrets in the "Onboarding Plan for Frontend WebApp Developers" confluence page
2. Login to Docker hub

```shell
docker login
```

3. Install dependencies

```shell
yarn
```

4. Start the app

```shell
yarn docker:start  # Run the server code
yarn start         # Run the front-end code
```

5. Login. If you configured your environment variables correctly then you'll be taken to a keycloak login page. You may also try to login using through this API endpoint.

```shell
http://localhost:8080/api/v1/login?redirect=http://localhost:3000/
```

6. Stop the app

```shell
yarn docker:stop
# Stop the process running the frontend
```

### How to Generate Translations

The file `src/strings/csv/en.csv` has all the human-readable strings in the app. If you're going to make text changes (including adding new text), you'll need to edit that file as well as the translation files for other languages.

We use an automatic translation tool that generates translations using OpenAI's API.

Get an OpenAI API key from your OpenAI account administrator or create one using [the OpenAI platform console](https://platform.openai.com/api-keys). It should have write permission on the Responses API.

Put the key in your `.env` file under the name `OPENAI_API_KEY`.

To translate newly-added or edited strings, you have two choices. You can do it as a one-off operation:

```shell
yarn translate
```

Or you can run autotranslate in "watch mode," which will watch for changes to `src/strings/csv/en.csv` and automatically request translations as needed. You can leave it running in the background.

```shell
yarn translate:start &
```

### How to Generate RTK Query code

The file `./rtk-codegen.config.ts` configures the endpoints to be generated, and the desintation files. You will need to update
this file to generate new sets of API.

1. Update `./rtk-codegen.config.ts`
2. Generate new queries

   ```shell
   yarn generate-queries
   ```

3. Add tags/invalidations
   This step is neccessary for RTK Query to function correctly. This configures data invalidation behaviors.
   Add `providedTags`/`invalidateTags` behaviors to endpoints under `src/queries/extensions`

## How to Contribute

Before putting up a pull request, make sure to run the following commands. The CI will check that these steps are completed.

```shell
yarn generate-types  # generate types for any server side API changes
yarn format          # run code formatter
yarn lint            # run linter to check for code quality issues
yarn ts              # run the typescript types checker
yarn translate       # generate translations; requires OpenAI API key
yarn test            # run the Jest (unit and integration) tests
# run the end to end tests, see the section below for more details
```

Tip: you can run everything except the end-to-end tests using:

```shell
yarn generate-types && yarn format && yarn lint && yarn ts && yarn test
```

## How to Run the End-to-End Tests

Execute this command before each run of the end-to-end tests. This script does two things. #1 it downloads and start a Docker image for the terraware backend server and #2 it resets the state of the `terraware` database.

```shell
yarn server:reset
```

Tip: if you want to save the contents of a `terraware` database that you're using for manual testing, you can dump the contents of that database and reload them later. You can also rename the existing database using the following commands.

```shell
# connect to another local psql database that isn't terraware
psql postgres
# rename the existing terraware database to save it's contents
ALTER DATABASE terraware RENAME TO terrawareTEMP;
```

If this is your first time running the end-to-end tests, run this to install the necessary dependencies:

```shell
yarn playwright install
```

To run the end-to-end tests:

```shell
yarn server:reset   # start server and reset database state
yarn start:dev      # start the frontend
yarn playwright:run # run the tests on the command line and generate a report
yarn playwright:run --debug # run the tests on the command line in debug mode and generate a report
yarn docker:stop    # don't forget to stop the server when you're done
```

## Connecting to the Database

If you want to examine or change the database that's used for your local testing, you can run the PostgreSQL interactive command-line client. This will only work after you've run `scripts/resetdb.sh` or `yarn docker:start`.

```shell
docker compose exec postgres psql -U postgres terraware
```

To exit the PostgreSQL client, type `\quit` or hit control-D.

## Running a prod-like build locally with `nginx`

Developer builds use non-optimized, hot-reloading builds served via
Craco on http://localhost:3000 . These are ideal for the normal
developer workflow, but you'll want to run a produciton-like build in
order to test changes to:

- The `nginx` configuration (`nginx/default.conf.template`)
- The build process
- The optimization/packaging process

then run the following steps to launch a prod-like build on
http://localhost:3001 :

```shell
yarn docker:start:prod      # run once to start terraware-server and nginx
yarn generate-strings       # optional: only run if new strings have been added since last build
yarn build                  # run each time JS/CSS/image resources change (including strings)
curl http://localhost:3001  # optional: verify that nginx is running correctly
```

Each time you change JS, Typescript, CSS, or other static resources,
you must re-run `yarn build`. This is fairly slow, which is why it's
not the normal developer workflow.

When finished, shut down the prod-like build with:

```shell
yarn docker:stop:prod
```

## Useful links

- The API Swagger documentation [link](http://localhost:8080/docs)
- Github deployment information [link](https://github.com/terraware/terraware-web/actions/workflows/workflow.yml)
- PostgreSQL command line client docs [link](https://www.postgresql.org/docs/current/app-psql.html)
- Remote backend instructions (running a local FE with staging/production BE) [link](https://github.com/terraware/terraware-web/tree/main/remote-backend#readme)
