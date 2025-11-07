CREATE TABLE `events` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`naam` varchar(255) NOT NULL,
	`locatie` varchar(255) NOT NULL,
	`startDatum` date NOT NULL,
	`eindDatum` date NOT NULL,
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_event_name_unique` UNIQUE(`naam`)
);
