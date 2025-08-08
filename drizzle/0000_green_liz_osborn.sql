CREATE TABLE "geohash" (
	"geohash" varchar(10) PRIMARY KEY NOT NULL,
	"geopoint" "point" NOT NULL,
	"country" varchar(48) NOT NULL,
	"city" varchar(64) NOT NULL,
	"locality" varchar(64) NOT NULL,
	"sublocality" varchar(64) NOT NULL,
	"neighborhood" varchar(64) NOT NULL,
	"street" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "location_info" (
	"geohash" varchar(10) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"history" text NOT NULL,
	"culture" text NOT NULL,
	"attractions" jsonb[] NOT NULL,
	"climate" text NOT NULL,
	"demographics" text NOT NULL,
	"economy" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
