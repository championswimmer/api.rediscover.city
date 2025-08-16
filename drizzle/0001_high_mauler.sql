CREATE TABLE "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"code" varchar(8) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invites_email_unique" UNIQUE("email"),
	CONSTRAINT "invites_code_unique" UNIQUE("code")
);
