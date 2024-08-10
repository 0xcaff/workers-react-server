import { DurableObject } from "cloudflare:workers";

export class HitCounter extends DurableObject {
  async getCount() {
    const count = (await this.ctx.storage.get<number>("count")) ?? 0;
    await this.ctx.storage.put("count", count + 1);
    return count;
  }
}
