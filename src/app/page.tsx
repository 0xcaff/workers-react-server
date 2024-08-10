import React, { Suspense } from "react";
import Like from "./Like.client";
import { Env } from "../env";

async function PageContents({ env }: { env: Env }) {
  const durableObjectId = env.HIT_COUNTER.idFromName("fixed");
  const hitCounter = env.HIT_COUNTER.get(durableObjectId);
  const count = await hitCounter.getCount();

  return (
    <div>
      Global Count: {count}

      <br />

      Local Component: <Like />
    </div>
  );
}

export default async function Page({ env }: { env: Env }) {
  return (
    <>
      <h1>Page Title</h1>
      <Suspense fallback="Loading...">
        <PageContents env={env} />
      </Suspense>
    </>
  );
}
