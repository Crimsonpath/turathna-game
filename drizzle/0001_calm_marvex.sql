CREATE TABLE `cultural_packs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`name_ar` varchar(100),
	`description` text,
	`icon_url` varchar(500),
	`is_premium` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cultural_packs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_rooms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`room_code` varchar(6) NOT NULL,
	`host_user_id` int NOT NULL,
	`status` enum('lobby','playing','finished') NOT NULL DEFAULT 'lobby',
	`current_round` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `game_rooms_id` PRIMARY KEY(`id`),
	CONSTRAINT `game_rooms_room_code_unique` UNIQUE(`room_code`)
);
--> statement-breakpoint
CREATE TABLE `player_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`game_room_id` int NOT NULL,
	`player_id` int NOT NULL,
	`question_id` int NOT NULL,
	`round_number` int NOT NULL,
	`answer` varchar(500),
	`is_correct` int,
	`points_earned` int NOT NULL DEFAULT 0,
	`answered_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `player_answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `players` (
	`id` int AUTO_INCREMENT NOT NULL,
	`game_room_id` int NOT NULL,
	`team_id` int,
	`user_id` int,
	`player_name` varchar(100) NOT NULL,
	`is_ready` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `players_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cultural_pack_id` int NOT NULL,
	`question_text` text NOT NULL,
	`question_text_ar` text,
	`question_type` enum('multiple_choice','numerical','find_link') NOT NULL,
	`correct_answer` varchar(500) NOT NULL,
	`options` text,
	`options_ar` text,
	`difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`game_room_id` int NOT NULL,
	`team_name` varchar(50) NOT NULL,
	`home_culture` varchar(50),
	`exchange_culture` varchar(50),
	`score` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
