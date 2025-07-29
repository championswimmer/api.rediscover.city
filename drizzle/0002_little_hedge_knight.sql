ALTER TABLE "location_info" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "location_info" ADD COLUMN "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "location_info" ADD COLUMN "history" text NOT NULL;--> statement-breakpoint
ALTER TABLE "location_info" ADD COLUMN "culture" text NOT NULL;--> statement-breakpoint
ALTER TABLE "location_info" ADD COLUMN "attractions" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "location_info" ADD COLUMN "climate" text NOT NULL;--> statement-breakpoint
ALTER TABLE "location_info" ADD COLUMN "demographics" text NOT NULL;--> statement-breakpoint
ALTER TABLE "location_info" ADD COLUMN "economy" text NOT NULL;