
[![Deployment](https://github.com/terraware/tree-location-web/actions/workflows/workflow.yml/badge.svg)](https://github.com/terraware/tree-location-web/actions/workflows/workflow.yml)

# Plant Locator App

## Running the app in development mode

### Step 1: Configure the `.env` file

```
OAUTH2_PROXY_CLIENT_SECRET=(client secret for the localhost-oauth2-proxy user)
OAUTH2_PROXY_COOKIE_SECRET=(see below)
OAUTH2_PROXY_OIDC_ISSUER_URL=(URL of Keycloak server)
REACT_APP_TERRAWARE_API=http://localhost:8008
```

For the OAuth2 Proxy settings, get the client secret and OIDC issuer URL from an existing member of the team. Generate a cookie secret like this:

```
python -c 'import os,base64; print(base64.urlsafe_b64encode(os.urandom(16)).decode())'
```

### Step 2: Login to Docker hub

# Seedbank App

## Running the app in development mode

### Step 1: Login to Docker hub
>>>>>>> Adds React, ReactRouter, MaterialUI, Recoil and Docker

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

### Step 2: Launch the containers

Execute the following command:

```shell
npm run docker:start
```

### Step 3: Start the app
>>>>>>> Adds React, ReactRouter, MaterialUI, Recoil and Docker

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
=======
docker exec -it seedbank-app-dev bash
npm start
```

The app can be accesed [here](http://localhost:3000)

### Update api container
>>>>>>> Adds React, ReactRouter, MaterialUI, Recoil and Docker

Execute the following command:

```shell

yarn generate-types
```

This will create the file `src/api/types/generated-schema.ts`

### TreeLocator API

The Swagger documentation can be accesed [here](http://localhost:8008/docs)



npm run docker:update
```

### SeedBank API

The Swagger documentation can be accesed [here](http://localhost:8080/swagger-ui.html)

The API schema can be fetched from [here](http://localhost:8080/v3/api-docs)
>>>>>>> Adds React, ReactRouter, MaterialUI, Recoil and Docker
