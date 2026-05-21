CREATE TYPE "public"."credito_registro" AS ENUM('sem_registro', 'com_registro');--> statement-breakpoint
CREATE TYPE "public"."credito_stage" AS ENUM('registro_em_andamento', 'desocupado', 'sem_acao_judicial', 'acao_judicial_ordinaria', 'execucao', 'com_pedido_desocupacao');--> statement-breakpoint
CREATE TABLE "creditos_judiciais" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"process_number" varchar(64),
	"address" text,
	"value" numeric(14, 2),
	"registro_status" "credito_registro" DEFAULT 'sem_registro' NOT NULL,
	"stage" "credito_stage" DEFAULT 'registro_em_andamento' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
