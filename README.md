[![Deployment](https://github.com/terraware/tree-location-web/actions/workflows/workflow.yml/badge.svg)](https://github.com/terraware/tree-location-web/actions/workflows/workflow.yml)

# Plant Locator App

## Running the app in development mode

### Step 1: Configure the `.env` file

```
KEYCLOAK_AUTH_SERVER_URL=(URL of Keycloak server)
KEYCLOAK_CREDENTIALS_SECRET=(client secret for the dev-terraware-server user)
KEYCLOAK_REALM=terraware
KEYCLOAK_RESOURCE=dev-terraware-server
REACT_APP_TERRAWARE_API=http://localhost:8008
```

For the Keycloak settings, get the client secret and URL from an existing member of the team.

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

To run the test, execute the following command:

```shell
yarn start:dev
yarn cy
```

To run the tests and generate the report:

```shell
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

The Swagger documentation can be accesed [here](http://localhost:8008/docs)
