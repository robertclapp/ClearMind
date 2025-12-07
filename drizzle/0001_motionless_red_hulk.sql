CREATE TABLE `automations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`trigger` text NOT NULL,
	`conditions` text,
	`actions` text NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `automations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageId` int NOT NULL,
	`parentBlockId` int,
	`type` varchar(50) NOT NULL,
	`content` text NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blocks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentType` enum('page','block','databaseItem') NOT NULL,
	`parentId` int NOT NULL,
	`content` text NOT NULL,
	`mentions` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`archived` boolean NOT NULL DEFAULT false,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `databaseItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`databaseId` int NOT NULL,
	`properties` text NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`archived` boolean NOT NULL DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `databaseItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `databaseViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`databaseId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('table','kanban','calendar','gallery','list','timeline') NOT NULL,
	`config` text NOT NULL,
	`position` int NOT NULL DEFAULT 0,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `databaseViews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `databases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`icon` varchar(50),
	`description` text,
	`schema` text NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `databases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moodEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`timestamp` timestamp NOT NULL,
	`moodValue` int,
	`moodEmoji` varchar(10),
	`notes` text,
	`linkedEventId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moodEntries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('mention','deadline','assignment','automation','collaboration') NOT NULL,
	`title` varchar(500) NOT NULL,
	`content` text,
	`linkType` varchar(50),
	`linkId` int,
	`read` boolean NOT NULL DEFAULT false,
	`delivered` boolean NOT NULL DEFAULT false,
	`deliveryMethod` enum('inApp','email','push') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pageShares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pageId` int NOT NULL,
	`userId` int,
	`permission` enum('view','edit','admin') NOT NULL,
	`shareToken` varchar(64),
	`password` varchar(255),
	`enabled` boolean NOT NULL DEFAULT true,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pageShares_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`parentId` int,
	`title` varchar(500) NOT NULL,
	`icon` varchar(50),
	`coverImage` varchar(500),
	`position` int NOT NULL DEFAULT 0,
	`archived` boolean NOT NULL DEFAULT false,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `syncMetadata` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int NOT NULL,
	`lastSyncedAt` timestamp NOT NULL,
	`version` int NOT NULL DEFAULT 0,
	`contentHash` varchar(64),
	CONSTRAINT `syncMetadata_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timelineEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`databaseItemId` int,
	`title` varchar(500) NOT NULL,
	`startTime` timestamp NOT NULL,
	`estimatedDuration` int,
	`actualDuration` int,
	`color` varchar(20),
	`icon` varchar(50),
	`completed` boolean NOT NULL DEFAULT false,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timelineEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`icon` varchar(50),
	`ownerId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaces_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `sensoryProfile` enum('adhd','highContrast','dyslexia','lowStim','standard') DEFAULT 'adhd' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `notificationSettings` text;