import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const trafficRuns = mysqlTable("traffic_runs", {
  id: int("id").autoincrement().primaryKey(),
  source: varchar("source", { length: 128 }).notNull(),
  filename: varchar("filename", { length: 255 }),
  rows: int("rows").default(0).notNull(),
  threats: int("threats").default(0).notNull(),
  status: mysqlEnum("status", ["queued", "processing", "completed", "failed"]).default("queued").notNull(),
  model: varchar("model", { length: 64 }).default("base_xgboost.pkl").notNull(),
  createdBy: varchar("createdBy", { length: 128 }).default("system/demo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const detections = mysqlTable("detections", {
  id: int("id").autoincrement().primaryKey(),
  runId: int("runId"),
  sourceIp: varchar("sourceIp", { length: 64 }).notNull(),
  targetAsset: varchar("targetAsset", { length: 128 }).notNull(),
  attackType: varchar("attackType", { length: 128 }).notNull(),
  riskScore: int("riskScore").notNull(),
  model: varchar("model", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["blocked", "review", "monitor", "resolved"]).default("review").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const modelRegistry = mysqlTable("model_registry", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  artifact: varchar("artifact", { length: 255 }).notNull().unique(),
  version: varchar("version", { length: 64 }).notNull(),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }).notNull(),
  latencyMs: int("latencyMs").notNull(),
  stage: mysqlEnum("stage", ["production", "research", "archived"]).default("research").notNull(),
  isActive: boolean("isActive").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["queued", "ready", "failed"]).default("queued").notNull(),
  fileUrl: text("fileUrl"),
  requestedBy: varchar("requestedBy", { length: 128 }).default("system/demo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  event: varchar("event", { length: 255 }).notNull(),
  actor: varchar("actor", { length: 128 }).notNull(),
  detail: text("detail"),
  kind: mysqlEnum("kind", ["MODEL", "ACTION", "DATA", "LAB", "AUTH", "SYSTEM"]).default("SYSTEM").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type TrafficRun = typeof trafficRuns.$inferSelect;
export type Detection = typeof detections.$inferSelect;
export type ModelRegistryItem = typeof modelRegistry.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
