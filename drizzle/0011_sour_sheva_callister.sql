CREATE TABLE `bank_imports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`biFileName` varchar(255) NOT NULL,
	`biImportDate` timestamp NOT NULL DEFAULT (now()),
	`biTotalRows` int DEFAULT 0,
	`biConciliatedRows` int DEFAULT 0,
	`biPendingRows` int DEFAULT 0,
	`biStatus` enum('pendente','parcial','concluido') NOT NULL DEFAULT 'pendente',
	`biImportedBy` int,
	`biCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bank_imports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bank_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`btBankImportId` int NOT NULL,
	`btTransactionDate` date NOT NULL,
	`btDescription` varchar(500) NOT NULL,
	`btAmount` decimal(14,2) NOT NULL,
	`btTransactionId` varchar(255),
	`btStatus` enum('pendente','conciliado','ignorado','manual') NOT NULL DEFAULT 'pendente',
	`btMatchedEntryId` int,
	`btSuggestedEntryId` int,
	`btSuggestedCategory` varchar(128),
	`btNotes` text,
	`btCreatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bank_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`finType` enum('entrada','saida') NOT NULL,
	`finCategory` enum('aluguel','condominio','iptu','venda','manutencao','comissao','taxa_admin','seguro','agua','luz','gas','internet','material','mao_de_obra','outros') NOT NULL DEFAULT 'outros',
	`finDescription` varchar(500) NOT NULL,
	`finAmount` decimal(14,2) NOT NULL,
	`finDueDate` date NOT NULL,
	`finPaymentDate` date,
	`finStatus` enum('aberto','pago','cancelado','atrasado') NOT NULL DEFAULT 'aberto',
	`finPropertyId` int,
	`finConstructionId` int,
	`finCostCenter` varchar(255) DEFAULT 'administracao_central',
	`finRentalContractId` int,
	`finCsvTransactionId` varchar(255),
	`finIsConciliated` boolean DEFAULT false,
	`finConciliationId` int,
	`finRecurringBillId` int,
	`finInstallmentNumber` int,
	`finTotalInstallments` int,
	`finLateFee` decimal(12,2),
	`finInterestAmount` decimal(12,2),
	`finNotes` text,
	`finCreatedBy` int,
	`finCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`finUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recurring_bills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rbTitle` varchar(255) NOT NULL,
	`rbCategory` enum('iptu','condominio','seguro','agua','luz','gas','internet','outros') NOT NULL,
	`rbType` enum('entrada','saida') NOT NULL DEFAULT 'saida',
	`rbAmount` decimal(14,2) NOT NULL,
	`rbPropertyId` int,
	`rbCostCenter` varchar(255) DEFAULT 'administracao_central',
	`rbInscricao` varchar(50),
	`rbFrequency` enum('mensal','bimestral','trimestral','semestral','anual') NOT NULL DEFAULT 'mensal',
	`rbBillingDay` int DEFAULT 10,
	`rbStartDate` date NOT NULL,
	`rbEndDate` date,
	`rbIsActive` boolean NOT NULL DEFAULT true,
	`rbLastGeneratedDate` date,
	`rbNotes` text,
	`rbCreatedBy` int,
	`rbCreatedAt` timestamp NOT NULL DEFAULT (now()),
	`rbUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recurring_bills_id` PRIMARY KEY(`id`)
);
