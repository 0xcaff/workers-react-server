import { createRoot } from "react-dom/client";
// @ts-ignore
import { createFromFetch } from "react-server-dom-webpack/client";

// HACK: map webpack resolution to native ESM
window.__webpack_require__ = async (id) => {
  return import(id);
};

// @ts-expect-error `root` might be null
const root = createRoot(document.getElementById("root"));

createFromFetch(fetch("/render")).then((comp) => {
  root.render(comp);
});
