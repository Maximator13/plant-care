ALTER TABLE "species" DROP CONSTRAINT "species_source_valid";--> statement-breakpoint
ALTER TABLE "species" ALTER COLUMN "sunlight" SET DEFAULT 'partial';--> statement-breakpoint
ALTER TABLE "species" ALTER COLUMN "sunlight" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "plants" DROP COLUMN "agent_multiplier";--> statement-breakpoint
ALTER TABLE "plants" DROP COLUMN "advice";--> statement-breakpoint
ALTER TABLE "plants" DROP COLUMN "alert";--> statement-breakpoint
ALTER TABLE "species" DROP COLUMN "image_url";--> statement-breakpoint
ALTER TABLE "species" ADD CONSTRAINT "species_light_valid" CHECK ("species"."sunlight" in ('sun', 'partial', 'shade'));--> statement-breakpoint
ALTER TABLE "species" ADD CONSTRAINT "species_source_valid" CHECK ("species"."source" in ('catalog', 'perenual', 'manual'));