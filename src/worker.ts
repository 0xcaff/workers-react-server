// @ts-ignore
import * as ReactServerDom from "react-server-dom-webpack/server.edge";
import Page from "./app/page";
import React from "react";
import dedent from "dedent";
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
import { getAssetFromKV } from "@cloudflare/kv-asset-handler";

const assetManifest = JSON.parse(manifestJSON);

interface Env {
  __STATIC_CONTENT: KVNamespace;
}

export default {
  async fetch(request, env, ctx) {
    console.log(assetManifest);
    const url = new URL(request.url);
    switch (url.pathname) {
      case "/": {
        return new Response(
          dedent`
                <!DOCTYPE html>
	            <html>
	            <body>
	            	<div id="root"></div>
	            	<script type="module" src="/client.js"></script>
	            </body>
	            </html>
            `,
          {
            headers: {
              "content-type": "text/html",
            },
          },
        );
      }

      case "/render": {
        const clientAssets = Object.fromEntries(
          Object.keys(assetManifest)
            .filter((it) => it.endsWith(".client.js"))
            .map((key) => [
              key.slice(0, -3),
              {
                id: `/${key}`,
                name: "default",
                chunks: [],
                async: true,
              },
            ]),
        );

        // @ts-ignore
        const Component = React.createElement(Page);
        const stream = ReactServerDom.renderToReadableStream(
          Component,
          clientAssets,
        );
        return new Response(stream, {
          headers: {
            "content-type": "text/plain;charset=UTF-8",
            "content-encoding": "identity",
          },
        });
      }

      default:
        return await getAssetFromKV(
          {
            request,
            waitUntil(promise) {
              return ctx.waitUntil(promise);
            },
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: assetManifest,
          },
        );
    }
  },
} satisfies ExportedHandler<Env>;
