# workers-react-server

Demo of using React Server Components and Server Side Rendering inside
Cloudflare Workers.

## running

```
$ yarn run dev
```

## why

Maybe you'd like to use React Server Components without attaching yourself to a
framework like NextJS. Maybe you want to have some of the features of Vercel
without the lock in or cost.

## how it works

A server bundle is built starting from worker.ts. This bundle imports page.tsx,
containing the root of the React tree. In this bundle, at any point a client
module (ending in `.client.tsx`) is imported, it is replaced with a placeholder
module.

On initial render, react-dom/server's `renderToString` is used to populate the
application shell. This will stop at the first suspense boundary, returning the
fallback. There are many possible points which you might want to complete the
SSR render, tweak this based on what makes sense for your application.

Client renders are handled using react server components. On the server a stream
is initialized with `react-server-dom-webpack/client`'s
`renderToReadableStream`. On the client, this stream is asynchronously hydrated
with `createFromFetch`.

## server actions

NextJS implements server actions almost completely in user-land. Whenever a
server action is passed to a client component, it is replaced with a
placeholder. The placeholder calls a function on the client which passes data to
the rsc endpoint (`/render` in this application) and replaces the root
component with the response.

I didn't implement it here because though server actions are convenient, they
don't seem to handle authentication and the scope capture rules seem easy to get
wrong.

## under the hood

First, we build a server bundle starting with entrypoint workers.ts

https://github.com/0xcaff/workers-react-server/blob/20f4bef9356df59e3305b04fe0a54a8e2f152cb5/scripts/build.ts#L11-L53

Whenever we encounter an import of a client component, we replace the contents
of the import with a stub which marks the component as a client component.

https://github.com/0xcaff/workers-react-server/blob/20f4bef9356df59e3305b04fe0a54a8e2f152cb5/scripts/build.ts#L30-L47

Next, we build a client bundle for each client component along with the client
shell bootstrap.

https://github.com/0xcaff/workers-react-server/blob/20f4bef9356df59e3305b04fe0a54a8e2f152cb5/scripts/build.ts#L55-L64

Finally, we tie the client bundle identifiers to the client bundles here

https://github.com/0xcaff/workers-react-server/blob/20f4bef9356df59e3305b04fe0a54a8e2f152cb5/src/worker.ts#L17-L38

When a user visits the app, they will first see this index.html

https://github.com/0xcaff/workers-react-server/blob/20f4bef9356df59e3305b04fe0a54a8e2f152cb5/src/worker.ts#L51-L66

The shell will be initialized:

https://github.com/0xcaff/workers-react-server/blob/20f4bef9356df59e3305b04fe0a54a8e2f152cb5/src/client.ts#L14-L18

render will run

https://github.com/0xcaff/workers-react-server/blob/20f4bef9356df59e3305b04fe0a54a8e2f152cb5/src/worker.ts#L16-L48

and the tree will be populated as the tree streams down with any client modules
being imported and mounted

https://github.com/0xcaff/workers-react-server/blob/20f4bef9356df59e3305b04fe0a54a8e2f152cb5/src/client.ts#L12

## limitations

* A single typescript config is applied over the entire project preventing
  typescript from checking for invalid usages of client APIs on server and
  vice-versa. Client and server types are both available everywhere instead of
  just where they can be used.

* for .client.tsx files, only default exports are supported

## inspiration

* https://github.com/bholmesdev/simple-rsc
* https://github.com/reactjs/server-components-demo
* https://react.dev/reference/react-dom/server/renderToReadableStream
* next js server actions entrypoint https://github.com/vercel/next.js/blob/939251bf65633c6b330bdcd6476e651bbc16efa2/packages/next/src/client/app-call-server.ts#L27-L42