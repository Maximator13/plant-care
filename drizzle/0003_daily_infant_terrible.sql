CREATE TABLE "usage_counters" (
	"user_id" text NOT NULL,
	"day" date NOT NULL,
	"kind" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "usage_counters_user_id_day_kind_pk" PRIMARY KEY("user_id","day","kind")
);
