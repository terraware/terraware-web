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

You need to access the app via the authentication proxy, which will be listening on port 4000, so point your browser at [http://localhost:4000/](http://localhost:4000/).

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

The Swagger documentation can be accesed [here](http://localhost:8080/docs)
