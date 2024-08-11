import { hydrateRoot } from "react-dom/client";
// @ts-ignore
import { createFromFetch } from "react-server-dom-webpack/client";

declare global {
  interface Window {
    __webpack_require__: (id: string) => Promise<any>;
  }
}

// HACK: map webpack resolution to native ESM
window.__webpack_require__ = async (id) => import(id);

createFromFetch(fetch("/render")).then((comp: any) => {
  hydrateRoot(document.getElementById("root")!, comp);
});
