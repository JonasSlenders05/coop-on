CREATE TABLE `customers` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`firstname` varchar(255) NOT NULL,
	`lastname` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phonenumber` varchar(20) NOT NULL,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_customer_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_event_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`amount` int NOT NULL,
	`walletId` int unsigned NOT NULL,
	`vendorId` int unsigned NOT NULL,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`boothName` varchar(255) NOT NULL,
	`firstname` varchar(255),
	`lastname` varchar(255),
	`email` varchar(255) NOT NULL,
	`phonenumber` varchar(20) NOT NULL,
	CONSTRAINT `vendors_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_verkoper_name_unique` UNIQUE(`boothName`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`value` int unsigned NOT NULL DEFAULT 0,
	`status` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`customerId` int unsigned NOT NULL,
	`eventId` int unsigned NOT NULL,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_unique_wallet_per_customer_event` UNIQUE(`customerId`,`eventId`)
);
--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_walletId_wallets_id_fk` FOREIGN KEY (`walletId`) REFERENCES `wallets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_vendorId_vendors_id_fk` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_customerId_customers_id_fk` FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;