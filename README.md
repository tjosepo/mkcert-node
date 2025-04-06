# @mkcert/node

This is a JavaScript wrapper for
[mkcert](https://github.com/FiloSottile/mkcert).

## Installation

```
npm i -D @mkcert/node
```

## Command Line Interface

In a project with @mkcert/node installed, you can use the `mkcert` binary in
your npm scripts, or run it directly with `npx mkcert`.

```json
{
  "scripts": {
    "generate-certs": "mkcert -key-file key.pem -cert-file cert.pem example.com *.example.com"
  }
}
```

You can run `npx mkcert -help` to view options.

## JavaScript API

You can generate certificates using a JavaScript API.

```js
import * as mkcert from "@mkcert/node";

await mkcert.generate({
  hosts: ["localhost"],
  certFile: "./cert.pem",
  keyFile: "./key.pem"
  install: true,
});
```

### `install` / `installSync`

Install the local CA in the system trust store.

### `uninstall` / `uninstallSync`

Uninstall the local CA (but do not delete it).

### `generate` / `generateSync`

Generate a certificate.

### `caroot` / `carootSync`

Print the CA certificate and key storage location.

## Usage with Node.js

Node does not use the system root store, so it won't accept mkcert certificates
automatically. Instead, you will have to set the `NODE_EXTRA_CA_CERTS`
environment variable.

```bash
export NODE_EXTRA_CA_CERTS="$(npx mkcert -CAROOT)/rootCA.pem"
```
