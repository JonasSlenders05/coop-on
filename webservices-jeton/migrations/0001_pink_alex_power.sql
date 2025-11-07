ALTER TABLE `events` DROP INDEX `idx_place_name_unique`;--> statement-breakpoint
ALTER TABLE `events` MODIFY COLUMN `startDatum` date NOT NULL;--> statement-breakpoint
ALTER TABLE `events` MODIFY COLUMN `eindDatum` date NOT NULL;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `idx_event_name_unique` UNIQUE(`naam`);