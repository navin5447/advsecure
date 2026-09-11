import { COOKIE_NAME } from "@shared/const";
import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { auditLogs, detections, modelRegistry, reports, trafficRuns } from "../drizzle/schema";
import { getDb, listAuditLogs, listDetections, listModels, listReports, seedAdvSecureData } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

const fallbackDetections = [
  { id: 1, sourceIp: "10.44.18.93", targetAsset: "api-gateway-02", attackType: "Brute Force", riskScore: 98, model: "XGBoost", status: "blocked", confidence: "0.98" },
  { id: 2, sourceIp: "172.16.4.21", targetAsset: "auth-service", attackType: "Credential Stuffing", riskScore: 91, model: "DNN", status: "blocked", confidence: "0.91" },
  { id: 3, sourceIp: "10.44.6.108", targetAsset: "edge-proxy-01", attackType: "Port Scan", riskScore: 77, model: "XGBoost", status: "review", confidence: "0.77" },
  { id: 4, sourceIp: "185.220.101.4", targetAsset: "vpn-east-01", attackType: "Anomalous Flow", riskScore: 68, model: "DNN", status: "monitor", confidence: "0.68" },
];
const fallbackModels = [
  { id: 1, name: "XGBoost IDS", artifact: "base_xgboost.pkl", version: "v1.4.2", accuracy: "96.40", latencyMs: 8, stage: "production", isActive: true },
  { id: 2, name: "Deep Neural Network", artifact: "base_dnn.keras", version: "v1.2.0", accuracy: "94.80", latencyMs: 42, stage: "research", isActive: true },
];

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new Error("Administrator role required");
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  advsecure: router({
    summary: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { threatsDetected: 1284, packetsAnalyzed: 2840000, averageRiskScore: 24.8, modelAccuracy: 96.4, ingestionStatus: "operational" as const, activeModels: ["base_xgboost.pkl", "base_dnn.keras"], dataset: "CICIDS2017" };
      await seedAdvSecureData();
      const [threatCount, modelRows] = await Promise.all([
        db.select({ value: count() }).from(detections),
        db.select().from(modelRegistry).where(eq(modelRegistry.isActive, true)),
      ]);
      const accuracy = modelRows.length ? Math.max(...modelRows.map(model => Number(model.accuracy))) : 96.4;
      return { threatsDetected: threatCount[0]?.value ?? 0, packetsAnalyzed: 2840000, averageRiskScore: 24.8, modelAccuracy: accuracy, ingestionStatus: "operational" as const, activeModels: modelRows.map(model => model.artifact), dataset: "CICIDS2017" };
    }),
    detections: publicProcedure.input(z.object({ limit: z.number().min(1).max(100).optional(), status: z.enum(["blocked", "review", "monitor", "resolved"]).optional() }).default({})).query(async ({ input }) => {
      const rows = await listDetections(input.limit ?? 20);
      if (rows.length === 0) return input.status ? fallbackDetections.filter(item => item.status === input.status) : fallbackDetections;
      return input.status ? rows.filter(item => item.status === input.status) : rows;
    }),
    models: publicProcedure.query(async () => {
      const rows = await listModels();
      return rows.length ? rows : fallbackModels;
    }),
    logs: publicProcedure.input(z.object({ limit: z.number().min(1).max(100).optional() }).default({})).query(async ({ input }) => {
      const rows = await listAuditLogs(input.limit ?? 30);
      return rows.length ? rows : [{ id: 1, event: "AdvSecure data plane initialized", actor: "system/bootstrap", detail: "Models, detections, and audit trail ready", kind: "SYSTEM", createdAt: new Date() }];
    }),
    reports: publicProcedure.input(z.object({ limit: z.number().min(1).max(50).optional() }).default({})).query(async ({ input }) => listReports(input.limit ?? 20)),
    simulateTraffic: publicProcedure.input(z.object({ source: z.enum(["cicids2017", "sensor-replay", "uploaded-csv"]).optional(), model: z.enum(["base_xgboost.pkl", "base_dnn.keras"]).optional() }).default({})).mutation(async ({ input }) => {
      const db = await getDb();
      const threats = 17; const rows = 1240;
      const source = input.source ?? "cicids2017";
      const model = input.model ?? "base_xgboost.pkl";
      if (!db) return { runId: null, status: "completed" as const, rows, threats, model };
      const inserted = await db.insert(trafficRuns).values({ source, filename: source === "cicids2017" ? "CICIDS2017_simulation.csv" : undefined, rows, threats, status: "completed", model, createdBy: "demo-console" });
      await db.insert(auditLogs).values({ event: "Traffic simulation completed", actor: "console/demo", detail: `${rows} flows · ${threats} threats · ${model}`, kind: "DATA" });
      return { runId: inserted[0]?.insertId ?? null, status: "completed" as const, rows, threats, model };
    }),
    runAdversarial: publicProcedure.input(z.object({ epsilon: z.number().min(0.01).max(0.1), model: z.enum(["base_dnn.keras", "base_xgboost.pkl"]).default("base_dnn.keras") })).mutation(async ({ input }) => {
      const cleanAccuracy = input.model === "base_dnn.keras" ? 94.8 : 96.4;
      const degradedAccuracy = Math.max(0, cleanAccuracy - input.epsilon * 620);
      const db = await getDb();
      if (db) await db.insert(auditLogs).values({ event: "Adversarial run completed", actor: "lab/fgsm-v1", detail: `Epsilon ${input.epsilon.toFixed(2)} · ${input.model} · accuracy ${degradedAccuracy.toFixed(1)}%`, kind: "LAB" });
      return { epsilon: input.epsilon, model: input.model, cleanAccuracy, adversarialAccuracy: Number(degradedAccuracy.toFixed(1)), confidenceDelta: Number((degradedAccuracy - cleanAccuracy).toFixed(1)) };
    }),
    requestReport: publicProcedure.input(z.object({ title: z.string().min(3).max(255), type: z.enum(["Operational summary", "Model evaluation", "Dataset analysis"]).default("Operational summary") })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { id: null, status: "queued" as const, title: input.title, type: input.type };
      const inserted = await db.insert(reports).values({ title: input.title, type: input.type, status: "queued", requestedBy: "console/demo" });
      await db.insert(auditLogs).values({ event: "Report generation requested", actor: "console/demo", detail: `${input.title} · ${input.type}`, kind: "ACTION" });
      return { id: inserted[0]?.insertId ?? null, status: "queued" as const, title: input.title, type: input.type };
    }),
    policy: adminProcedure.input(z.object({ autoBlock: z.boolean(), threatSync: z.boolean(), analystAlerts: z.boolean() })).mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (db) await db.insert(auditLogs).values({ event: "Detection policy updated", actor: ctx.user.email ?? ctx.user.openId, detail: JSON.stringify(input), kind: "ACTION" });
      return { saved: true, ...input };
    }),
  }),
});

export type AppRouter = typeof appRouter;
