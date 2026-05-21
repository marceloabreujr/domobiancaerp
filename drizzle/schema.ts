import { integer, pgEnum, pgTable, text, timestamp, varchar, numeric, date, boolean, serial } from "drizzle-orm/pg-core";

// ─── ENUMS ─────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["admin", "gerente", "operador"]);
export const employeeStatusEnum = pgEnum("employee_status", ["ativo", "ferias", "afastado", "desligado"]);
export const timeOffTypeEnum = pgEnum("time_off_type", ["ferias", "falta_justificada", "falta_injustificada", "licenca", "outro"]);
export const documentCategoryEnum = pgEnum("document_category", ["contrato", "alvara", "certidao", "planta", "foto", "fatura", "recibo", "outro"]);
export const eventTypeEnum = pgEnum("event_type", ["vencimento_contrato", "renovacao_licenca", "manutencao", "marco_projeto", "reuniao", "outro"]);
export const supplyCategoryEnum = pgEnum("supply_category", ["escritorio", "copa", "limpeza", "outro"]);
export const fleetStatusEnum = pgEnum("fleet_status", ["disponivel", "em_uso", "manutencao", "inativo"]);
export const pettyCashTypeEnum = pgEnum("petty_cash_type", ["entrada", "saida"]);
export const ticketCategoryEnum = pgEnum("ticket_category", ["ti", "manutencao", "limpeza", "seguranca", "outro"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["baixa", "media", "alta", "urgente"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["aberto", "em_andamento", "resolvido", "fechado"]);
export const ownershipEnum = pgEnum("ownership", ["domobianca", "terceiros"]);
export const propertyTypeEnum = pgEnum("property_type", ["residencial", "apartamento", "galpao", "sala_comercial", "lote", "casa", "cobertura", "kitnet", "outro"]);
export const propertyStatusEnum = pgEnum("property_status", ["disponivel_locacao", "disponivel_venda", "alugado", "vendido", "arquivado"]);
export const leaseTermEnum = pgEnum("lease_term", ["quinzenal", "mensal", "trimestral", "semestral", "anual", "2_anos", "3_anos"]);
export const adjustmentIndexEnum = pgEnum("adjustment_index", ["igpm", "ipca", "inpc", "nenhum"]);
export const contractStatusEnum = pgEnum("contract_status", ["ativo", "encerrado", "pendente", "rescindido"]);
export const todoPriorityEnum = pgEnum("todo_priority", ["baixa", "media", "alta"]);
export const partnerTypeEnum = pgEnum("partner_type", ["corretor", "advogado", "investidor", "permutario", "outros"]);
export const negOwnershipEnum = pgEnum("neg_ownership", ["proprio", "terceiros"]);
export const phaseEnum = pgEnum("phase", ["prospeccao", "analise", "negociacao", "due_diligence", "aprovado", "fechado", "cancelado"]);
export const operationTypeEnum = pgEnum("operation_type", ["compra", "venda", "permuta", "incorporacao", "loteamento", "reforma", "outro"]);
export const negPriorityEnum = pgEnum("neg_priority", ["baixa", "media", "alta", "urgente"]);
export const nextActionPriorityEnum = pgEnum("next_action_priority", ["normal", "urgente"]);
export const viabilityStatusEnum = pgEnum("viability_status", ["verde", "amarelo", "vermelho"]);
export const taskPriorityEnum = pgEnum("task_priority", ["normal", "urgente"]);
export const constructionTypeEnum = pgEnum("construction_type", ["residencial", "comercial", "reforma", "galpao", "loteamento", "outro"]);
export const constructionStatusEnum = pgEnum("construction_status", ["em_andamento", "paralisada", "concluida"]);
export const constructionProgressEnum = pgEnum("construction_progress", ["avancada", "em_dia", "atrasada", "totalmente_atrasada"]);
export const cTaskTypeEnum = pgEnum("c_task_type", ["marco", "prazo_entrega", "vistoria", "reuniao", "outro"]);
export const finTypeEnum = pgEnum("fin_type", ["entrada", "saida"]);
export const finCategoryEnum = pgEnum("fin_category", [
  "aluguel", "condominio", "iptu", "venda", "manutencao",
  "comissao", "taxa_admin", "seguro", "agua", "luz",
  "gas", "internet", "material", "mao_de_obra", "outros"
]);
export const finStatusEnum = pgEnum("fin_status", ["aberto", "pago", "cancelado", "atrasado"]);
export const rbCategoryEnum = pgEnum("rb_category", ["iptu", "condominio", "seguro", "agua", "luz", "gas", "internet", "outros"]);
export const rbTypeEnum = pgEnum("rb_type", ["entrada", "saida"]);
export const rbFrequencyEnum = pgEnum("rb_frequency", ["mensal", "bimestral", "trimestral", "semestral", "anual"]);
export const biStatusEnum = pgEnum("bi_status", ["pendente", "parcial", "concluido"]);
export const btStatusEnum = pgEnum("bt_status", ["pendente", "conciliado", "ignorado", "manual"]);

// ─── USERS ──────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 64 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  plainPassword: varchar("plain_password", { length: 255 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: userRoleEnum("role").default("operador").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserRole = User["role"];

// ─── MÓDULO ADMINISTRATIVO ──────────────────────────────────────────────────

// 1. RH — Colaboradores
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  position: varchar("position", { length: 128 }),
  department: varchar("department", { length: 128 }),
  salary: numeric("salary", { precision: 12, scale: 2 }),
  hireDate: date("hire_date"),
  status: employeeStatusEnum("status").default("ativo").notNull(),
  projectAllocation: varchar("project_allocation", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

// 2. RH — Férias e Faltas
export const timeOff = pgTable("time_off", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull(),
  type: timeOffTypeEnum("type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason"),
  approved: boolean("approved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type TimeOff = typeof timeOff.$inferSelect;
export type InsertTimeOff = typeof timeOff.$inferInsert;

// 3. Documentos (GED)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: documentCategoryEnum("category").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  fileKey: varchar("file_key", { length: 512 }),
  fileName: varchar("file_name", { length: 255 }),
  mimeType: varchar("mime_type", { length: 128 }),
  expiryDate: date("expiry_date"),
  relatedEntity: varchar("related_entity", { length: 128 }),
  relatedEntityId: integer("related_entity_id"),
  uploadedBy: integer("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// 4. Calendário e Alertas
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: date("event_date").notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  relatedEntity: varchar("related_entity", { length: 128 }),
  relatedEntityId: integer("related_entity_id"),
  alertDaysBefore: integer("alert_days_before").default(7),
  isCompleted: boolean("is_completed").default(false),
  assignedTo: integer("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

// 5. Consumíveis (stock de escritório/copa)
export const supplies = pgTable("supplies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: supplyCategoryEnum("category").default("outro").notNull(),
  currentStock: integer("current_stock").default(0),
  minStock: integer("min_stock").default(5),
  unit: varchar("unit", { length: 32 }).default("un"),
  lastRestocked: date("last_restocked"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Supply = typeof supplies.$inferSelect;
export type InsertSupply = typeof supplies.$inferInsert;

// 6. Frota automóvel
export const fleet = pgTable("fleet", {
  id: serial("id").primaryKey(),
  plate: varchar("plate", { length: 10 }).notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  year: integer("year"),
  status: fleetStatusEnum("status").default("disponivel").notNull(),
  assignedTo: varchar("assigned_to", { length: 255 }),
  nextMaintenanceDate: date("next_maintenance_date"),
  km: integer("km"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FleetVehicle = typeof fleet.$inferSelect;
export type InsertFleetVehicle = typeof fleet.$inferInsert;

// 7. Fundo de maneio (caixa pequena)
export const pettyCash = pgTable("petty_cash", {
  id: serial("id").primaryKey(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  type: pettyCashTypeEnum("type").notNull(),
  category: varchar("category", { length: 128 }),
  date: date("date").notNull(),
  receiptUrl: text("receipt_url"),
  receiptKey: varchar("receipt_key", { length: 512 }),
  registeredBy: integer("registered_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PettyCashEntry = typeof pettyCash.$inferSelect;
export type InsertPettyCashEntry = typeof pettyCash.$inferInsert;

// 8. Chamados (helpdesk interno)
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: ticketCategoryEnum("category").default("outro").notNull(),
  priority: ticketPriorityEnum("priority").default("media").notNull(),
  status: ticketStatusEnum("status").default("aberto").notNull(),
  requestedBy: integer("requested_by"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

// ─── MÓDULO GESTÃO DE IMÓVEIS ──────────────────────────────────────────────

// 1. Proprietários
export const owners = pgTable("owners", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cpfCnpj: varchar("cpf_cnpj", { length: 20 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  phone2: varchar("phone2", { length: 20 }),
  address: text("address"),
  bankName: varchar("bank_name", { length: 128 }),
  bankAgency: varchar("bank_agency", { length: 20 }),
  bankAccount: varchar("bank_account", { length: 30 }),
  pixKey: varchar("pix_key", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Owner = typeof owners.$inferSelect;
export type InsertOwner = typeof owners.$inferInsert;

// 2. Clientes (inquilinos / compradores)
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cpfCnpj: varchar("cpf_cnpj", { length: 20 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  phone2: varchar("phone2", { length: 20 }),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// 3. Imóveis
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }),
  title: varchar("title", { length: 255 }).notNull(),
  ownership: ownershipEnum("ownership").default("domobianca").notNull(),
  propertyType: propertyTypeEnum("property_type").default("residencial").notNull(),
  status: propertyStatusEnum("status").default("disponivel_locacao").notNull(),
  ownerId: integer("owner_id"),
  // Endereço
  street: varchar("street", { length: 255 }),
  number: varchar("number", { length: 20 }),
  complement: varchar("complement", { length: 128 }),
  neighborhood: varchar("neighborhood", { length: 128 }),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zip_code", { length: 10 }),
  // Características
  area: numeric("area", { precision: 10, scale: 2 }),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  parkingSpots: integer("parking_spots"),
  suites: integer("suites"),
  // Valores
  rentValue: numeric("rent_value", { precision: 12, scale: 2 }),
  saleValue: numeric("sale_value", { precision: 14, scale: 2 }),
  condoFee: numeric("condo_fee", { precision: 10, scale: 2 }),
  iptuValue: numeric("iptu_value", { precision: 10, scale: 2 }),
  // Administração (para imóveis de terceiros)
  adminFeePercent: numeric("admin_fee_percent", { precision: 5, scale: 2 }),
  saleCommissionPercent: numeric("sale_commission_percent", { precision: 5, scale: 2 }),
  // Extras
  description: text("description"),
  features: text("features"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

// 4. Contratos de Locação
export const rentalContracts = pgTable("rental_contracts", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  occupantName: varchar("occupant_name", { length: 255 }),
  occupantCpf: varchar("occupant_cpf", { length: 14 }),
  // Datas
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  leaseTerm: leaseTermEnum("lease_term").default("anual").notNull(),
  // Valores
  rentAmount: numeric("rent_amount", { precision: 12, scale: 2 }).notNull(),
  condoIncluded: boolean("condo_included").default(false),
  iptuIncluded: boolean("iptu_included").default(false),
  isPackage: boolean("is_package").default(false),
  packageTotal: numeric("package_total", { precision: 12, scale: 2 }),
  // Reajuste
  adjustmentIndex: adjustmentIndexEnum("adjustment_index").default("igpm").notNull(),
  adjustmentValue: numeric("adjustment_value", { precision: 12, scale: 2 }),
  nextAdjustmentDate: date("next_adjustment_date"),
  // Cobrança
  billingDay: integer("billing_day").default(10),
  lateFeePercent: numeric("late_fee_percent", { precision: 5, scale: 2 }).default("2.00"),
  dailyInterestPercent: numeric("daily_interest_percent", { precision: 5, scale: 4 }).default("0.0333"),
  // PDF do contrato assinado
  contractFileUrl: text("contract_file_url"),
  contractFileKey: varchar("contract_file_key", { length: 512 }),
  contractFileName: varchar("contract_file_name", { length: 255 }),
  // Status
  status: contractStatusEnum("status").default("ativo").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RentalContract = typeof rentalContracts.$inferSelect;
export type InsertRentalContract = typeof rentalContracts.$inferInsert;

// 5. To-Do List do módulo de imóveis
export const propertyTodos = pgTable("property_todos", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  propertyId: integer("property_id"),
  dueDate: date("due_date"),
  priority: todoPriorityEnum("priority").default("media").notNull(),
  isCompleted: boolean("is_completed").default(false),
  createdBy: integer("created_by"),
  assignedTo: integer("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PropertyTodo = typeof propertyTodos.$inferSelect;
export type InsertPropertyTodo = typeof propertyTodos.$inferInsert;

// 6. Checklist Mensal de Imóveis
export const propertyChecklists = pgTable("property_checklists", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  item: varchar("item", { length: 255 }).notNull(),
  isChecked: boolean("is_checked").default(false),
  notes: text("notes"),
  checkedBy: integer("checked_by"),
  checkedAt: timestamp("checked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type PropertyChecklist = typeof propertyChecklists.$inferSelect;
export type InsertPropertyChecklist = typeof propertyChecklists.$inferInsert;

// ─── MÓDULO GESTÃO DE NEGÓCIOS ──────────────────────────────────────────────

// 1. Captadores (Parceiros de Negócio)
export const captadores = pgTable("captadores", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  partnerType: partnerTypeEnum("partner_type").default("corretor").notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  cpfCnpj: varchar("cpf_cnpj", { length: 20 }),
  defaultCommission: numeric("default_commission", { precision: 5, scale: 2 }).default("5.00"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Captador = typeof captadores.$inferSelect;
export type InsertCaptador = typeof captadores.$inferInsert;

// 2. Negócios (Oportunidades)
export const negocios = pgTable("negocios", {
  id: serial("id").primaryKey(),
  // Seção 1 - Identificação
  title: varchar("title", { length: 255 }).notNull(),
  ownership: negOwnershipEnum("ownership").default("proprio").notNull(),
  captadorId: integer("captador_id"),
  address: text("address"),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 2 }),
  // Seção 2 - Classificação e Estado
  phase: phaseEnum("phase").default("prospeccao").notNull(),
  operationType: operationTypeEnum("operation_type").default("compra").notNull(),
  priority: negPriorityEnum("priority").default("media").notNull(),
  // Seção 3 - Dados Técnicos
  totalArea: numeric("total_area", { precision: 12, scale: 2 }),
  usableArea: numeric("usable_area", { precision: 12, scale: 2 }),
  zoning: varchar("zoning", { length: 128 }),
  constructivePotential: numeric("constructive_potential", { precision: 8, scale: 2 }),
  // Seção 4 - Indicadores Financeiros
  opportunityCost: numeric("opportunity_cost", { precision: 14, scale: 2 }),
  marketValue: numeric("market_value", { precision: 14, scale: 2 }),
  maxInvestment: numeric("max_investment", { precision: 14, scale: 2 }),
  estimatedVGV: numeric("estimated_vgv", { precision: 14, scale: 2 }),
  tirPercent: numeric("tir_percent", { precision: 8, scale: 2 }),
  profitMarginPercent: numeric("profit_margin_percent", { precision: 8, scale: 2 }),
  // Seção 5 - Riscos e Próximos Passos
  documentationStatus: text("documentation_status"),
  nextAction: text("next_action"),
  nextActionPriority: nextActionPriorityEnum("next_action_priority").default("normal"),
  nextActionDate: date("next_action_date"),
  // Status
  isArchived: boolean("is_archived").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Negocio = typeof negocios.$inferSelect;
export type InsertNegocio = typeof negocios.$inferInsert;

// 3. Viabilidade Econômica (EVE) — vinculada a um negócio
export const viabilidade = pgTable("viabilidade", {
  id: serial("id").primaryKey(),
  negocioId: integer("negocio_id").notNull(),
  // Inputs de custo
  landCost: numeric("land_cost", { precision: 14, scale: 2 }).default("0"),
  constructionCost: numeric("construction_cost", { precision: 14, scale: 2 }).default("0"),
  indirectCosts: numeric("indirect_costs", { precision: 14, scale: 2 }).default("0"),
  taxes: numeric("taxes", { precision: 14, scale: 2 }).default("0"),
  commissions: numeric("commissions", { precision: 14, scale: 2 }).default("0"),
  // Outputs calculados
  totalCost: numeric("total_cost", { precision: 14, scale: 2 }),
  netProfit: numeric("net_profit", { precision: 14, scale: 2 }),
  profitMargin: numeric("profit_margin", { precision: 8, scale: 2 }),
  tir: numeric("tir", { precision: 8, scale: 2 }),
  roi: numeric("roi", { precision: 8, scale: 2 }),
  // Farol
  viabilityStatus: viabilityStatusEnum("viability_status").default("amarelo"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Viabilidade = typeof viabilidade.$inferSelect;
export type InsertViabilidade = typeof viabilidade.$inferInsert;

// 4. Tarefas de Negócios (alimentadas automaticamente pelas Próximas Ações)
export const businessTasks = pgTable("business_tasks", {
  id: serial("id").primaryKey(),
  negocioId: integer("negocio_id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: date("due_date").notNull(),
  priority: taskPriorityEnum("priority").default("normal").notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  assignedTo: integer("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BusinessTask = typeof businessTasks.$inferSelect;
export type InsertBusinessTask = typeof businessTasks.$inferInsert;

// ─── MÓDULO GESTÃO DE OBRAS ──────────────────────────────────────────────────

// 1. Empreiteiros
export const contractors = pgTable("contractors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  cpfCnpj: varchar("cpf_cnpj", { length: 20 }),
  specialty: varchar("specialty", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = typeof contractors.$inferInsert;

// 2. Arquitetas
export const architects = pgTable("architects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  cpfCnpj: varchar("cpf_cnpj", { length: 20 }),
  specialty: varchar("specialty", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Architect = typeof architects.$inferSelect;
export type InsertArchitect = typeof architects.$inferInsert;

// 3. Obras
export const constructions = pgTable("constructions", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  // Localização
  address: text("address"),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 2 }),
  // Controle de acesso
  hasKey: boolean("has_key").default(false),
  // Profissionais
  contractorId: integer("contractor_id"),
  architectId: integer("architect_id"),
  // Características
  constructionType: constructionTypeEnum("construction_type").default("residencial").notNull(),
  status: constructionStatusEnum("status").default("em_andamento").notNull(),
  progress: constructionProgressEnum("progress").default("em_dia").notNull(),
  // Extras
  description: text("description"),
  isArchived: boolean("is_archived").default(false),
  startDate: date("start_date"),
  expectedEndDate: date("expected_end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Construction = typeof constructions.$inferSelect;
export type InsertConstruction = typeof constructions.$inferInsert;

// 4. Relatórios de Obra (Diário de Obra)
export const constructionReports = pgTable("construction_reports", {
  id: serial("id").primaryKey(),
  constructionId: integer("construction_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  author: varchar("author", { length: 255 }),
  reportDate: date("report_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ConstructionReport = typeof constructionReports.$inferSelect;
export type InsertConstructionReport = typeof constructionReports.$inferInsert;

// 5. Imagens de Obra (Galeria)
export const constructionImages = pgTable("construction_images", {
  id: serial("id").primaryKey(),
  constructionId: integer("construction_id").notNull(),
  imageUrl: text("image_url").notNull(),
  imageKey: varchar("image_key", { length: 512 }),
  caption: varchar("caption", { length: 255 }),
  uploadedBy: varchar("uploaded_by", { length: 255 }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export type ConstructionImage = typeof constructionImages.$inferSelect;
export type InsertConstructionImage = typeof constructionImages.$inferInsert;

// 6. Calendário de Tarefas de Obra
export const constructionTasks = pgTable("construction_tasks", {
  id: serial("id").primaryKey(),
  constructionId: integer("construction_id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: date("due_date").notNull(),
  taskType: cTaskTypeEnum("task_type").default("outro").notNull(),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  assignedTo: integer("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ConstructionTask = typeof constructionTasks.$inferSelect;
export type InsertConstructionTask = typeof constructionTasks.$inferInsert;

// ─── SUPRIMENTOS E CHECKLIST DE OBRAS ──────────────────────────────────────

// 1. Categorias de Suprimentos (base fixa populada via seed)
export const supplyCategories = pgTable("supply_categories", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SupplyCategory = typeof supplyCategories.$inferSelect;
export type InsertSupplyCategory = typeof supplyCategories.$inferInsert;

// 2. Itens de Suprimento (itens dentro de cada categoria)
export const supplyItems = pgTable("supply_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SupplyItem = typeof supplyItems.$inferSelect;
export type InsertSupplyItem = typeof supplyItems.$inferInsert;

// 3. Itens de Obra (vínculo item + obra + quantidade + valor fechado)
export const constructionSupplyItems = pgTable("construction_supply_items", {
  id: serial("id").primaryKey(),
  constructionId: integer("construction_id").notNull(),
  categoryId: integer("category_id").notNull(),
  supplyItemId: integer("supply_item_id").notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 2 }),
  unit: varchar("unit", { length: 20 }).default("un"),
  closedValue: numeric("closed_value", { precision: 14, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ConstructionSupplyItem = typeof constructionSupplyItems.$inferSelect;
export type InsertConstructionSupplyItem = typeof constructionSupplyItems.$inferInsert;

// 4. Arquivos de Orçamento (PDFs vinculados à obra + categoria)
export const supplyFiles = pgTable("supply_files", {
  id: serial("id").primaryKey(),
  constructionId: integer("construction_id").notNull(),
  categoryId: integer("category_id").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileKey: varchar("file_key", { length: 512 }),
  uploadedBy: varchar("uploaded_by", { length: 255 }),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export type SupplyFile = typeof supplyFiles.$inferSelect;
export type InsertSupplyFile = typeof supplyFiles.$inferInsert;

// 5. Checklist de Ação da Obra (mesmo item base, marcado por obra)
export const constructionChecklist = pgTable("construction_checklist", {
  id: serial("id").primaryKey(),
  constructionId: integer("construction_id").notNull(),
  categoryId: integer("category_id").notNull(),
  supplyItemId: integer("supply_item_id").notNull(),
  isChecked: boolean("is_checked").default(false),
  checkedBy: integer("checked_by"),
  checkedAt: timestamp("checked_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ConstructionChecklistItem = typeof constructionChecklist.$inferSelect;
export type InsertConstructionChecklistItem = typeof constructionChecklist.$inferInsert;

// ─── MÓDULO FINANCEIRO ──────────────────────────────────────────────────────

// 1. Lançamentos Financeiros (Contas a Pagar e Receber unificados)
export const financialEntries = pgTable("financial_entries", {
  id: serial("id").primaryKey(),
  // Tipo: entrada (receber) ou saida (pagar)
  type: finTypeEnum("type").notNull(),
  // Categoria
  category: finCategoryEnum("category").default("outros").notNull(),
  // Descrição
  description: varchar("description", { length: 500 }).notNull(),
  // Valor (sempre positivo, o tipo define se é entrada ou saída)
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  // Datas
  dueDate: date("due_date").notNull(),
  paymentDate: date("payment_date"),
  // Status
  status: finStatusEnum("status").default("aberto").notNull(),
  // Centro de custo (vincula a um imóvel ou "Administração Central")
  propertyId: integer("property_id"),
  constructionId: integer("construction_id"),
  costCenter: varchar("cost_center", { length: 255 }).default("administracao_central"),
  // Vínculo com contrato de locação (para parcelas de aluguel)
  rentalContractId: integer("rental_contract_id"),
  // Conciliação bancária
  csvTransactionId: varchar("csv_transaction_id", { length: 255 }),
  isConciliated: boolean("is_conciliated").default(false),
  conciliationId: integer("conciliation_id"),
  // Recorrência (se veio de conta recorrente)
  recurringBillId: integer("recurring_bill_id"),
  // Parcela (se veio de cronograma de parcelas)
  installmentNumber: integer("installment_number"),
  totalInstallments: integer("total_installments"),
  // Multa e juros (para atrasos)
  lateFee: numeric("late_fee", { precision: 12, scale: 2 }),
  interestAmount: numeric("interest_amount", { precision: 12, scale: 2 }),
  // Notas
  notes: text("notes"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type FinancialEntry = typeof financialEntries.$inferSelect;
export type InsertFinancialEntry = typeof financialEntries.$inferInsert;

// 2. Contas Recorrentes (IPTU, Condomínio, etc.)
export const recurringBills = pgTable("recurring_bills", {
  id: serial("id").primaryKey(),
  // Descrição
  title: varchar("title", { length: 255 }).notNull(),
  category: rbCategoryEnum("category").notNull(),
  type: rbTypeEnum("type").default("saida").notNull(),
  // Valor base
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  // Centro de custo
  propertyId: integer("property_id"),
  costCenter: varchar("cost_center", { length: 255 }).default("administracao_central"),
  // Inscrição imobiliária (para IPTU)
  inscricaoImobiliaria: varchar("inscricao_imobiliaria", { length: 50 }),
  // Recorrência
  frequency: rbFrequencyEnum("frequency").default("mensal").notNull(),
  billingDay: integer("billing_day").default(10),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  // Geração automática
  lastGeneratedDate: date("last_generated_date"),
  notes: text("notes"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type RecurringBill = typeof recurringBills.$inferSelect;
export type InsertRecurringBill = typeof recurringBills.$inferInsert;

// 3. Importações de CSV Bancário (sessões de conciliação)
export const bankImports = pgTable("bank_imports", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  importDate: timestamp("import_date").defaultNow().notNull(),
  totalRows: integer("total_rows").default(0),
  conciliatedRows: integer("conciliated_rows").default(0),
  pendingRows: integer("pending_rows").default(0),
  status: biStatusEnum("status").default("pendente").notNull(),
  importedBy: integer("imported_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BankImport = typeof bankImports.$inferSelect;
export type InsertBankImport = typeof bankImports.$inferInsert;

// 4. Linhas do CSV (cada transação bancária importada)
export const bankTransactions = pgTable("bank_transactions", {
  id: serial("id").primaryKey(),
  bankImportId: integer("bank_import_id").notNull(),
  // Dados do CSV
  transactionDate: date("transaction_date").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  transactionId: varchar("transaction_id", { length: 255 }),
  // Conciliação
  status: btStatusEnum("status").default("pendente").notNull(),
  matchedEntryId: integer("matched_entry_id"),
  suggestedEntryId: integer("suggested_entry_id"),
  suggestedCategory: varchar("suggested_category", { length: 128 }),
  // Notas
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BankTransaction = typeof bankTransactions.$inferSelect;
export type InsertBankTransaction = typeof bankTransactions.$inferInsert;

// ─── MÓDULO PROCESSOS — CRÉDITOS JUDICIAIS (KANBAN) ─────────────────────────

// Fase do registro em cartório
export const creditoRegistroEnum = pgEnum("credito_registro", ["sem_registro", "com_registro"]);

// Coluna do kanban (cobre as duas fases)
export const creditoStageEnum = pgEnum("credito_stage", [
  // Fase: sem registro cartório
  "registro_em_andamento",
  // Fase: com registro cartório
  "desocupado",
  "sem_acao_judicial",
  "acao_judicial_ordinaria",
  "execucao",
  "com_pedido_desocupacao",
]);

export const creditosJudiciais = pgTable("creditos_judiciais", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  processNumber: varchar("process_number", { length: 64 }),
  address: text("address"),
  value: numeric("value", { precision: 14, scale: 2 }),
  registroStatus: creditoRegistroEnum("registro_status").default("sem_registro").notNull(),
  stage: creditoStageEnum("stage").default("registro_em_andamento").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CreditoJudicial = typeof creditosJudiciais.$inferSelect;
export type InsertCreditoJudicial = typeof creditosJudiciais.$inferInsert;

// ─── MÓDULO PROCESSOS — IMÓVEIS RETOMADOS (KANBAN) ──────────────────────────

export const imoveisRetomados = pgTable("imoveis_retomados", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  processNumber: varchar("process_number", { length: 64 }),
  address: text("address"),
  value: numeric("value", { precision: 14, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ImovelRetomado = typeof imoveisRetomados.$inferSelect;
export type InsertImovelRetomado = typeof imoveisRetomados.$inferInsert;
