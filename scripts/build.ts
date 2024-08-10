import * as esbuild from "esbuild";
import dedent from "dedent";
import { fileURLToPath } from "node:url";
import { relative } from "node:path";

const srcRoot = fileURLToPath(new URL("../src/", import.meta.url));

async function main() {
  const clientEntrypoints = new Set<string>();

  await esbuild.build({
    external: ["__STATIC_CONTENT_MANIFEST", "node:async_hooks"],
    bundle: true,
    sourcemap: true,
    outfile: "dist/backend/worker.js",
    format: "esm",
    entryPoints: ["src/worker.ts"],
    plugins: [
      {
        name: "react-server-components-server",
        setup(build) {
          build.onLoad(
            {
              filter: /\.client\.tsx/,
            },
            (args) => {
              const moduleId = relative(srcRoot, args.path);
              clientEntrypoints.add(moduleId);

              return {
                loader: "js",
                contents: dedent`
                  const func = () => {
                      throw new Error(
                          \`Attempted to call the default export of ${moduleId} from the server \` +
                          \`but it's on the client. It's not possible to invoke a client function from \` +
                          \`the server, it can only be rendered as a Component or passed to props of a \` +
                          \`Client Component.\`,
                      );
                  };
                  
                  export default Object.defineProperties(func, {
                      $$typeof: {value: Symbol.for('react.client.reference')},
                      $$id: {value: ${JSON.stringify(moduleId.replace(/\.tsx$/, ""))}}
                  });
                `,
              };
            },
          );
        },
      },
    ],
  });

  await esbuild.build({
    outdir: "dist/frontend",
    bundle: true,
    format: "esm",
    splitting: true,
    entryPoints: [
      "./src/client.ts",
      ...Array.from(clientEntrypoints).map((it) => `./src/${it}`),
    ],
  });
}

main();
