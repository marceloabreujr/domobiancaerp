CREATE TABLE `construction_checklist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clConstructionId` int NOT NULL,
	`clCategoryId` int NOT NULL,
	`clSupplyItemId` int NOT NULL,
	`clIsChecked` boolean DEFAULT false,
	`clCheckedBy` int,
	`clCheckedAt` timestamp,
	`clNotes` text,
	`clCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `construction_checklist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `construction_supply_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`csiConstructionId` int NOT NULL,
	`csiCategoryId` int NOT NULL,
	`csiSupplyItemId` int NOT NULL,
	`csiQuantity` decimal(12,2),
	`csiUnit` varchar(20) DEFAULT 'un',
	`csiClosedValue` decimal(14,2),
	`csiNotes` text,
	`csiCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`csiUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `construction_supply_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supply_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scCode` varchar(10) NOT NULL,
	`scName` varchar(255) NOT NULL,
	`scCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supply_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supply_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sfConstructionId` int NOT NULL,
	`sfCategoryId` int NOT NULL,
	`sfFileName` varchar(255) NOT NULL,
	`sfFileUrl` text NOT NULL,
	`sfFileKey` varchar(512),
	`sfUploadedBy` varchar(255),
	`sfUploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supply_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supply_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`siCategoryId` int NOT NULL,
	`siName` varchar(255) NOT NULL,
	`siCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supply_items_id` PRIMARY KEY(`id`)
);
