CREATE TABLE `business_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`negocioId` int,
	`taskTitle` varchar(255) NOT NULL,
	`taskDescription` text,
	`taskDueDate` date NOT NULL,
	`taskPriority` enum('normal','urgente') NOT NULL DEFAULT 'normal',
	`taskIsCompleted` boolean DEFAULT false,
	`taskCompletedAt` timestamp,
	`taskCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `business_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `captadores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`partnerType` enum('corretor','advogado','investidor','permutario','outros') NOT NULL DEFAULT 'corretor',
	`phone` varchar(20),
	`email` varchar(320),
	`cpfCnpj` varchar(20),
	`defaultCommission` decimal(5,2) DEFAULT '5.00',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `captadores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `negocios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`negOwnership` enum('proprio','terceiros') NOT NULL DEFAULT 'proprio',
	`captadorId` int,
	`address` text,
	`negCity` varchar(128),
	`negState` varchar(2),
	`phase` enum('prospeccao','analise','negociacao','due_diligence','aprovado','fechado','cancelado') NOT NULL DEFAULT 'prospeccao',
	`operationType` enum('compra','venda','permuta','incorporacao','loteamento','reforma','outro') NOT NULL DEFAULT 'compra',
	`negPriority` enum('baixa','media','alta','urgente') NOT NULL DEFAULT 'media',
	`totalArea` decimal(12,2),
	`usableArea` decimal(12,2),
	`zoning` varchar(128),
	`constructivePotential` decimal(8,2),
	`opportunityCost` decimal(14,2),
	`marketValue` decimal(14,2),
	`maxInvestment` decimal(14,2),
	`estimatedVGV` decimal(14,2),
	`tirPercent` decimal(8,2),
	`profitMarginPercent` decimal(8,2),
	`documentationStatus` text,
	`nextAction` text,
	`nextActionPriority` enum('normal','urgente') DEFAULT 'normal',
	`nextActionDate` date,
	`isArchived` boolean DEFAULT false,
	`negNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `negocios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `viabilidade` (
	`id` int AUTO_INCREMENT NOT NULL,
	`negocioId` int NOT NULL,
	`landCost` decimal(14,2) DEFAULT '0',
	`constructionCost` decimal(14,2) DEFAULT '0',
	`indirectCosts` decimal(14,2) DEFAULT '0',
	`taxes` decimal(14,2) DEFAULT '0',
	`commissions` decimal(14,2) DEFAULT '0',
	`totalCost` decimal(14,2),
	`netProfit` decimal(14,2),
	`profitMargin` decimal(8,2),
	`tir` decimal(8,2),
	`roi` decimal(8,2),
	`viabilityStatus` enum('verde','amarelo','vermelho') DEFAULT 'amarelo',
	`viabNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `viabilidade_id` PRIMARY KEY(`id`)
);
