CREATE TABLE `accounts` (
	`email` text PRIMARY KEY NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'client' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `appointment_slots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`resource_key` text NOT NULL,
	`reservation_id` text NOT NULL,
	`appointment_id` integer,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `appointment_slots_unique` ON `appointment_slots` (`date`,`time`,`resource_key`);--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_email` text NOT NULL,
	`client_name` text NOT NULL,
	`service_id` integer NOT NULL,
	`service_name` text NOT NULL,
	`service_ids` text DEFAULT '' NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`duration_min` integer DEFAULT 30 NOT NULL,
	`status` text DEFAULT 'Pendente' NOT NULL,
	`admin_message` text DEFAULT '' NOT NULL,
	`total_cents` integer NOT NULL,
	`payment_method` text DEFAULT '' NOT NULL,
	`cash_transaction_id` integer,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `auth_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`window_start` text NOT NULL,
	`blocked_until` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`account_email` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `business_settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`monthly_goal_cents` integer DEFAULT 500000 NOT NULL,
	`loyalty_target` integer DEFAULT 10 NOT NULL,
	`loyalty_reward` text DEFAULT '1 atendimento grátis' NOT NULL,
	`opening_hours` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gallery_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`tag` text DEFAULT 'Antes e depois' NOT NULL,
	`alt` text NOT NULL,
	`image_key` text NOT NULL,
	`width` integer DEFAULT 1000 NOT NULL,
	`height` integer DEFAULT 1000 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `marketing_contacts` (
	`key` text PRIMARY KEY NOT NULL,
	`client_email` text NOT NULL,
	`campaign` text NOT NULL,
	`sent_at` text DEFAULT '' NOT NULL,
	`answered` integer DEFAULT false NOT NULL,
	`returned` integer DEFAULT false NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_order_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`product_name` text NOT NULL,
	`quantity` integer NOT NULL,
	`price_cents` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_email` text DEFAULT '' NOT NULL,
	`client_name` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'Pendente' NOT NULL,
	`total_cents` integer NOT NULL,
	`payment_method` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`completed_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`price_cents` integer NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`image_key` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`birth_date` text DEFAULT '' NOT NULL,
	`loyalty_adjustment` integer DEFAULT 0 NOT NULL,
	`loyalty_rewards_redeemed` integer DEFAULT 0 NOT NULL,
	`loyalty_adjustment_note` text DEFAULT '' NOT NULL,
	`loyalty_updated_at` text DEFAULT '' NOT NULL,
	`loyalty_updated_by` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `recurring_expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`description` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`day_of_month` integer DEFAULT 1 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `schedule_blocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`time` text DEFAULT 'Dia inteiro' NOT NULL,
	`reason` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`price_cents` integer NOT NULL,
	`duration_min` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`tag` text DEFAULT '' NOT NULL,
	`show_on_site` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`touch_up_days` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_content` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kind` text NOT NULL,
	`description` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`date` text NOT NULL,
	`appointment_id` integer,
	`client_email` text DEFAULT '' NOT NULL,
	`client_name` text DEFAULT '' NOT NULL,
	`service_id` integer,
	`service_name` text DEFAULT '' NOT NULL,
	`payment_method` text DEFAULT '' NOT NULL,
	`category` text DEFAULT '' NOT NULL,
	`recurring_expense_id` integer,
	`created_at` text NOT NULL
);
