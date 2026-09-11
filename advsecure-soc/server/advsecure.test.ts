import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("advsecure.summary", () => {
  it("returns a stable command center telemetry contract", async () => {
    const ctx: TrpcContext = {
      user: undefined,
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const result = await appRouter.createCaller(ctx).advsecure.summary();

    expect(result).toEqual(expect.objectContaining({
      threatsDetected: expect.any(Number),
      packetsAnalyzed: expect.any(Number),
      averageRiskScore: expect.any(Number),
      modelAccuracy: expect.any(Number),
      ingestionStatus: "operational",
      activeModels: expect.any(Array),
      dataset: "CICIDS2017",
    }));
    expect(result.threatsDetected).toBeGreaterThanOrEqual(0);
    expect(result.modelAccuracy).toBeGreaterThan(0);
  });
});
