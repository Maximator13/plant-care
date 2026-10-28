ALTER TABLE "species" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "species" ADD CONSTRAINT "species_slug_unique" UNIQUE("slug");