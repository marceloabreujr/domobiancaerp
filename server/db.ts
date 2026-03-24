import { eq, desc, asc, and, lte, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, UserRole,
  employees, InsertEmployee,
  timeOff, InsertTimeOff,
  documents, InsertDocument,
  calendarEvents, InsertCalendarEvent,
  supplies, InsertSupply,
  fleet, InsertFleetVehicle,
  pettyCash, InsertPettyCashEntry,
  tickets, InsertTicket,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── USERS ──────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(userId: number, role: UserRole) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function listUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, lastSignedIn: users.lastSignedIn, createdAt: users.createdAt }).from(users);
}

// ─── EMPLOYEES (RH) ────────────────────────────────────────────────────────

export async function listEmployees() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employees).orderBy(asc(employees.name));
}

export async function getEmployee(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  return r[0];
}

export async function createEmployee(data: InsertEmployee) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(employees).values(data);
  return { id: r[0].insertId };
}

export async function updateEmployee(id: number, data: Partial<InsertEmployee>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(employees).set(data).where(eq(employees.id, id));
}

export async function deleteEmployee(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(employees).where(eq(employees.id, id));
}

// ─── TIME OFF (Férias/Faltas) ──────────────────────────────────────────────

export async function listTimeOff(employeeId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (employeeId) return db.select().from(timeOff).where(eq(timeOff.employeeId, employeeId)).orderBy(desc(timeOff.startDate));
  return db.select().from(timeOff).orderBy(desc(timeOff.startDate));
}

export async function createTimeOff(data: InsertTimeOff) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(timeOff).values(data);
  return { id: r[0].insertId };
}

export async function updateTimeOff(id: number, data: Partial<InsertTimeOff>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(timeOff).set(data).where(eq(timeOff.id, id));
}

export async function deleteTimeOff(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(timeOff).where(eq(timeOff.id, id));
}

// ─── DOCUMENTS (GED) ───────────────────────────────────────────────────────

export async function listDocuments(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category) return db.select().from(documents).where(eq(documents.category, category as any)).orderBy(desc(documents.createdAt));
  return db.select().from(documents).orderBy(desc(documents.createdAt));
}

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(documents).values(data);
  return { id: r[0].insertId };
}

export async function updateDocument(id: number, data: Partial<InsertDocument>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(documents).set(data).where(eq(documents.id, id));
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(documents).where(eq(documents.id, id));
}

export async function getExpiringDocuments(daysAhead: number = 30) {
  const db = await getDb();
  if (!db) return [];
  const today = new Date().toISOString().split("T")[0];
  const futureDate = new Date(Date.now() + daysAhead * 86400000).toISOString().split("T")[0];
  return db.select().from(documents).where(
    and(
      sql`${documents.expiryDate} >= ${today}`,
      sql`${documents.expiryDate} <= ${futureDate}`
    )
  ).orderBy(asc(documents.expiryDate));
}

// ─── CALENDAR EVENTS ────────────────────────────────────────────────────────

export async function listCalendarEvents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(calendarEvents).orderBy(asc(calendarEvents.eventDate));
}

export async function createCalendarEvent(data: InsertCalendarEvent) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(calendarEvents).values(data);
  return { id: r[0].insertId };
}

export async function updateCalendarEvent(id: number, data: Partial<InsertCalendarEvent>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(calendarEvents).set(data).where(eq(calendarEvents.id, id));
}

export async function deleteCalendarEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
}

// ─── SUPPLIES (Consumíveis) ─────────────────────────────────────────────────

export async function listSupplies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supplies).orderBy(asc(supplies.name));
}

export async function createSupply(data: InsertSupply) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(supplies).values(data);
  return { id: r[0].insertId };
}

export async function updateSupply(id: number, data: Partial<InsertSupply>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(supplies).set(data).where(eq(supplies.id, id));
}

export async function deleteSupply(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(supplies).where(eq(supplies.id, id));
}

// ─── FLEET (Frota) ─────────────────────────────────────────────────────────

export async function listFleet() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fleet).orderBy(asc(fleet.model));
}

export async function createFleetVehicle(data: InsertFleetVehicle) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(fleet).values(data);
  return { id: r[0].insertId };
}

export async function updateFleetVehicle(id: number, data: Partial<InsertFleetVehicle>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(fleet).set(data).where(eq(fleet.id, id));
}

export async function deleteFleetVehicle(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(fleet).where(eq(fleet.id, id));
}

// ─── PETTY CASH (Fundo de Maneio) ──────────────────────────────────────────

export async function listPettyCash() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pettyCash).orderBy(desc(pettyCash.date));
}

export async function createPettyCashEntry(data: InsertPettyCashEntry) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(pettyCash).values(data);
  return { id: r[0].insertId };
}

export async function deletePettyCashEntry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(pettyCash).where(eq(pettyCash.id, id));
}

export async function getPettyCashBalance() {
  const db = await getDb();
  if (!db) return { entradas: 0, saidas: 0, saldo: 0 };
  const result = await db.select({
    type: pettyCash.type,
    total: sql<string>`SUM(${pettyCash.amount})`,
  }).from(pettyCash).groupBy(pettyCash.type);
  let entradas = 0, saidas = 0;
  for (const row of result) {
    if (row.type === "entrada") entradas = parseFloat(row.total || "0");
    if (row.type === "saida") saidas = parseFloat(row.total || "0");
  }
  return { entradas, saidas, saldo: entradas - saidas };
}

// ─── TICKETS (Chamados) ─────────────────────────────────────────────────────

export async function listTickets(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) return db.select().from(tickets).where(eq(tickets.status, status as any)).orderBy(desc(tickets.createdAt));
  return db.select().from(tickets).orderBy(desc(tickets.createdAt));
}

export async function createTicket(data: InsertTicket) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(tickets).values(data);
  return { id: r[0].insertId };
}

export async function updateTicket(id: number, data: Partial<InsertTicket>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(tickets).set(data).where(eq(tickets.id, id));
}

export async function deleteTicket(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(tickets).where(eq(tickets.id, id));
}

// ─── MÓDULO GESTÃO DE IMÓVEIS ──────────────────────────────────────────────

import {
  owners, InsertOwner,
  clients, InsertClient,
  properties, InsertProperty,
  rentalContracts, InsertRentalContract,
  propertyTodos, InsertPropertyTodo,
  propertyChecklists, InsertPropertyChecklist,
} from "../drizzle/schema";

// ─── OWNERS (Proprietários) ────────────────────────────────────────────────

export async function listOwners() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(owners).orderBy(asc(owners.name));
}

export async function getOwner(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(owners).where(eq(owners.id, id)).limit(1);
  return r[0];
}

export async function createOwner(data: InsertOwner) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(owners).values(data);
  return { id: r[0].insertId };
}

export async function updateOwner(id: number, data: Partial<InsertOwner>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(owners).set(data).where(eq(owners.id, id));
}

export async function deleteOwner(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(owners).where(eq(owners.id, id));
}

// ─── CLIENTS (Clientes / Inquilinos) ──────────────────────────────────────

export async function listClients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).orderBy(asc(clients.name));
}

export async function getClient(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return r[0];
}

export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(clients).values(data);
  return { id: r[0].insertId };
}

export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(clients).where(eq(clients.id, id));
}

// ─── PROPERTIES (Imóveis) ─────────────────────────────────────────────────

export async function listProperties(filters?: { status?: string; ownership?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.status) conditions.push(eq(properties.status, filters.status as any));
  if (filters?.ownership) conditions.push(eq(properties.ownership, filters.ownership as any));
  if (conditions.length > 0) {
    return db.select().from(properties).where(and(...conditions)).orderBy(desc(properties.createdAt));
  }
  return db.select().from(properties).orderBy(desc(properties.createdAt));
}

export async function getProperty(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return r[0];
}

export async function getNextPropertyCode(type: "locacao" | "venda") {
  const db = await getDb();
  if (!db) return type === "locacao" ? "LOC-001" : "VND-001";
  const prefix = type === "locacao" ? "LOC" : "VND";
  const result = await db.select({ code: properties.code }).from(properties)
    .where(sql`${properties.code} LIKE ${prefix + '-%'}`)
    .orderBy(desc(properties.code)).limit(1);
  if (result.length === 0) return `${prefix}-001`;
  const lastNum = parseInt(result[0].code?.replace(`${prefix}-`, "") || "0");
  return `${prefix}-${String(lastNum + 1).padStart(3, "0")}`;
}

export async function createProperty(data: InsertProperty) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(properties).values(data);
  return { id: r[0].insertId };
}

export async function updateProperty(id: number, data: Partial<InsertProperty>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(properties).set(data).where(eq(properties.id, id));
}

export async function deleteProperty(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(properties).where(eq(properties.id, id));
}

export async function getPropertyStats() {
  const db = await getDb();
  if (!db) return { total: 0, disponivel_locacao: 0, disponivel_venda: 0, alugado: 0, vendido: 0, arquivado: 0 };
  const result = await db.select({
    status: properties.status,
    count: sql<number>`COUNT(*)`,
  }).from(properties).groupBy(properties.status);
  const stats: Record<string, number> = { total: 0, disponivel_locacao: 0, disponivel_venda: 0, alugado: 0, vendido: 0, arquivado: 0 };
  for (const row of result) {
    stats[row.status] = Number(row.count);
    stats.total += Number(row.count);
  }
  return stats;
}

// ─── RENTAL CONTRACTS (Contratos de Locação) ──────────────────────────────

export async function listRentalContracts(propertyId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (propertyId) return db.select().from(rentalContracts).where(eq(rentalContracts.propertyId, propertyId)).orderBy(desc(rentalContracts.startDate));
  return db.select().from(rentalContracts).orderBy(desc(rentalContracts.startDate));
}

export async function getRentalContract(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(rentalContracts).where(eq(rentalContracts.id, id)).limit(1);
  return r[0];
}

export async function createRentalContract(data: InsertRentalContract) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(rentalContracts).values(data);
  return { id: r[0].insertId };
}

export async function updateRentalContract(id: number, data: Partial<InsertRentalContract>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(rentalContracts).set(data).where(eq(rentalContracts.id, id));
}

export async function deleteRentalContract(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(rentalContracts).where(eq(rentalContracts.id, id));
}

export async function getUpcomingRentAlerts(daysAhead: number = 7) {
  const db = await getDb();
  if (!db) return [];
  // Get active contracts and calculate next billing date
  const activeContracts = await db.select().from(rentalContracts).where(eq(rentalContracts.status, "ativo"));
  const today = new Date();
  const alerts: Array<{ contractId: number; propertyId: number; tenantId: number; billingDay: number; rentAmount: string; daysUntilDue: number; type: string }> = [];

  for (const contract of activeContracts) {
    const billingDay = contract.billingDay || 10;
    // Calculate next billing date
    let nextBilling = new Date(today.getFullYear(), today.getMonth(), billingDay);
    if (nextBilling <= today) nextBilling.setMonth(nextBilling.getMonth() + 1);
    const diffDays = Math.ceil((nextBilling.getTime() - today.getTime()) / 86400000);

    if (diffDays <= daysAhead) {
      alerts.push({
        contractId: contract.id,
        propertyId: contract.propertyId,
        tenantId: contract.tenantId,
        billingDay,
        rentAmount: contract.rentAmount,
        daysUntilDue: diffDays,
        type: "vencimento_aluguel",
      });
    }

    // Check contract anniversary (reajuste)
    if (contract.startDate) {
      const start = new Date(contract.startDate);
      let nextAnniversary = new Date(start);
      while (nextAnniversary <= today) nextAnniversary.setFullYear(nextAnniversary.getFullYear() + 1);
      const diffAnniversary = Math.ceil((nextAnniversary.getTime() - today.getTime()) / 86400000);
      if (diffAnniversary <= daysAhead) {
        alerts.push({
          contractId: contract.id,
          propertyId: contract.propertyId,
          tenantId: contract.tenantId,
          billingDay,
          rentAmount: contract.rentAmount,
          daysUntilDue: diffAnniversary,
          type: "reajuste_contrato",
        });
      }
    }
  }
  return alerts;
}

// Resumo financeiro de imóveis
export async function getPropertyFinancialSummary() {
  const db = await getDb();
  if (!db) return { totalRentIncome: 0, totalCondoIncome: 0, totalAdminFees: 0, activeContracts: 0 };
  const active = await db.select().from(rentalContracts).where(eq(rentalContracts.status, "ativo"));
  const allProps = await db.select().from(properties);

  let totalRentIncome = 0;
  let totalCondoIncome = 0;
  let totalAdminFees = 0;

  for (const c of active) {
    totalRentIncome += parseFloat(c.rentAmount || "0");
    if (c.condoIncluded) {
      const prop = allProps.find(p => p.id === c.propertyId);
      if (prop) totalCondoIncome += parseFloat(prop.condoFee as string || "0");
    }
    // Admin fee for third-party properties
    const prop = allProps.find(p => p.id === c.propertyId);
    if (prop && prop.ownership === "terceiros" && prop.adminFeePercent) {
      totalAdminFees += parseFloat(c.rentAmount || "0") * parseFloat(prop.adminFeePercent as string || "0") / 100;
    }
  }

  return { totalRentIncome, totalCondoIncome, totalAdminFees, activeContracts: active.length };
}

// ─── PROPERTY TODOS ───────────────────────────────────────────────────────

export async function listPropertyTodos(propertyId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (propertyId) return db.select().from(propertyTodos).where(eq(propertyTodos.propertyId, propertyId)).orderBy(asc(propertyTodos.dueDate));
  return db.select().from(propertyTodos).orderBy(asc(propertyTodos.dueDate));
}

export async function createPropertyTodo(data: InsertPropertyTodo) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(propertyTodos).values(data);
  return { id: r[0].insertId };
}

export async function updatePropertyTodo(id: number, data: Partial<InsertPropertyTodo>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(propertyTodos).set(data).where(eq(propertyTodos.id, id));
}

export async function deletePropertyTodo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(propertyTodos).where(eq(propertyTodos.id, id));
}

// ─── PROPERTY CHECKLISTS ──────────────────────────────────────────────────

export async function listPropertyChecklists(propertyId: number, month: number, year: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(propertyChecklists).where(
    and(eq(propertyChecklists.propertyId, propertyId), eq(propertyChecklists.month, month), eq(propertyChecklists.year, year))
  ).orderBy(asc(propertyChecklists.id));
}

export async function createPropertyChecklist(data: InsertPropertyChecklist) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(propertyChecklists).values(data);
  return { id: r[0].insertId };
}

export async function updatePropertyChecklist(id: number, data: Partial<InsertPropertyChecklist>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(propertyChecklists).set(data).where(eq(propertyChecklists.id, id));
}

export async function deletePropertyChecklist(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(propertyChecklists).where(eq(propertyChecklists.id, id));
}

// ─── MÓDULO GESTÃO DE NEGÓCIOS ──────────────────────────────────────────────

import {
  captadores, InsertCaptador,
  negocios, InsertNegocio,
  viabilidade, InsertViabilidade,
  businessTasks, InsertBusinessTask,
} from "../drizzle/schema";

// ─── CAPTADORES ────────────────────────────────────────────────────────────

export async function listCaptadores() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(captadores).orderBy(asc(captadores.name));
}

export async function getCaptador(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(captadores).where(eq(captadores.id, id)).limit(1);
  return r[0];
}

export async function createCaptador(data: InsertCaptador) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(captadores).values(data);
  return { id: r[0].insertId };
}

export async function updateCaptador(id: number, data: Partial<InsertCaptador>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(captadores).set(data).where(eq(captadores.id, id));
}

export async function deleteCaptador(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(captadores).where(eq(captadores.id, id));
}

export async function getCaptadorDashboard(captadorId: number) {
  const db = await getDb();
  if (!db) return { captador: undefined, deals: [], totalVGV: 0 };
  const cap = await db.select().from(captadores).where(eq(captadores.id, captadorId)).limit(1);
  const deals = await db.select().from(negocios).where(eq(negocios.captadorId, captadorId)).orderBy(desc(negocios.createdAt));
  let totalVGV = 0;
  for (const d of deals) {
    totalVGV += parseFloat(d.estimatedVGV as string || "0");
  }
  return { captador: cap[0], deals, totalVGV };
}

// ─── NEGÓCIOS ──────────────────────────────────────────────────────────────

export async function listNegocios(filters?: { isArchived?: boolean; phase?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.isArchived !== undefined) conditions.push(eq(negocios.isArchived, filters.isArchived));
  if (filters?.phase) conditions.push(eq(negocios.phase, filters.phase as any));
  if (conditions.length > 0) return db.select().from(negocios).where(and(...conditions)).orderBy(desc(negocios.createdAt));
  return db.select().from(negocios).orderBy(desc(negocios.createdAt));
}

export async function getNegocio(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(negocios).where(eq(negocios.id, id)).limit(1);
  return r[0];
}

export async function createNegocio(data: InsertNegocio) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(negocios).values(data);
  const negocioId = r[0].insertId;

  // Auto-create task from nextAction if provided
  if (data.nextAction && data.nextActionDate) {
    await db.insert(businessTasks).values({
      negocioId,
      title: data.nextAction as string,
      dueDate: data.nextActionDate,
      priority: (data.nextActionPriority as any) || "normal",
    });
  }

  return { id: negocioId };
}

export async function updateNegocio(id: number, data: Partial<InsertNegocio>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(negocios).set(data).where(eq(negocios.id, id));

  // Auto-create task if nextAction changed
  if (data.nextAction && data.nextActionDate) {
    await db.insert(businessTasks).values({
      negocioId: id,
      title: data.nextAction as string,
      dueDate: data.nextActionDate,
      priority: (data.nextActionPriority as any) || "normal",
    });
  }
}

export async function deleteNegocio(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  // Delete related viabilidade and tasks
  await db.delete(viabilidade).where(eq(viabilidade.negocioId, id));
  await db.delete(businessTasks).where(eq(businessTasks.negocioId, id));
  await db.delete(negocios).where(eq(negocios.id, id));
}

export async function archiveNegocio(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(negocios).set({ isArchived: true }).where(eq(negocios.id, id));
}

export async function unarchiveNegocio(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(negocios).set({ isArchived: false }).where(eq(negocios.id, id));
}

// ─── VIABILIDADE (EVE) ────────────────────────────────────────────────────

export async function getViabilidade(negocioId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const r = await db.select().from(viabilidade).where(eq(viabilidade.negocioId, negocioId)).limit(1);
  return r[0];
}

export async function upsertViabilidade(negocioId: number, data: Partial<InsertViabilidade>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");

  // Calculate outputs
  const landCost = parseFloat(data.landCost as string || "0");
  const constructionCost = parseFloat(data.constructionCost as string || "0");
  const indirectCosts = parseFloat(data.indirectCosts as string || "0");
  const taxes = parseFloat(data.taxes as string || "0");
  const commissions = parseFloat(data.commissions as string || "0");
  const totalCost = landCost + constructionCost + indirectCosts + taxes + commissions;

  // Get VGV from the deal
  const deal = await db.select().from(negocios).where(eq(negocios.id, negocioId)).limit(1);
  const vgv = deal.length > 0 ? parseFloat(deal[0].estimatedVGV as string || "0") : 0;

  const netProfit = vgv - totalCost;
  const profitMargin = vgv > 0 ? (netProfit / vgv) * 100 : 0;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  // Simplified TIR (assume 1 year project)
  const tir = totalCost > 0 ? ((vgv / totalCost) - 1) * 100 : 0;

  // Determine viability status (traffic light)
  let viabilityStatus: "verde" | "amarelo" | "vermelho" = "amarelo";
  if (profitMargin >= 20 && roi >= 30) viabilityStatus = "verde";
  else if (profitMargin < 10 || roi < 10) viabilityStatus = "vermelho";

  const values = {
    negocioId,
    landCost: data.landCost,
    constructionCost: data.constructionCost,
    indirectCosts: data.indirectCosts,
    taxes: data.taxes,
    commissions: data.commissions,
    totalCost: totalCost.toFixed(2),
    netProfit: netProfit.toFixed(2),
    profitMargin: profitMargin.toFixed(2),
    tir: tir.toFixed(2),
    roi: roi.toFixed(2),
    viabilityStatus,
    notes: data.notes,
  };

  const existing = await db.select().from(viabilidade).where(eq(viabilidade.negocioId, negocioId)).limit(1);
  if (existing.length > 0) {
    await db.update(viabilidade).set(values).where(eq(viabilidade.negocioId, negocioId));
    return { id: existing[0].id, ...values };
  } else {
    const r = await db.insert(viabilidade).values(values as any);
    return { id: r[0].insertId, ...values };
  }
}

// ─── BUSINESS TASKS ────────────────────────────────────────────────────────

export async function listBusinessTasks(filters?: { isCompleted?: boolean; isUrgent?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters?.isCompleted !== undefined) conditions.push(eq(businessTasks.isCompleted, filters.isCompleted));
  if (filters?.isUrgent) conditions.push(eq(businessTasks.priority, "urgente"));
  if (conditions.length > 0) return db.select().from(businessTasks).where(and(...conditions)).orderBy(asc(businessTasks.dueDate));
  return db.select().from(businessTasks).orderBy(asc(businessTasks.dueDate));
}

export async function createBusinessTask(data: InsertBusinessTask) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const r = await db.insert(businessTasks).values(data);
  return { id: r[0].insertId };
}

export async function updateBusinessTask(id: number, data: Partial<InsertBusinessTask>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const updateData: any = { ...data };
  if (data.isCompleted) updateData.completedAt = new Date();
  await db.update(businessTasks).set(updateData).where(eq(businessTasks.id, id));
}

export async function deleteBusinessTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(businessTasks).where(eq(businessTasks.id, id));
}
