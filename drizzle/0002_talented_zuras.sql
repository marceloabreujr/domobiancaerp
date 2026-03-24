CREATE TABLE `calendar_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`eventDate` date NOT NULL,
	`eventType` enum('vencimento_contrato','renovacao_licenca','manutencao','marco_projeto','reuniao','outro') NOT NULL,
	`relatedEntity` varchar(128),
	`relatedEntityId` int,
	`alertDaysBefore` int DEFAULT 7,
	`isCompleted` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calendar_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` enum('contrato','alvara','certidao','planta','foto','fatura','recibo','outro') NOT NULL,
	`description` text,
	`fileUrl` text,
	`fileKey` varchar(512),
	`fileName` varchar(255),
	`mimeType` varchar(128),
	`expiryDate` date,
	`relatedEntity` varchar(128),
	`relatedEntityId` int,
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`cpf` varchar(14),
	`email` varchar(320),
	`phone` varchar(20),
	`position` varchar(128),
	`department` varchar(128),
	`salary` decimal(12,2),
	`hireDate` date,
	`status` enum('ativo','ferias','afastado','desligado') NOT NULL DEFAULT 'ativo',
	`projectAllocation` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fleet` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plate` varchar(10) NOT NULL,
	`model` varchar(128) NOT NULL,
	`year` int,
	`status` enum('disponivel','em_uso','manutencao','inativo') NOT NULL DEFAULT 'disponivel',
	`assignedTo` varchar(255),
	`nextMaintenanceDate` date,
	`km` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fleet_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `petty_cash` (
	`id` int AUTO_INCREMENT NOT NULL,
	`description` varchar(255) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`type` enum('entrada','saida') NOT NULL,
	`category` varchar(128),
	`date` date NOT NULL,
	`receiptUrl` text,
	`receiptKey` varchar(512),
	`registeredBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `petty_cash_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supplies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` enum('escritorio','copa','limpeza','outro') NOT NULL DEFAULT 'outro',
	`currentStock` int DEFAULT 0,
	`minStock` int DEFAULT 5,
	`unit` varchar(32) DEFAULT 'un',
	`lastRestocked` date,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supplies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`category` enum('ti','manutencao','limpeza','seguranca','outro') NOT NULL DEFAULT 'outro',
	`priority` enum('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
	`status` enum('aberto','em_andamento','resolvido','fechado') NOT NULL DEFAULT 'aberto',
	`requestedBy` int,
	`assignedTo` varchar(255),
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `time_off` (
	`id` int AUTO_INCREMENT NOT NULL,
	`employeeId` int NOT NULL,
	`type` enum('ferias','falta_justificada','falta_injustificada','licenca','outro') NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`reason` text,
	`approved` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `time_off_id` PRIMARY KEY(`id`)
);
