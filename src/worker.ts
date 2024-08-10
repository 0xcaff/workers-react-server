// @ts-ignore
import * as ReactServerDom from "react-server-dom-webpack/server.edge";
import Page from "./app/page";
import React from "react";
import dedent from "dedent";
import manifestJSON from "__STATIC_CONTENT_MANIFEST";
import { getAssetFromKV } from "@cloudflare/kv-asset-handler";
import { Env } from "./env";

const assetManifest = JSON.parse(manifestJSON);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    switch (url.pathname) {
      case "/render": {
        const clientAssets = Object.fromEntries(
          Object.keys(assetManifest)
            .filter((it) => it.endsWith(".client.js"))
            .map((key) => [
              key.slice(0, -".js".length),
              {
                id: `/${key}`,
                name: "default",
                chunks: [],
                async: true,
              },
            ]),
        );

        const Component = React.createElement(Page, {
          env,
        });

        const stream = ReactServerDom.renderToReadableStream(
          Component,
          clientAssets,
        );
        return new Response(stream, {
          // Required to ensure response streams. If not specified, Workers
          // waits for response to complete before sending the first bytes to
          // client.
          headers: {
            "content-type": "text/plain;charset=UTF-8",
            "content-encoding": "identity",
          },
        });
      }

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

export { HitCounter } from "./HitCounter";
