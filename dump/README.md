# Database dumps for local server testing

This directory has the test data that's used by the Cypress test suite.

## Updating the dumps

For the most part, it's okay to use an older dump; the server will run the necessary database migrations when it starts up. But in some cases, the server will change in such a way that it's unable to migrate a database from before a certain time.

Generally, the dumps here will be updated by a backend engineer since they'll be the ones making the server changes that break backward compatibility. So this section is a reference for people who are working on terraware-server.

### High-level steps

1. Restore the existing dump to a clean local database.
2. Run the server locally so it migrates the dumped database.
3. Shut down the server.
   - If using docker, use `docker container stop <server-container-name>`
4. Run the yarn dump command.
   - Which also deletes ephemeral data from the database that shouldn't be included in the dump.

### Restoring the database

```shell
dropdb terraware
createdb terraware
psql terraware < dump.sql
```

### Dumping the local database

Double-check scripts/dump.sh to make sure there aren't any new tables with ephemeral data that also need to be cleared 
or updated. Update this doc if there are.

```shell
yarn dump:local
# or 
yarn dump:docker
```

### Images

Images can be put into the dump, but should be very small files, and ideally should just use symlinks to existing images.
Modify the database before dumping in order to point to the `photo-data/test/` folder, so that the images can be committed.
