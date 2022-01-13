# Plant Locator App

## How to Run the App in Development Mode

1. Configure the `.env` file using the sample file `.env.sample`
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

## How to Contribute

Before putting up a pull request, make sure to run the following commands. The CI will check that these steps are completed.

```shell
yarn generate-types  # generate types for any server side API changes
yarn format          # run code formatter
yarn lint            # run linter to check for code quality issues
yarn ts              # run the typescript types checker
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

To run the end-to-end tests:

```shell
yarn server:reset  # start server and reset database state
yarn start:dev     # start the frontend
yarn cy            # run the tests in interactive mode
# OR
yarn cy:run && yarn e2e:report  # run the tests on the command line and generate a report
yarn docker:stop   # don't forget to stop the server when you're done
```

## Useful links

- The API Swagger documentation [link](http://localhost:8080/docs)
- Github deployment information [link](https://github.com/terraware/terraware-web/actions/workflows/workflow.yml)
