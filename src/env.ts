import { HitCounter } from "./HitCounter";

export interface Env {
  HIT_COUNTER: DurableObjectNamespace<HitCounter>;
  __STATIC_CONTENT: KVNamespace;
}
