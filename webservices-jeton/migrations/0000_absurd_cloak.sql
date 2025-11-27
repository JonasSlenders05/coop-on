CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	`organiserId` int NOT NULL,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_event_name` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `organisers` (
	`userId` int NOT NULL,
	`organisation` varchar(255) NOT NULL,
	CONSTRAINT `uniq_organiser_userId` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` timestamp NOT NULL DEFAULT (now()),
	`amount` int NOT NULL,
	`walletId` int NOT NULL,
	`vendorId` int NOT NULL,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstname` varchar(255) NOT NULL,
	`lastname` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phonenumber` varchar(20) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`public_roles` json NOT NULL,
	`private_roles` json NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_user_email` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `vendors` (
	`boothName` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	CONSTRAINT `uniq_vendor_userId` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`value` int unsigned NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`userId` int NOT NULL,
	`eventId` int NOT NULL,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `uniq_wallet_per_customer_event` UNIQUE(`userId`,`eventId`)
);
--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_organiserId_organisers_userId_fk` FOREIGN KEY (`organiserId`) REFERENCES `organisers`(`userId`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organisers` ADD CONSTRAINT `organisers_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_walletId_wallets_id_fk` FOREIGN KEY (`walletId`) REFERENCES `wallets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_vendorId_vendors_userId_fk` FOREIGN KEY (`vendorId`) REFERENCES `vendors`(`userId`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vendors` ADD CONSTRAINT `vendors_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_eventId_events_id_fk` FOREIGN KEY (`eventId`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;