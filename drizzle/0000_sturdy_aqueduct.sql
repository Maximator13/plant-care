CREATE TABLE "homes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text DEFAULT 'Maison' NOT NULL,
	"city" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"timezone" text NOT NULL,
	"email_alerts" boolean DEFAULT true NOT NULL,
	"weather_context" jsonb,
	"weather_updated_at" timestamp with time zone,
	CONSTRAINT "homes_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "plants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"home_id" uuid NOT NULL,
	"species_id" uuid NOT NULL,
	"nickname" text NOT NULL,
	"location" text NOT NULL,
	"interval_override_days" real,
	"agent_multiplier" real,
	"next_watering_at" timestamp with time zone,
	"next_watering_reason" text,
	"advice" text,
	"alert" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	CONSTRAINT "plants_location_valid" CHECK ("plants"."location" in ('indoor', 'outdoor')),
	CONSTRAINT "plants_override_positive" CHECK ("plants"."interval_override_days" > 0)
);
--> statement-breakpoint
CREATE TABLE "species" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"perenual_id" integer,
	"common_name" text NOT NULL,
	"scientific_name" text,
	"image_url" text,
	"base_interval_days" real NOT NULL,
	"sunlight" text,
	"care_notes" text,
	"source" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "species_perenual_id_unique" UNIQUE("perenual_id"),
	CONSTRAINT "species_interval_positive" CHECK ("species"."base_interval_days" > 0),
	CONSTRAINT "species_source_valid" CHECK ("species"."source" in ('perenual', 'ai'))
);
--> statement-breakpoint
CREATE TABLE "watering_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plant_id" uuid NOT NULL,
	"watered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text DEFAULT 'manual' NOT NULL,
	"note" text,
	CONSTRAINT "watering_logs_source_valid" CHECK ("watering_logs"."source" in ('manual', 'rain'))
);
--> statement-breakpoint
ALTER TABLE "plants" ADD CONSTRAINT "plants_home_id_homes_id_fk" FOREIGN KEY ("home_id") REFERENCES "public"."homes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plants" ADD CONSTRAINT "plants_species_id_species_id_fk" FOREIGN KEY ("species_id") REFERENCES "public"."species"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watering_logs" ADD CONSTRAINT "watering_logs_plant_id_plants_id_fk" FOREIGN KEY ("plant_id") REFERENCES "public"."plants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "plants_home_next_idx" ON "plants" USING btree ("home_id","next_watering_at");--> statement-breakpoint
CREATE INDEX "watering_logs_plant_idx" ON "watering_logs" USING btree ("plant_id","watered_at" DESC NULLS LAST);