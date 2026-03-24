CREATE TYPE "public"."adjustment_index" AS ENUM('igpm', 'ipca', 'inpc', 'nenhum');--> statement-breakpoint
CREATE TYPE "public"."bi_status" AS ENUM('pendente', 'parcial', 'concluido');--> statement-breakpoint
CREATE TYPE "public"."bt_status" AS ENUM('pendente', 'conciliado', 'ignorado', 'manual');--> statement-breakpoint
CREATE TYPE "public"."c_task_type" AS ENUM('marco', 'prazo_entrega', 'vistoria', 'reuniao', 'outro');--> statement-breakpoint
CREATE TYPE "public"."construction_progress" AS ENUM('avancada', 'em_dia', 'atrasada', 'totalmente_atrasada');--> statement-breakpoint
CREATE TYPE "public"."construction_status" AS ENUM('em_andamento', 'paralisada', 'concluida');--> statement-breakpoint
CREATE TYPE "public"."construction_type" AS ENUM('residencial', 'comercial', 'reforma', 'galpao', 'loteamento', 'outro');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('ativo', 'encerrado', 'pendente', 'rescindido');--> statement-breakpoint
CREATE TYPE "public"."document_category" AS ENUM('contrato', 'alvara', 'certidao', 'planta', 'foto', 'fatura', 'recibo', 'outro');--> statement-breakpoint
CREATE TYPE "public"."employee_status" AS ENUM('ativo', 'ferias', 'afastado', 'desligado');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('vencimento_contrato', 'renovacao_licenca', 'manutencao', 'marco_projeto', 'reuniao', 'outro');--> statement-breakpoint
CREATE TYPE "public"."fin_category" AS ENUM('aluguel', 'condominio', 'iptu', 'venda', 'manutencao', 'comissao', 'taxa_admin', 'seguro', 'agua', 'luz', 'gas', 'internet', 'material', 'mao_de_obra', 'outros');--> statement-breakpoint
CREATE TYPE "public"."fin_status" AS ENUM('aberto', 'pago', 'cancelado', 'atrasado');--> statement-breakpoint
CREATE TYPE "public"."fin_type" AS ENUM('entrada', 'saida');--> statement-breakpoint
CREATE TYPE "public"."fleet_status" AS ENUM('disponivel', 'em_uso', 'manutencao', 'inativo');--> statement-breakpoint
CREATE TYPE "public"."lease_term" AS ENUM('quinzenal', 'mensal', 'trimestral', 'semestral', 'anual', '2_anos', '3_anos');--> statement-breakpoint
CREATE TYPE "public"."neg_ownership" AS ENUM('proprio', 'terceiros');--> statement-breakpoint
CREATE TYPE "public"."neg_priority" AS ENUM('baixa', 'media', 'alta', 'urgente');--> statement-breakpoint
CREATE TYPE "public"."next_action_priority" AS ENUM('normal', 'urgente');--> statement-breakpoint
CREATE TYPE "public"."operation_type" AS ENUM('compra', 'venda', 'permuta', 'incorporacao', 'loteamento', 'reforma', 'outro');--> statement-breakpoint
CREATE TYPE "public"."ownership" AS ENUM('domobianca', 'terceiros');--> statement-breakpoint
CREATE TYPE "public"."partner_type" AS ENUM('corretor', 'advogado', 'investidor', 'permutario', 'outros');--> statement-breakpoint
CREATE TYPE "public"."petty_cash_type" AS ENUM('entrada', 'saida');--> statement-breakpoint
CREATE TYPE "public"."phase" AS ENUM('prospeccao', 'analise', 'negociacao', 'due_diligence', 'aprovado', 'fechado', 'cancelado');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('disponivel_locacao', 'disponivel_venda', 'alugado', 'vendido', 'arquivado');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('residencial', 'apartamento', 'galpao', 'sala_comercial', 'lote', 'casa', 'cobertura', 'kitnet', 'outro');--> statement-breakpoint
CREATE TYPE "public"."rb_category" AS ENUM('iptu', 'condominio', 'seguro', 'agua', 'luz', 'gas', 'internet', 'outros');--> statement-breakpoint
CREATE TYPE "public"."rb_frequency" AS ENUM('mensal', 'bimestral', 'trimestral', 'semestral', 'anual');--> statement-breakpoint
CREATE TYPE "public"."rb_type" AS ENUM('entrada', 'saida');--> statement-breakpoint
CREATE TYPE "public"."supply_category" AS ENUM('escritorio', 'copa', 'limpeza', 'outro');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('normal', 'urgente');--> statement-breakpoint
CREATE TYPE "public"."ticket_category" AS ENUM('ti', 'manutencao', 'limpeza', 'seguranca', 'outro');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('baixa', 'media', 'alta', 'urgente');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('aberto', 'em_andamento', 'resolvido', 'fechado');--> statement-breakpoint
CREATE TYPE "public"."time_off_type" AS ENUM('ferias', 'falta_justificada', 'falta_injustificada', 'licenca', 'outro');--> statement-breakpoint
CREATE TYPE "public"."todo_priority" AS ENUM('baixa', 'media', 'alta');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'gerente', 'operador');--> statement-breakpoint
CREATE TYPE "public"."viability_status" AS ENUM('verde', 'amarelo', 'vermelho');--> statement-breakpoint
CREATE TABLE "architects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"email" varchar(320),
	"cpf_cnpj" varchar(20),
	"specialty" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_imports" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"import_date" timestamp DEFAULT now() NOT NULL,
	"total_rows" integer DEFAULT 0,
	"conciliated_rows" integer DEFAULT 0,
	"pending_rows" integer DEFAULT 0,
	"status" "bi_status" DEFAULT 'pendente' NOT NULL,
	"imported_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"bank_import_id" integer NOT NULL,
	"transaction_date" date NOT NULL,
	"description" varchar(500) NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"transaction_id" varchar(255),
	"status" "bt_status" DEFAULT 'pendente' NOT NULL,
	"matched_entry_id" integer,
	"suggested_entry_id" integer,
	"suggested_category" varchar(128),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "business_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"negocio_id" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"due_date" date NOT NULL,
	"priority" "task_priority" DEFAULT 'normal' NOT NULL,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"event_date" date NOT NULL,
	"event_type" "event_type" NOT NULL,
	"related_entity" varchar(128),
	"related_entity_id" integer,
	"alert_days_before" integer DEFAULT 7,
	"is_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "captadores" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"partner_type" "partner_type" DEFAULT 'corretor' NOT NULL,
	"phone" varchar(20),
	"email" varchar(320),
	"cpf_cnpj" varchar(20),
	"default_commission" numeric(5, 2) DEFAULT '5.00',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"cpf_cnpj" varchar(20),
	"email" varchar(320),
	"phone" varchar(20),
	"phone2" varchar(20),
	"address" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "construction_checklist" (
	"id" serial PRIMARY KEY NOT NULL,
	"construction_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"supply_item_id" integer NOT NULL,
	"is_checked" boolean DEFAULT false,
	"checked_by" integer,
	"checked_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "construction_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"construction_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"image_key" varchar(512),
	"caption" varchar(255),
	"uploaded_by" varchar(255),
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "construction_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"construction_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"author" varchar(255),
	"report_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "construction_supply_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"construction_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"supply_item_id" integer NOT NULL,
	"quantity" numeric(12, 2),
	"unit" varchar(20) DEFAULT 'un',
	"closed_value" numeric(14, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "construction_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"construction_id" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"due_date" date NOT NULL,
	"task_type" "c_task_type" DEFAULT 'outro' NOT NULL,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "constructions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"address" text,
	"city" varchar(128),
	"state" varchar(2),
	"has_key" boolean DEFAULT false,
	"contractor_id" integer,
	"architect_id" integer,
	"construction_type" "construction_type" DEFAULT 'residencial' NOT NULL,
	"status" "construction_status" DEFAULT 'em_andamento' NOT NULL,
	"progress" "construction_progress" DEFAULT 'em_dia' NOT NULL,
	"description" text,
	"is_archived" boolean DEFAULT false,
	"start_date" date,
	"expected_end_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contractors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"email" varchar(320),
	"cpf_cnpj" varchar(20),
	"specialty" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" "document_category" NOT NULL,
	"description" text,
	"file_url" text,
	"file_key" varchar(512),
	"file_name" varchar(255),
	"mime_type" varchar(128),
	"expiry_date" date,
	"related_entity" varchar(128),
	"related_entity_id" integer,
	"uploaded_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"cpf" varchar(14),
	"email" varchar(320),
	"phone" varchar(20),
	"position" varchar(128),
	"department" varchar(128),
	"salary" numeric(12, 2),
	"hire_date" date,
	"status" "employee_status" DEFAULT 'ativo' NOT NULL,
	"project_allocation" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "fin_type" NOT NULL,
	"category" "fin_category" DEFAULT 'outros' NOT NULL,
	"description" varchar(500) NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"due_date" date NOT NULL,
	"payment_date" date,
	"status" "fin_status" DEFAULT 'aberto' NOT NULL,
	"property_id" integer,
	"construction_id" integer,
	"cost_center" varchar(255) DEFAULT 'administracao_central',
	"rental_contract_id" integer,
	"csv_transaction_id" varchar(255),
	"is_conciliated" boolean DEFAULT false,
	"conciliation_id" integer,
	"recurring_bill_id" integer,
	"installment_number" integer,
	"total_installments" integer,
	"late_fee" numeric(12, 2),
	"interest_amount" numeric(12, 2),
	"notes" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fleet" (
	"id" serial PRIMARY KEY NOT NULL,
	"plate" varchar(10) NOT NULL,
	"model" varchar(128) NOT NULL,
	"year" integer,
	"status" "fleet_status" DEFAULT 'disponivel' NOT NULL,
	"assigned_to" varchar(255),
	"next_maintenance_date" date,
	"km" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "negocios" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"ownership" "neg_ownership" DEFAULT 'proprio' NOT NULL,
	"captador_id" integer,
	"address" text,
	"city" varchar(128),
	"state" varchar(2),
	"phase" "phase" DEFAULT 'prospeccao' NOT NULL,
	"operation_type" "operation_type" DEFAULT 'compra' NOT NULL,
	"priority" "neg_priority" DEFAULT 'media' NOT NULL,
	"total_area" numeric(12, 2),
	"usable_area" numeric(12, 2),
	"zoning" varchar(128),
	"constructive_potential" numeric(8, 2),
	"opportunity_cost" numeric(14, 2),
	"market_value" numeric(14, 2),
	"max_investment" numeric(14, 2),
	"estimated_vgv" numeric(14, 2),
	"tir_percent" numeric(8, 2),
	"profit_margin_percent" numeric(8, 2),
	"documentation_status" text,
	"next_action" text,
	"next_action_priority" "next_action_priority" DEFAULT 'normal',
	"next_action_date" date,
	"is_archived" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "owners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"cpf_cnpj" varchar(20),
	"email" varchar(320),
	"phone" varchar(20),
	"phone2" varchar(20),
	"address" text,
	"bank_name" varchar(128),
	"bank_agency" varchar(20),
	"bank_account" varchar(30),
	"pix_key" varchar(255),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "petty_cash" (
	"id" serial PRIMARY KEY NOT NULL,
	"description" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"type" "petty_cash_type" NOT NULL,
	"category" varchar(128),
	"date" date NOT NULL,
	"receipt_url" text,
	"receipt_key" varchar(512),
	"registered_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(20),
	"title" varchar(255) NOT NULL,
	"ownership" "ownership" DEFAULT 'domobianca' NOT NULL,
	"property_type" "property_type" DEFAULT 'residencial' NOT NULL,
	"status" "property_status" DEFAULT 'disponivel_locacao' NOT NULL,
	"owner_id" integer,
	"street" varchar(255),
	"number" varchar(20),
	"complement" varchar(128),
	"neighborhood" varchar(128),
	"city" varchar(128),
	"state" varchar(2),
	"zip_code" varchar(10),
	"area" numeric(10, 2),
	"bedrooms" integer,
	"bathrooms" integer,
	"parking_spots" integer,
	"suites" integer,
	"rent_value" numeric(12, 2),
	"sale_value" numeric(14, 2),
	"condo_fee" numeric(10, 2),
	"iptu_value" numeric(10, 2),
	"admin_fee_percent" numeric(5, 2),
	"sale_commission_percent" numeric(5, 2),
	"description" text,
	"features" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_checklists" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"item" varchar(255) NOT NULL,
	"is_checked" boolean DEFAULT false,
	"notes" text,
	"checked_by" integer,
	"checked_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_todos" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"property_id" integer,
	"due_date" date,
	"priority" "todo_priority" DEFAULT 'media' NOT NULL,
	"is_completed" boolean DEFAULT false,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_bills" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" "rb_category" NOT NULL,
	"type" "rb_type" DEFAULT 'saida' NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"property_id" integer,
	"cost_center" varchar(255) DEFAULT 'administracao_central',
	"inscricao_imobiliaria" varchar(50),
	"frequency" "rb_frequency" DEFAULT 'mensal' NOT NULL,
	"billing_day" integer DEFAULT 10,
	"start_date" date NOT NULL,
	"end_date" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_generated_date" date,
	"notes" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rental_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"occupant_name" varchar(255),
	"occupant_cpf" varchar(14),
	"start_date" date NOT NULL,
	"end_date" date,
	"lease_term" "lease_term" DEFAULT 'anual' NOT NULL,
	"rent_amount" numeric(12, 2) NOT NULL,
	"condo_included" boolean DEFAULT false,
	"iptu_included" boolean DEFAULT false,
	"is_package" boolean DEFAULT false,
	"package_total" numeric(12, 2),
	"adjustment_index" "adjustment_index" DEFAULT 'igpm' NOT NULL,
	"adjustment_value" numeric(12, 2),
	"next_adjustment_date" date,
	"billing_day" integer DEFAULT 10,
	"late_fee_percent" numeric(5, 2) DEFAULT '2.00',
	"daily_interest_percent" numeric(5, 4) DEFAULT '0.0333',
	"contract_file_url" text,
	"contract_file_key" varchar(512),
	"contract_file_name" varchar(255),
	"status" "contract_status" DEFAULT 'ativo' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" "supply_category" DEFAULT 'outro' NOT NULL,
	"current_stock" integer DEFAULT 0,
	"min_stock" integer DEFAULT 5,
	"unit" varchar(32) DEFAULT 'un',
	"last_restocked" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supply_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supply_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"construction_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_url" text NOT NULL,
	"file_key" varchar(512),
	"uploaded_by" varchar(255),
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supply_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"category" "ticket_category" DEFAULT 'outro' NOT NULL,
	"priority" "ticket_priority" DEFAULT 'media' NOT NULL,
	"status" "ticket_status" DEFAULT 'aberto' NOT NULL,
	"requested_by" integer,
	"assigned_to" varchar(255),
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_off" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"type" time_off_type NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"reason" text,
	"approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"open_id" varchar(64) NOT NULL,
	"username" varchar(64),
	"password_hash" varchar(255),
	"plain_password" varchar(255),
	"name" text,
	"email" varchar(320),
	"login_method" varchar(64),
	"role" "user_role" DEFAULT 'operador' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_open_id_unique" UNIQUE("open_id"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "viabilidade" (
	"id" serial PRIMARY KEY NOT NULL,
	"negocio_id" integer NOT NULL,
	"land_cost" numeric(14, 2) DEFAULT '0',
	"construction_cost" numeric(14, 2) DEFAULT '0',
	"indirect_costs" numeric(14, 2) DEFAULT '0',
	"taxes" numeric(14, 2) DEFAULT '0',
	"commissions" numeric(14, 2) DEFAULT '0',
	"total_cost" numeric(14, 2),
	"net_profit" numeric(14, 2),
	"profit_margin" numeric(8, 2),
	"tir" numeric(8, 2),
	"roi" numeric(8, 2),
	"viability_status" "viability_status" DEFAULT 'amarelo',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
