CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event` varchar(255) NOT NULL,
	`actor` varchar(128) NOT NULL,
	`detail` text,
	`kind` enum('MODEL','ACTION','DATA','LAB','AUTH','SYSTEM') NOT NULL DEFAULT 'SYSTEM',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `detections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`runId` int,
	`sourceIp` varchar(64) NOT NULL,
	`targetAsset` varchar(128) NOT NULL,
	`attackType` varchar(128) NOT NULL,
	`riskScore` int NOT NULL,
	`model` varchar(64) NOT NULL,
	`status` enum('blocked','review','monitor','resolved') NOT NULL DEFAULT 'review',
	`confidence` decimal(5,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `detections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `model_registry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(128) NOT NULL,
	`artifact` varchar(255) NOT NULL,
	`version` varchar(64) NOT NULL,
	`accuracy` decimal(5,2) NOT NULL,
	`latencyMs` int NOT NULL,
	`stage` enum('production','research','archived') NOT NULL DEFAULT 'research',
	`isActive` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `model_registry_id` PRIMARY KEY(`id`),
	CONSTRAINT `model_registry_artifact_unique` UNIQUE(`artifact`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`type` varchar(64) NOT NULL,
	`status` enum('queued','ready','failed') NOT NULL DEFAULT 'queued',
	`fileUrl` text,
	`requestedBy` varchar(128) NOT NULL DEFAULT 'system/demo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `traffic_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(128) NOT NULL,
	`filename` varchar(255),
	`rows` int NOT NULL DEFAULT 0,
	`threats` int NOT NULL DEFAULT 0,
	`status` enum('queued','processing','completed','failed') NOT NULL DEFAULT 'queued',
	`model` varchar(64) NOT NULL DEFAULT 'base_xgboost.pkl',
	`createdBy` varchar(128) NOT NULL DEFAULT 'system/demo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `traffic_runs_id` PRIMARY KEY(`id`)
);
