# Local environment using remote backend

Ordinarily, you'll run a local copy of terraware-server, perhaps using the `docker-compose.yml`
in the parent directory, and the Node server that's launched by `yarn start` will forward API
requests to that server.

However, sometimes it's useful to run a local frontend dev environment but send API requests to
a remote backend, e.g., if you want to test how a UI change works with a real-world data set.
Here's how to set that up using Docker Desktop on MacOS.

1. Figure out the server URL you want to use, e.g., `https://terraware.io` for production.
2. Set `REACT_APP_TERRAWARE_API` to that URL in the `.env` file in the repo root directory.
3. Start (or restart) the Node dev server, e.g., by running `yarn start:dev` in the repo
   root directory.
4. In this directory, run `docker-compose up -d`.
5. Point your browser at `https://localhost/` (HTTPS and no port number).
6. Accept the self-signed certificate. In Chrome, you'd click the "Advanced" button on the
   warning message, then click the "Proceed" link. You should only need to do this once;
   the browser will remember the certificate.

Now you should be able to log in and use the web app.

When you're done, you can run `docker-compose down` in this directory to shut down the HTTPS
proxy.

You don't need to run the HTTPS proxy if you're testing with a local terraware-server instance;
in that case you can point your browser at Node's HTTP listen port (`http://localhost:3000`).

## Generating a new self-signed certificate

The certificate in this directory should be good until 2033, but if you need to make a new
one, you can do it with the `openssl` command-line utility. Here's the command that was used
to generate the existing certificate:

```
openssl req \
    -x509 \
    -nodes \
    -days 3650 \
    -subj "/C=US/ST=HI/O=Terraformation/CN=localhost" \
    -addext "subjectAltName=DNS:localhost" \
    -newkey rsa:2048 \
    -keyout self-signed.key \
    -out self-signed.crt
```
