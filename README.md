# mkcert-node

This is a JavaScript wrapper for mkcert. See https://github.com/FiloSottile/mkcert

## Install mkcert-node

First, download and install the mkcert command locally.

```
npm install -D @tjosepo/mkcert
```

## Script

To generate a certificate, you can add a script to your `package.json` file like this:

```json
{
  "scripts": {
    "generate-certs": "mkcert -install localhost"
  }
}
```

The `mkcert` command will invoke the mkcert executable.

## JavaScript API

For more sophisticated uses, you will likely want to generate the certificates
using a JavaScript API. That might look like this:

```js
import { mkdir } from "node:fs/promises";
import * as mkcert from "@tjosepo/mkcert";

await mkdir("./certs");
await mkcert.generate({
  hosts: ["localhost"],
  certFile: "./certs/certificate.pem",
  keyFile: "./certs/key.pem"
});
```

The `generate` function runs the mkcert executable in a child process and
returns a promise that resolves when the generation is complete. There is also
a `generateSync` API that is not asynchronous.