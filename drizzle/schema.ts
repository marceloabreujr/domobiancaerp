import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date, boolean } from "drizzle-orm/mysql-core";

// ─── USERS ──────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["admin", "gerente", "operador"]).default("operador").notNull(),
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
