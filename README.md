[![Deployment](https://github.com/terraware/tree-location-web/actions/workflows/workflow.yml/badge.svg)](https://github.com/terraware/tree-location-web/actions/workflows/workflow.yml)

# Plant Locator App

## Running the app in development mode

### Step 1: Configure the `.env` file

```
KEYCLOAK_RESOURCE=(Keycloak client ID)
KEYCLOAK_CREDENTIALS_SECRET=(Keycloak client secret)
KEYCLOAK_REALM=(Keycloak realm)
KEYCLOAK_AUTH_SERVER_URL=(Keycloak server URL)
REACT_APP_TERRAWARE_API=http://localhost:8080
```

### Step 2: Login to Docker hub

To be able to access the Docker registry, you must first login:

```shell
docker login
```

Just type your username and password and you will be set.

### Step 3: Install dependencies

```
yarn
```

### Step 4: Running the app

Execute the following commands:

```shell
yarn docker:start
yarn start
```

### Step 5: Logging into the app

API endpoints will return HTTP 401 if you're not logged in. If you want to manually log in, you can use the API endpoint that redirects you to a login page. It takes a parameter to tell it where to send you after you've logged in:

```
http://localhost:8080/api/v1/login?redirect=http://localhost:3000/
```

### Step 6: Stopping the app

Execute the following commands:

```shell
yarn docker:stop
```

## Run Linter

Execute the following commands:

```shell
yarn lint
```

## Run End to End tests

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
````

To run the end-to-end tests:

```shell
# start the frontend server
yarn start:dev
# run the tests in interactive mode
yarn cy
# OR run the tests on the command line and generate a report
yarn cy:run
yarn e2e:report
```

### Generating endpoint types

Execute the following command:

```shell
yarn generate-types
```

This will create the file `src/api/types/generated-schema.ts`

### TreeLocator API

The Swagger documentation can be accesed [here](http://localhost:8080/docs)
