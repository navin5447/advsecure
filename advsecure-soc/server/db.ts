import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { auditLogs, detections, InsertUser, modelRegistry, reports, trafficRuns, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date(); updateSet.lastSignedIn = values.lastSignedIn;
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listDetections(limit = 20) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(detections).orderBy(desc(detections.createdAt)).limit(limit);
}
export async function listAuditLogs(limit = 30) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
}
export async function listModels() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(modelRegistry).orderBy(desc(modelRegistry.createdAt));
}
export async function listReports(limit = 20) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(reports).orderBy(desc(reports.createdAt)).limit(limit);
}
export async function seedAdvSecureData() {
  const db = await getDb(); if (!db) return { seeded: false };
  const existingModels = await db.select().from(modelRegistry).limit(1);
  if (existingModels.length > 0) return { seeded: false };
  await db.insert(modelRegistry).values([
    { name: "XGBoost IDS", artifact: "base_xgboost.pkl", version: "v1.4.2", accuracy: "96.40", latencyMs: 8, stage: "production", isActive: true },
    { name: "Deep Neural Network", artifact: "base_dnn.keras", version: "v1.2.0", accuracy: "94.80", latencyMs: 42, stage: "research", isActive: true },
  ]);
  await db.insert(detections).values([
    { sourceIp: "10.44.18.93", targetAsset: "api-gateway-02", attackType: "Brute Force", riskScore: 98, model: "XGBoost", status: "blocked", confidence: "0.98" },
    { sourceIp: "172.16.4.21", targetAsset: "auth-service", attackType: "Credential Stuffing", riskScore: 91, model: "DNN", status: "blocked", confidence: "0.91" },
    { sourceIp: "10.44.6.108", targetAsset: "edge-proxy-01", attackType: "Port Scan", riskScore: 77, model: "XGBoost", status: "review", confidence: "0.77" },
    { sourceIp: "185.220.101.4", targetAsset: "vpn-east-01", attackType: "Anomalous Flow", riskScore: 68, model: "DNN", status: "monitor", confidence: "0.68" },
  ]);
  await db.insert(auditLogs).values([{ event: "AdvSecure data plane initialized", actor: "system/bootstrap", detail: "Models, detections, and audit trail seeded", kind: "SYSTEM" }]);
  return { seeded: true };
}
