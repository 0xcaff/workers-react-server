# workers-react-server

Demo of using React Server Components and Server Rendering inside Cloudflare
Workers.

## why

maybe you'd like to use react server components without attaching yourself to a
framework like nextjs. maybe you want to have some of the features of vercel
without the lock in or cost.

## how

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
becoming imported and hydrated

https://github.com/0xcaff/workers-react-server/blob/20f4bef9356df59e3305b04fe0a54a8e2f152cb5/src/client.ts#L12

## limitations

* A single typescript config is applied over the entire project preventing
  typescript from checking for invalid usages of client APIs on server and
  vice-versa. Client and server types are both available everywhere instead of
  just where they can be used.

* server actions not supported. It is not entirely clear to me currently how
  nextjs implements this.

* for .client.tsx files, only default exports are supported as an export.
