CREATE TABLE `course_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Nova' NOT NULL,
	`created_at` text NOT NULL,
	`contacted_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE `appointments` ADD `source` text DEFAULT 'painel' NOT NULL;--> statement-breakpoint
ALTER TABLE `services` ADD `online_booking` integer DEFAULT true NOT NULL;--> statement-breakpoint
-- Curso e "outros" não são marcados pelo site (a Thaise pode mudar no painel).
UPDATE `services` SET `online_booking` = 0 WHERE `name` IN ('Cursos de micropigmentação', 'Outros procedimentos estéticos');
