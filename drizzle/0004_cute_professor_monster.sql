ALTER TABLE `properties` MODIFY COLUMN `status` enum('disponivel_locacao','disponivel_venda','alugado','vendido','arquivado') NOT NULL DEFAULT 'disponivel_locacao';--> statement-breakpoint
ALTER TABLE `rental_contracts` ADD `adjustmentValue` decimal(12,2);--> statement-breakpoint
ALTER TABLE `rental_contracts` ADD `nextAdjustmentDate` date;