# Local environment using remote backend

Ordinarily, you'll run a local copy of terraware-server, perhaps using the `docker-compose.yml`
in the parent directory, and the Node server that's launched by `yarn start` will forward API
requests to that server.

However, sometimes it's useful to run a local frontend dev environment but send API requests to
a remote backend, e.g., if you want to test how a UI change works with a real-world data set.
Here's how to set that up using Docker Desktop on MacOS.

1. From the directory of this readme, generate a self-signed certificate. The following command should work. You'll only
   need
   to do this once.
   1. You might need to change `--` to `-` for all params in this request if it fails

```shell
openssl req \
--x509 \
--nodes \
--days 3650 \
--subj "/C=US/ST=HI/O=Terraformation/CN=localhost" \
--addext "subjectAltName=DNS:localhost" \
--newkey rsa:2048 \
--keyout self-signed.key \
--out self-signed.crt
```

2. Figure out the server URL you want to use, e.g., `https://terraware.io` for production.
3. Set `PUBLIC_TERRAWARE_API` to that URL in the `.env` file in the repo root directory.
4. Start (or restart) the Node dev server, e.g., by running `yarn start:dev` in the repo
   root directory.
5. In this directory, run `docker compose up -d`.
   1. Or alternatively from the top level run `yarn run docker:remote-be:start`.
6. Point your browser at `https://localhost/` (HTTPS and no port number).
7. Accept the self-signed certificate. In Chrome, you'd click the "Advanced" button on the
   warning message, then click the "Proceed" link. You should only need to do this once;
   the browser will remember the certificate.

Now you should be able to log in and use the web app.

When you're done, you can run `docker compose down` in this directory to shut down the HTTPS
proxy (or `yarn run docker:remote-be:stop`).

You don't need to run the HTTPS proxy if you're testing with a local terraware-server instance;
in that case you can point your browser at Node's HTTP listen port (`http://localhost:3000`).

# Local environment with production build using remote backend

**These instructions have only been tested on macOS**

Sometimes we may want to test things out locally against a production build using a remote backend.

After following the steps above to set up your localhost SSL cert, you can build and run a production version
of the frontend by following these steps:

```
# All commands below run from the repository root
## Build the site using `yarn`
yarn build

## Build the docker image
docker build --no-cache -t terraware-web-local-1 .

## Run the docker image (pointing to a staging environment)
docker run --env SERVER_URL=https://staging.yourdomain.com -p 80:80 -v "$(pwd)/build:/usr/share/nginx/html" terraware-web-local-1
```

A container with a production build of the React app is now running. The next step is to turn on the remote backend
proxy, but we
need to modify the SERVER_URL so that it points to our running FE app container. Add (or uncomment) these lines to the
`local-https`
service in the `docker-compose.yml` in this directory:

```
 environment:
   - 'SERVER_URL=http://host.docker.internal'
```

And then run `docker compose up -d`.

Now, when you visit https://localhost, we will load the FE through the production-build container. This application will
attempt to resolve any API requests to the `SERVER_URL` provided to the running `terraware-web-local-1`. The request
flow
should look like this:

```
browser ----> localhost
                 |
                 |
                 v
       terraware-web-local-1 ----> react app
                                      |
                                      |
                                      v
staging terraware <----- remote-backend_local-https_1
```

If you need to make changes to the production build, simply run `yarn build` again and your changes will be synced into
the running `terraware-web-local-1` container
