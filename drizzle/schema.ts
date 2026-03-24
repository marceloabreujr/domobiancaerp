import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date, boolean } from "drizzle-orm/mysql-core";

// ─── USERS ──────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 64 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  plainPassword: varchar("plainPassword", { length: 255 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "gerente", "operador"]).default("operador").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UserRole = User["role"];

// ─── MÓDULO ADMINISTRATIVO ──────────────────────────────────────────────────

// 1. RH — Colaboradores
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cpf: varchar("cpf", { length: 14 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  position: varchar("position", { length: 128 }),
  department: varchar("department", { length: 128 }),
  salary: decimal("salary", { precision: 12, scale: 2 }),
  hireDate: date("hireDate"),
  status: mysqlEnum("status", ["ativo", "ferias", "afastado", "desligado"]).default("ativo").notNull(),
  projectAllocation: varchar("projectAllocation", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

// 2. RH — Férias e Faltas
export const timeOff = mysqlTable("time_off", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull(),
  type: mysqlEnum("type", ["ferias", "falta_justificada", "falta_injustificada", "licenca", "outro"]).notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  reason: text("reason"),
  approved: boolean("approved").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimeOff = typeof timeOff.$inferSelect;
export type InsertTimeOff = typeof timeOff.$inferInsert;

// 3. Documentos (GED)
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["contrato", "alvara", "certidao", "planta", "foto", "fatura", "recibo", "outro"]).notNull(),
  description: text("description"),
  fileUrl: text("fileUrl"),
  fileKey: varchar("fileKey", { length: 512 }),
  fileName: varchar("fileName", { length: 255 }),
  mimeType: varchar("mimeType", { length: 128 }),
  expiryDate: date("expiryDate"),
  relatedEntity: varchar("relatedEntity", { length: 128 }),
  relatedEntityId: int("relatedEntityId"),
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// 4. Calendário e Alertas
export const calendarEvents = mysqlTable("calendar_events", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: date("eventDate").notNull(),
  eventType: mysqlEnum("eventType", ["vencimento_contrato", "renovacao_licenca", "manutencao", "marco_projeto", "reuniao", "outro"]).notNull(),
  relatedEntity: varchar("relatedEntity", { length: 128 }),
  relatedEntityId: int("relatedEntityId"),
  alertDaysBefore: int("alertDaysBefore").default(7),
  isCompleted: boolean("isCompleted").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;

// 5. Consumíveis (stock de escritório/copa)
export const supplies = mysqlTable("supplies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["escritorio", "copa", "limpeza", "outro"]).default("outro").notNull(),
  currentStock: int("currentStock").default(0),
  minStock: int("minStock").default(5),
  unit: varchar("unit", { length: 32 }).default("un"),
  lastRestocked: date("lastRestocked"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supply = typeof supplies.$inferSelect;
export type InsertSupply = typeof supplies.$inferInsert;

// 6. Frota automóvel
export const fleet = mysqlTable("fleet", {
  id: int("id").autoincrement().primaryKey(),
  plate: varchar("plate", { length: 10 }).notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  year: int("year"),
  status: mysqlEnum("status", ["disponivel", "em_uso", "manutencao", "inativo"]).default("disponivel").notNull(),
  assignedTo: varchar("assignedTo", { length: 255 }),
  nextMaintenanceDate: date("nextMaintenanceDate"),
  km: int("km"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FleetVehicle = typeof fleet.$inferSelect;
export type InsertFleetVehicle = typeof fleet.$inferInsert;

// 7. Fundo de maneio (caixa pequena)
export const pettyCash = mysqlTable("petty_cash", {
  id: int("id").autoincrement().primaryKey(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: mysqlEnum("type", ["entrada", "saida"]).notNull(),
  category: varchar("category", { length: 128 }),
  date: date("date").notNull(),
  receiptUrl: text("receiptUrl"),
  receiptKey: varchar("receiptKey", { length: 512 }),
  registeredBy: int("registeredBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PettyCashEntry = typeof pettyCash.$inferSelect;
export type InsertPettyCashEntry = typeof pettyCash.$inferInsert;

// 8. Chamados (helpdesk interno)
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["ti", "manutencao", "limpeza", "seguranca", "outro"]).default("outro").notNull(),
  priority: mysqlEnum("priority", ["baixa", "media", "alta", "urgente"]).default("media").notNull(),
  status: mysqlEnum("status", ["aberto", "em_andamento", "resolvido", "fechado"]).default("aberto").notNull(),
  requestedBy: int("requestedBy"),
  assignedTo: varchar("assignedTo", { length: 255 }),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

// ─── MÓDULO GESTÃO DE IMÓVEIS ──────────────────────────────────────────────

// 1. Proprietários
export const owners = mysqlTable("owners", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cpfCnpj: varchar("cpfCnpj", { length: 20 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  phone2: varchar("phone2", { length: 20 }),
  address: text("address"),
  bankName: varchar("bankName", { length: 128 }),
  bankAgency: varchar("bankAgency", { length: 20 }),
  bankAccount: varchar("bankAccount", { length: 30 }),
  pixKey: varchar("pixKey", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Owner = typeof owners.$inferSelect;
export type InsertOwner = typeof owners.$inferInsert;

// 2. Clientes (inquilinos / compradores)
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  cpfCnpj: varchar("cpfCnpj", { length: 20 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  phone2: varchar("phone2", { length: 20 }),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// 3. Imóveis
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 20 }),
  title: varchar("title", { length: 255 }).notNull(),
  ownership: mysqlEnum("ownership", ["domobianca", "terceiros"]).default("domobianca").notNull(),
  propertyType: mysqlEnum("propertyType", ["residencial", "apartamento", "galpao", "sala_comercial", "lote", "casa", "cobertura", "kitnet", "outro"]).default("residencial").notNull(),
  status: mysqlEnum("status", ["disponivel_locacao", "disponivel_venda", "alugado", "vendido", "arquivado"]).default("disponivel_locacao").notNull(),
  ownerId: int("ownerId"),
  // Endereço
  street: varchar("street", { length: 255 }),
  number: varchar("number", { length: 20 }),
  complement: varchar("complement", { length: 128 }),
  neighborhood: varchar("neighborhood", { length: 128 }),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  // Características
  area: decimal("area", { precision: 10, scale: 2 }),
  bedrooms: int("bedrooms"),
  bathrooms: int("bathrooms"),
  parkingSpots: int("parkingSpots"),
  suites: int("suites"),
  // Valores
  rentValue: decimal("rentValue", { precision: 12, scale: 2 }),
  saleValue: decimal("saleValue", { precision: 14, scale: 2 }),
  condoFee: decimal("condoFee", { precision: 10, scale: 2 }),
  iptuValue: decimal("iptuValue", { precision: 10, scale: 2 }),
  // Administração (para imóveis de terceiros)
  adminFeePercent: decimal("adminFeePercent", { precision: 5, scale: 2 }),
  saleCommissionPercent: decimal("saleCommissionPercent", { precision: 5, scale: 2 }),
  // Extras
  description: text("description"),
  features: text("features"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

// 4. Contratos de Locação
export const rentalContracts = mysqlTable("rental_contracts", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  tenantId: int("tenantId").notNull(),
  occupantName: varchar("occupantName", { length: 255 }),
  occupantCpf: varchar("occupantCpf", { length: 14 }),
  // Datas
  startDate: date("startDate").notNull(),
  endDate: date("endDate"),
  leaseTerm: mysqlEnum("leaseTerm", ["quinzenal", "mensal", "trimestral", "semestral", "anual", "2_anos", "3_anos"]).default("anual").notNull(),
  // Valores
  rentAmount: decimal("rentAmount", { precision: 12, scale: 2 }).notNull(),
  condoIncluded: boolean("condoIncluded").default(false),
  iptuIncluded: boolean("iptuIncluded").default(false),
  isPackage: boolean("isPackage").default(false),
  packageTotal: decimal("packageTotal", { precision: 12, scale: 2 }),
  // Reajuste
  adjustmentIndex: mysqlEnum("adjustmentIndex", ["igpm", "ipca", "inpc", "nenhum"]).default("igpm").notNull(),
  adjustmentValue: decimal("adjustmentValue", { precision: 12, scale: 2 }),
  nextAdjustmentDate: date("nextAdjustmentDate"),
  // Cobrança
  billingDay: int("billingDay").default(10),
  lateFeePercent: decimal("lateFeePercent", { precision: 5, scale: 2 }).default("2.00"),
  dailyInterestPercent: decimal("dailyInterestPercent", { precision: 5, scale: 4 }).default("0.0333"),
  // PDF do contrato assinado
  contractFileUrl: text("contractFileUrl"),
  contractFileKey: varchar("contractFileKey", { length: 512 }),
  contractFileName: varchar("contractFileName", { length: 255 }),
  // Status
  status: mysqlEnum("contractStatus", ["ativo", "encerrado", "pendente", "rescindido"]).default("ativo").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RentalContract = typeof rentalContracts.$inferSelect;
export type InsertRentalContract = typeof rentalContracts.$inferInsert;

// 5. To-Do List do módulo de imóveis
export const propertyTodos = mysqlTable("property_todos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  propertyId: int("propertyId"),
  dueDate: date("dueDate"),
  priority: mysqlEnum("priority", ["baixa", "media", "alta"]).default("media").notNull(),
  isCompleted: boolean("isCompleted").default(false),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PropertyTodo = typeof propertyTodos.$inferSelect;
export type InsertPropertyTodo = typeof propertyTodos.$inferInsert;

// 6. Checklist Mensal de Imóveis
export const propertyChecklists = mysqlTable("property_checklists", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  month: int("month").notNull(),
  year: int("year").notNull(),
  item: varchar("item", { length: 255 }).notNull(),
  isChecked: boolean("isChecked").default(false),
  notes: text("notes"),
  checkedBy: int("checkedBy"),
  checkedAt: timestamp("checkedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PropertyChecklist = typeof propertyChecklists.$inferSelect;
export type InsertPropertyChecklist = typeof propertyChecklists.$inferInsert;

// ─── MÓDULO GESTÃO DE NEGÓCIOS ──────────────────────────────────────────────

// 1. Captadores (Parceiros de Negócio)
export const captadores = mysqlTable("captadores", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  partnerType: mysqlEnum("partnerType", ["corretor", "advogado", "investidor", "permutario", "outros"]).default("corretor").notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  cpfCnpj: varchar("cpfCnpj", { length: 20 }),
  defaultCommission: decimal("defaultCommission", { precision: 5, scale: 2 }).default("5.00"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Captador = typeof captadores.$inferSelect;
export type InsertCaptador = typeof captadores.$inferInsert;

// 2. Negócios (Oportunidades)
export const negocios = mysqlTable("negocios", {
  id: int("id").autoincrement().primaryKey(),
  // Seção 1 - Identificação
  title: varchar("title", { length: 255 }).notNull(),
  ownership: mysqlEnum("negOwnership", ["proprio", "terceiros"]).default("proprio").notNull(),
  captadorId: int("captadorId"),
  address: text("address"),
  city: varchar("negCity", { length: 128 }),
  state: varchar("negState", { length: 2 }),
  // Seção 2 - Classificação e Estado
  phase: mysqlEnum("phase", ["prospeccao", "analise", "negociacao", "due_diligence", "aprovado", "fechado", "cancelado"]).default("prospeccao").notNull(),
  operationType: mysqlEnum("operationType", ["compra", "venda", "permuta", "incorporacao", "loteamento", "reforma", "outro"]).default("compra").notNull(),
  priority: mysqlEnum("negPriority", ["baixa", "media", "alta", "urgente"]).default("media").notNull(),
  // Seção 3 - Dados Técnicos
  totalArea: decimal("totalArea", { precision: 12, scale: 2 }),
  usableArea: decimal("usableArea", { precision: 12, scale: 2 }),
  zoning: varchar("zoning", { length: 128 }),
  constructivePotential: decimal("constructivePotential", { precision: 8, scale: 2 }),
  // Seção 4 - Indicadores Financeiros
  opportunityCost: decimal("opportunityCost", { precision: 14, scale: 2 }),
  marketValue: decimal("marketValue", { precision: 14, scale: 2 }),
  maxInvestment: decimal("maxInvestment", { precision: 14, scale: 2 }),
  estimatedVGV: decimal("estimatedVGV", { precision: 14, scale: 2 }),
  tirPercent: decimal("tirPercent", { precision: 8, scale: 2 }),
  profitMarginPercent: decimal("profitMarginPercent", { precision: 8, scale: 2 }),
  // Seção 5 - Riscos e Próximos Passos
  documentationStatus: text("documentationStatus"),
  nextAction: text("nextAction"),
  nextActionPriority: mysqlEnum("nextActionPriority", ["normal", "urgente"]).default("normal"),
  nextActionDate: date("nextActionDate"),
  // Status
  isArchived: boolean("isArchived").default(false),
  notes: text("negNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Negocio = typeof negocios.$inferSelect;
export type InsertNegocio = typeof negocios.$inferInsert;

// 3. Viabilidade Econômica (EVE) — vinculada a um negócio
export const viabilidade = mysqlTable("viabilidade", {
  id: int("id").autoincrement().primaryKey(),
  negocioId: int("negocioId").notNull(),
  // Inputs de custo
  landCost: decimal("landCost", { precision: 14, scale: 2 }).default("0"),
  constructionCost: decimal("constructionCost", { precision: 14, scale: 2 }).default("0"),
  indirectCosts: decimal("indirectCosts", { precision: 14, scale: 2 }).default("0"),
  taxes: decimal("taxes", { precision: 14, scale: 2 }).default("0"),
  commissions: decimal("commissions", { precision: 14, scale: 2 }).default("0"),
  // Outputs calculados
  totalCost: decimal("totalCost", { precision: 14, scale: 2 }),
  netProfit: decimal("netProfit", { precision: 14, scale: 2 }),
  profitMargin: decimal("profitMargin", { precision: 8, scale: 2 }),
  tir: decimal("tir", { precision: 8, scale: 2 }),
  roi: decimal("roi", { precision: 8, scale: 2 }),
  // Farol
  viabilityStatus: mysqlEnum("viabilityStatus", ["verde", "amarelo", "vermelho"]).default("amarelo"),
  notes: text("viabNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Viabilidade = typeof viabilidade.$inferSelect;
export type InsertViabilidade = typeof viabilidade.$inferInsert;

// 4. Tarefas de Negócios (alimentadas automaticamente pelas Próximas Ações)
export const businessTasks = mysqlTable("business_tasks", {
  id: int("id").autoincrement().primaryKey(),
  negocioId: int("negocioId"),
  title: varchar("taskTitle", { length: 255 }).notNull(),
  description: text("taskDescription"),
  dueDate: date("taskDueDate").notNull(),
  priority: mysqlEnum("taskPriority", ["normal", "urgente"]).default("normal").notNull(),
  isCompleted: boolean("taskIsCompleted").default(false),
  completedAt: timestamp("taskCompletedAt"),
  createdAt: timestamp("taskCreatedAt").defaultNow().notNull(),
});

export type BusinessTask = typeof businessTasks.$inferSelect;
export type InsertBusinessTask = typeof businessTasks.$inferInsert;

// ─── MÓDULO GESTÃO DE OBRAS ──────────────────────────────────────────────────

// 1. Empreiteiros
export const contractors = mysqlTable("contractors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("contractorPhone", { length: 20 }),
  email: varchar("contractorEmail", { length: 320 }),
  cpfCnpj: varchar("contractorCpfCnpj", { length: 20 }),
  specialty: varchar("contractorSpecialty", { length: 255 }),
  notes: text("contractorNotes"),
  createdAt: timestamp("contractorCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("contractorUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contractor = typeof contractors.$inferSelect;
export type InsertContractor = typeof contractors.$inferInsert;

// 2. Arquitetas
export const architects = mysqlTable("architects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("architectName", { length: 255 }).notNull(),
  phone: varchar("architectPhone", { length: 20 }),
  email: varchar("architectEmail", { length: 320 }),
  cpfCnpj: varchar("architectCpfCnpj", { length: 20 }),
  specialty: varchar("architectSpecialty", { length: 255 }),
  notes: text("architectNotes"),
  createdAt: timestamp("architectCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("architectUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Architect = typeof architects.$inferSelect;
export type InsertArchitect = typeof architects.$inferInsert;

// 3. Obras
export const constructions = mysqlTable("constructions", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("constructionTitle", { length: 255 }).notNull(),
  // Localização
  address: text("constructionAddress"),
  city: varchar("constructionCity", { length: 128 }),
  state: varchar("constructionState", { length: 2 }),
  // Controle de acesso
  hasKey: boolean("hasKey").default(false),
  // Profissionais
  contractorId: int("contractorId"),
  architectId: int("architectId"),
  // Características
  constructionType: mysqlEnum("constructionType", ["residencial", "comercial", "reforma", "galpao", "loteamento", "outro"]).default("residencial").notNull(),
  status: mysqlEnum("constructionStatus", ["em_andamento", "paralisada", "concluida"]).default("em_andamento").notNull(),
  progress: mysqlEnum("constructionProgress", ["avancada", "em_dia", "atrasada", "totalmente_atrasada"]).default("em_dia").notNull(),
  // Extras
  description: text("constructionDescription"),
  isArchived: boolean("constructionIsArchived").default(false),
  startDate: date("constructionStartDate"),
  expectedEndDate: date("constructionExpectedEndDate"),
  createdAt: timestamp("constructionCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("constructionUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Construction = typeof constructions.$inferSelect;
export type InsertConstruction = typeof constructions.$inferInsert;

// 4. Relatórios de Obra (Diário de Obra)
export const constructionReports = mysqlTable("construction_reports", {
  id: int("id").autoincrement().primaryKey(),
  constructionId: int("reportConstructionId").notNull(),
  title: varchar("reportTitle", { length: 255 }).notNull(),
  content: text("reportContent").notNull(),
  author: varchar("reportAuthor", { length: 255 }),
  reportDate: date("reportDate").notNull(),
  createdAt: timestamp("reportCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("reportUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConstructionReport = typeof constructionReports.$inferSelect;
export type InsertConstructionReport = typeof constructionReports.$inferInsert;

// 5. Imagens de Obra (Galeria)
export const constructionImages = mysqlTable("construction_images", {
  id: int("id").autoincrement().primaryKey(),
  constructionId: int("imageConstructionId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageKey: varchar("imageKey", { length: 512 }),
  caption: varchar("imageCaption", { length: 255 }),
  uploadedBy: varchar("imageUploadedBy", { length: 255 }),
  uploadedAt: timestamp("imageUploadedAt").defaultNow().notNull(),
});

export type ConstructionImage = typeof constructionImages.$inferSelect;
export type InsertConstructionImage = typeof constructionImages.$inferInsert;

// 6. Calendário de Tarefas de Obra
export const constructionTasks = mysqlTable("construction_tasks", {
  id: int("id").autoincrement().primaryKey(),
  constructionId: int("taskConstructionId"),
  title: varchar("cTaskTitle", { length: 255 }).notNull(),
  description: text("cTaskDescription"),
  dueDate: date("cTaskDueDate").notNull(),
  taskType: mysqlEnum("cTaskType", ["marco", "prazo_entrega", "vistoria", "reuniao", "outro"]).default("outro").notNull(),
  isCompleted: boolean("cTaskIsCompleted").default(false),
  completedAt: timestamp("cTaskCompletedAt"),
  createdAt: timestamp("cTaskCreatedAt").defaultNow().notNull(),
});

export type ConstructionTask = typeof constructionTasks.$inferSelect;
export type InsertConstructionTask = typeof constructionTasks.$inferInsert;

// ─── SUPRIMENTOS E CHECKLIST DE OBRAS ──────────────────────────────────────

// 1. Categorias de Suprimentos (base fixa populada via seed)
export const supplyCategories = mysqlTable("supply_categories", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("scCode", { length: 10 }).notNull(),
  name: varchar("scName", { length: 255 }).notNull(),
  createdAt: timestamp("scCreatedAt").defaultNow().notNull(),
});

export type SupplyCategory = typeof supplyCategories.$inferSelect;
export type InsertSupplyCategory = typeof supplyCategories.$inferInsert;

// 2. Itens de Suprimento (itens dentro de cada categoria)
export const supplyItems = mysqlTable("supply_items", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("siCategoryId").notNull(),
  name: varchar("siName", { length: 255 }).notNull(),
  createdAt: timestamp("siCreatedAt").defaultNow().notNull(),
});

export type SupplyItem = typeof supplyItems.$inferSelect;
export type InsertSupplyItem = typeof supplyItems.$inferInsert;

// 3. Itens de Obra (vínculo item + obra + quantidade + valor fechado)
export const constructionSupplyItems = mysqlTable("construction_supply_items", {
  id: int("id").autoincrement().primaryKey(),
  constructionId: int("csiConstructionId").notNull(),
  categoryId: int("csiCategoryId").notNull(),
  supplyItemId: int("csiSupplyItemId").notNull(),
  quantity: decimal("csiQuantity", { precision: 12, scale: 2 }),
  unit: varchar("csiUnit", { length: 20 }).default("un"),
  closedValue: decimal("csiClosedValue", { precision: 14, scale: 2 }),
  notes: text("csiNotes"),
  createdAt: timestamp("csiCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("csiUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConstructionSupplyItem = typeof constructionSupplyItems.$inferSelect;
export type InsertConstructionSupplyItem = typeof constructionSupplyItems.$inferInsert;

// 4. Arquivos de Orçamento (PDFs vinculados à obra + categoria)
export const supplyFiles = mysqlTable("supply_files", {
  id: int("id").autoincrement().primaryKey(),
  constructionId: int("sfConstructionId").notNull(),
  categoryId: int("sfCategoryId").notNull(),
  fileName: varchar("sfFileName", { length: 255 }).notNull(),
  fileUrl: text("sfFileUrl").notNull(),
  fileKey: varchar("sfFileKey", { length: 512 }),
  uploadedBy: varchar("sfUploadedBy", { length: 255 }),
  uploadedAt: timestamp("sfUploadedAt").defaultNow().notNull(),
});

export type SupplyFile = typeof supplyFiles.$inferSelect;
export type InsertSupplyFile = typeof supplyFiles.$inferInsert;

// 5. Checklist de Ação da Obra (mesmo item base, marcado por obra)
export const constructionChecklist = mysqlTable("construction_checklist", {
  id: int("id").autoincrement().primaryKey(),
  constructionId: int("clConstructionId").notNull(),
  categoryId: int("clCategoryId").notNull(),
  supplyItemId: int("clSupplyItemId").notNull(),
  isChecked: boolean("clIsChecked").default(false),
  checkedBy: int("clCheckedBy"),
  checkedAt: timestamp("clCheckedAt"),
  notes: text("clNotes"),
  createdAt: timestamp("clCreatedAt").defaultNow().notNull(),
});

export type ConstructionChecklistItem = typeof constructionChecklist.$inferSelect;
export type InsertConstructionChecklistItem = typeof constructionChecklist.$inferInsert;

// ─── MÓDULO FINANCEIRO ──────────────────────────────────────────────────────

// 1. Lançamentos Financeiros (Contas a Pagar e Receber unificados)
export const financialEntries = mysqlTable("financial_entries", {
  id: int("id").autoincrement().primaryKey(),
  // Tipo: entrada (receber) ou saida (pagar)
  type: mysqlEnum("finType", ["entrada", "saida"]).notNull(),
  // Categoria
  category: mysqlEnum("finCategory", [
    "aluguel", "condominio", "iptu", "venda", "manutencao",
    "comissao", "taxa_admin", "seguro", "agua", "luz",
    "gas", "internet", "material", "mao_de_obra", "outros"
  ]).default("outros").notNull(),
  // Descrição
  description: varchar("finDescription", { length: 500 }).notNull(),
  // Valor (sempre positivo, o tipo define se é entrada ou saída)
  amount: decimal("finAmount", { precision: 14, scale: 2 }).notNull(),
  // Datas
  dueDate: date("finDueDate", { mode: "string" }).notNull(),
  paymentDate: date("finPaymentDate", { mode: "string" }),
  // Status
  status: mysqlEnum("finStatus", ["aberto", "pago", "cancelado", "atrasado"]).default("aberto").notNull(),
  // Centro de custo (vincula a um imóvel ou "Administração Central")
  propertyId: int("finPropertyId"),
  constructionId: int("finConstructionId"),
  costCenter: varchar("finCostCenter", { length: 255 }).default("administracao_central"),
  // Vínculo com contrato de locação (para parcelas de aluguel)
  rentalContractId: int("finRentalContractId"),
  // Conciliação bancária
  csvTransactionId: varchar("finCsvTransactionId", { length: 255 }),
  isConciliated: boolean("finIsConciliated").default(false),
  conciliationId: int("finConciliationId"),
  // Recorrência (se veio de conta recorrente)
  recurringBillId: int("finRecurringBillId"),
  // Parcela (se veio de cronograma de parcelas)
  installmentNumber: int("finInstallmentNumber"),
  totalInstallments: int("finTotalInstallments"),
  // Multa e juros (para atrasos)
  lateFee: decimal("finLateFee", { precision: 12, scale: 2 }),
  interestAmount: decimal("finInterestAmount", { precision: 12, scale: 2 }),
  // Notas
  notes: text("finNotes"),
  createdBy: int("finCreatedBy"),
  createdAt: timestamp("finCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("finUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialEntry = typeof financialEntries.$inferSelect;
export type InsertFinancialEntry = typeof financialEntries.$inferInsert;

// 2. Contas Recorrentes (IPTU, Condomínio, etc.)
export const recurringBills = mysqlTable("recurring_bills", {
  id: int("id").autoincrement().primaryKey(),
  // Descrição
  title: varchar("rbTitle", { length: 255 }).notNull(),
  category: mysqlEnum("rbCategory", [
    "iptu", "condominio", "seguro", "agua", "luz", "gas", "internet", "outros"
  ]).notNull(),
  type: mysqlEnum("rbType", ["entrada", "saida"]).default("saida").notNull(),
  // Valor base
  amount: decimal("rbAmount", { precision: 14, scale: 2 }).notNull(),
  // Centro de custo
  propertyId: int("rbPropertyId"),
  costCenter: varchar("rbCostCenter", { length: 255 }).default("administracao_central"),
  // Inscrição imobiliária (para IPTU)
  inscricaoImobiliaria: varchar("rbInscricao", { length: 50 }),
  // Recorrência
  frequency: mysqlEnum("rbFrequency", ["mensal", "bimestral", "trimestral", "semestral", "anual"]).default("mensal").notNull(),
  billingDay: int("rbBillingDay").default(10),
  startDate: date("rbStartDate", { mode: "string" }).notNull(),
  endDate: date("rbEndDate", { mode: "string" }),
  // Status
  isActive: boolean("rbIsActive").default(true).notNull(),
  // Geração automática
  lastGeneratedDate: date("rbLastGeneratedDate", { mode: "string" }),
  notes: text("rbNotes"),
  createdBy: int("rbCreatedBy"),
  createdAt: timestamp("rbCreatedAt").defaultNow().notNull(),
  updatedAt: timestamp("rbUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RecurringBill = typeof recurringBills.$inferSelect;
export type InsertRecurringBill = typeof recurringBills.$inferInsert;

// 3. Importações de CSV Bancário (sessões de conciliação)
export const bankImports = mysqlTable("bank_imports", {
  id: int("id").autoincrement().primaryKey(),
  fileName: varchar("biFileName", { length: 255 }).notNull(),
  importDate: timestamp("biImportDate").defaultNow().notNull(),
  totalRows: int("biTotalRows").default(0),
  conciliatedRows: int("biConciliatedRows").default(0),
  pendingRows: int("biPendingRows").default(0),
  status: mysqlEnum("biStatus", ["pendente", "parcial", "concluido"]).default("pendente").notNull(),
  importedBy: int("biImportedBy"),
  createdAt: timestamp("biCreatedAt").defaultNow().notNull(),
});

export type BankImport = typeof bankImports.$inferSelect;
export type InsertBankImport = typeof bankImports.$inferInsert;

// 4. Linhas do CSV (cada transação bancária importada)
export const bankTransactions = mysqlTable("bank_transactions", {
  id: int("id").autoincrement().primaryKey(),
  bankImportId: int("btBankImportId").notNull(),
  // Dados do CSV
  transactionDate: date("btTransactionDate", { mode: "string" }).notNull(),
  description: varchar("btDescription", { length: 500 }).notNull(),
  amount: decimal("btAmount", { precision: 14, scale: 2 }).notNull(),
  transactionId: varchar("btTransactionId", { length: 255 }),
  // Conciliação
  status: mysqlEnum("btStatus", ["pendente", "conciliado", "ignorado", "manual"]).default("pendente").notNull(),
  matchedEntryId: int("btMatchedEntryId"),
  suggestedEntryId: int("btSuggestedEntryId"),
  suggestedCategory: varchar("btSuggestedCategory", { length: 128 }),
  // Notas
  notes: text("btNotes"),
  createdAt: timestamp("btCreatedAt").defaultNow().notNull(),
});

export type BankTransaction = typeof bankTransactions.$inferSelect;
export type InsertBankTransaction = typeof bankTransactions.$inferInsert;
