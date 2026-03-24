CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`cpfCnpj` varchar(20),
	`email` varchar(320),
	`phone` varchar(20),
	`phone2` varchar(20),
	`address` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `owners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`cpfCnpj` varchar(20),
	`email` varchar(320),
	`phone` varchar(20),
	`phone2` varchar(20),
	`address` text,
	`bankName` varchar(128),
	`bankAgency` varchar(20),
	`bankAccount` varchar(30),
	`pixKey` varchar(255),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `owners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(20),
	`title` varchar(255) NOT NULL,
	`ownership` enum('domobianca','terceiros') NOT NULL DEFAULT 'domobianca',
	`propertyType` enum('residencial','apartamento','galpao','sala_comercial','lote','casa','cobertura','kitnet','outro') NOT NULL DEFAULT 'residencial',
	`status` enum('disponivel','alugado','a_venda','vendido','arquivado') NOT NULL DEFAULT 'disponivel',
	`ownerId` int,
	`street` varchar(255),
	`number` varchar(20),
	`complement` varchar(128),
	`neighborhood` varchar(128),
	`city` varchar(128),
	`state` varchar(2),
	`zipCode` varchar(10),
	`area` decimal(10,2),
	`bedrooms` int,
	`bathrooms` int,
	`parkingSpots` int,
	`suites` int,
	`rentValue` decimal(12,2),
	`saleValue` decimal(14,2),
	`condoFee` decimal(10,2),
	`iptuValue` decimal(10,2),
	`adminFeePercent` decimal(5,2),
	`saleCommissionPercent` decimal(5,2),
	`description` text,
	`features` text,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`month` int NOT NULL,
	`year` int NOT NULL,
	`item` varchar(255) NOT NULL,
	`isChecked` boolean DEFAULT false,
	`notes` text,
	`checkedBy` int,
	`checkedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `property_checklists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `property_todos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`propertyId` int,
	`dueDate` date,
	`priority` enum('baixa','media','alta') NOT NULL DEFAULT 'media',
	`isCompleted` boolean DEFAULT false,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `property_todos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rental_contracts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`tenantId` int NOT NULL,
	`occupantName` varchar(255),
	`occupantCpf` varchar(14),
	`startDate` date NOT NULL,
	`endDate` date,
	`leaseTerm` enum('mensal','trimestral','semestral','anual','2_anos','3_anos') NOT NULL DEFAULT 'anual',
	`rentAmount` decimal(12,2) NOT NULL,
	`condoIncluded` boolean DEFAULT false,
	`iptuIncluded` boolean DEFAULT false,
	`isPackage` boolean DEFAULT false,
	`packageTotal` decimal(12,2),
	`adjustmentIndex` enum('igpm','ipca','inpc','nenhum') NOT NULL DEFAULT 'igpm',
	`billingDay` int DEFAULT 10,
	`lateFeePercent` decimal(5,2) DEFAULT '2.00',
	`dailyInterestPercent` decimal(5,4) DEFAULT '0.0333',
	`contractStatus` enum('ativo','encerrado','pendente','rescindido') NOT NULL DEFAULT 'ativo',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rental_contracts_id` PRIMARY KEY(`id`)
);
