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

In production, `nginx` is the publicly-accessible HTTP front-end to
`terraware-web`. It serves the static resources (JS, CSS, and image
assets) and proxies HTTP requests to the API server, which is not
exposed publicly in production.

Developer builds, in contrast, launch an HTTP server using [Craco's
`devServer`
functionality](https://webpack.js.org/configuration/dev-server/#devserver)
which [listens on localhost port
3000](https://create-react-app.dev/docs/advanced-configuration/) to
serve static resources and proxy API requests to the API server
running on localhost port 8080 (`REACT_APP_TERRAWARE_API` from
`.env`).

`nginx` is neither installed nor launched via `yarn docker:start` or
`yarn start`; if you want to locally test any changes to its
configuration file (`nginx/default.conf.template`), you'll need to:

1) Install `nginx` locally
2) Substitute the configuration variables in `nginx/default.config.template`
   to point it at your local API server running on port 8080
3) Launch `nginx`

For example, when using Homebrew on a Mac, `nginx`'s default
configuration serves static resources from `/opt/homebrew/var/www` and
reads per-site configuration from
`/opt/homebrew/etc/nginx/servers/*.conf`. The following steps install,
configure, and launch `nginx` on localhost port 80:

```shell
brew install nginx
yarn build
cp -a build/* /opt/homebrew/var/www
SERVER_URL=http://localhost:8080 envsubst '${SERVER_URL}' < \
  nginx/default.conf.template | \
  perl -pe 's@/usr/share/nginx/html@/opt/homebrew/var/www@' > \
  /opt/homebrew/etc/nginx/servers/default.conf
yarn docker:start
/opt/homebrew/opt/nginx/bin/nginx -g daemon\ off\;
```

## Useful links

- The API Swagger documentation [link](http://localhost:8080/docs)
- Github deployment information [link](https://github.com/terraware/terraware-web/actions/workflows/workflow.yml)
- PostgreSQL command line client docs [link](https://www.postgresql.org/docs/current/app-psql.html)
- Remote backend instructions (running a local FE with staging/production BE) [link](https://github.com/terraware/terraware-web/tree/main/remote-backend#readme)
