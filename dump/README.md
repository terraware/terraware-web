# Database dumps for local server testing

This directory has the test data that's used by the Cypress test suite.

## Updating the dumps

For the most part, it's okay to use an older dump; the server will run the necessary database migrations when it starts up. But in some cases, the server will change in such a way that it's unable to migrate a database from before a certain time.

Generally, the dumps here will be updated by a backend engineer since they'll be the ones making the server changes that break backward compatibility. So this section is a reference for people who are working on terraware-server.

### High-level steps

1. Restore the existing dump to a clean local database.
2. Run the server locally so it migrates the dumped database.
3. Shut down the server.
4. Delete ephemeral data that shouldn't be included in the dump.
5. Dump the local database.

### Restoring the database

```shell
dropdb terraware
createdb terraware
psql terraware < dump.sql
```

### Deleting ephemeral data

Double-check this to make sure there aren't any new tables with ephemeral data that also need to be cleared. Update this doc if there are.

```sql
DELETE FROM jobrunr_metadata;
DELETE FROM jobrunr_recurring_jobs;
```

### Dumping the local database

```shell
pg_dump -O -x -f dump.sql terraware
```

OR

```shell
docker compose exec postgres pg_dump -O -x -U postgres terraware > dump.sql
```
