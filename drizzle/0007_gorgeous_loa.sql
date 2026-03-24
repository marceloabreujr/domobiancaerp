CREATE TABLE `architects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`architectName` varchar(255) NOT NULL,
	`architectPhone` varchar(20),
	`architectEmail` varchar(320),
	`architectCpfCnpj` varchar(20),
	`architectSpecialty` varchar(255),
	`architectNotes` text,
	`architectCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`architectUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `architects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `construction_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imageConstructionId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`imageKey` varchar(512),
	`imageCaption` varchar(255),
	`imageUploadedBy` varchar(255),
	`imageUploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `construction_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `construction_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportConstructionId` int NOT NULL,
	`reportTitle` varchar(255) NOT NULL,
	`reportContent` text NOT NULL,
	`reportAuthor` varchar(255),
	`reportDate` date NOT NULL,
	`reportCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`reportUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `construction_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `construction_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`taskConstructionId` int,
	`cTaskTitle` varchar(255) NOT NULL,
	`cTaskDescription` text,
	`cTaskDueDate` date NOT NULL,
	`cTaskType` enum('marco','prazo_entrega','vistoria','reuniao','outro') NOT NULL DEFAULT 'outro',
	`cTaskIsCompleted` boolean DEFAULT false,
	`cTaskCompletedAt` timestamp,
	`cTaskCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `construction_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `constructions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`constructionTitle` varchar(255) NOT NULL,
	`constructionAddress` text,
	`constructionCity` varchar(128),
	`constructionState` varchar(2),
	`hasKey` boolean DEFAULT false,
	`contractorId` int,
	`architectId` int,
	`constructionType` enum('residencial','comercial','reforma','galpao','loteamento','outro') NOT NULL DEFAULT 'residencial',
	`constructionStatus` enum('em_andamento','paralisada','concluida') NOT NULL DEFAULT 'em_andamento',
	`constructionProgress` enum('avancada','em_dia','atrasada','totalmente_atrasada') NOT NULL DEFAULT 'em_dia',
	`constructionDescription` text,
	`constructionIsArchived` boolean DEFAULT false,
	`constructionStartDate` date,
	`constructionExpectedEndDate` date,
	`constructionCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`constructionUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `constructions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contractors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`contractorPhone` varchar(20),
	`contractorEmail` varchar(320),
	`contractorCpfCnpj` varchar(20),
	`contractorSpecialty` varchar(255),
	`contractorNotes` text,
	`contractorCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`contractorUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contractors_id` PRIMARY KEY(`id`)
);
