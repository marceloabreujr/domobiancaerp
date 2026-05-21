import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import bcrypt from "bcryptjs";
import {
  listUsers, updateUserRole, getUserByUsername, createLocalUser, updateUserPassword, updateUserActive, updateUserProfile,
  listEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee,
  listTimeOff, createTimeOff, updateTimeOff, deleteTimeOff,
  listDocuments, createDocument, updateDocument, deleteDocument, getExpiringDocuments,
  listCalendarEvents, createCalendarEvent, updateCalendarEvent, deleteCalendarEvent,
  listSupplies, createSupply, updateSupply, deleteSupply,
  listFleet, createFleetVehicle, updateFleetVehicle, deleteFleetVehicle,
  listPettyCash, createPettyCashEntry, deletePettyCashEntry, getPettyCashBalance,
  listTickets, createTicket, updateTicket, deleteTicket,
  listOwners, getOwner, createOwner, updateOwner, deleteOwner,
  listClients, getClient, createClient, updateClient, deleteClient,
  listProperties, getProperty, createProperty, updateProperty, deleteProperty, getPropertyStats, getNextPropertyCode,
  listRentalContracts, getRentalContract, createRentalContract, updateRentalContract, deleteRentalContract, getUpcomingRentAlerts, getPropertyFinancialSummary,
  listPropertyTodos, createPropertyTodo, updatePropertyTodo, deletePropertyTodo,
  listPropertyChecklists, createPropertyChecklist, updatePropertyChecklist, deletePropertyChecklist,
  listCaptadores, getCaptador, createCaptador, updateCaptador, deleteCaptador, getCaptadorDashboard,
  listNegocios, getNegocio, createNegocio, updateNegocio, deleteNegocio, archiveNegocio, unarchiveNegocio,
  getViabilidade, upsertViabilidade,
  listBusinessTasks, createBusinessTask, updateBusinessTask, deleteBusinessTask,
  // Gestão de Obras
  listContractors, getContractorById, createContractor, updateContractor, deleteContractor,
  listArchitects, getArchitectById, createArchitect, updateArchitect, deleteArchitect,
  listConstructions, getConstructionById, createConstruction, updateConstruction, deleteConstruction, getConstructionStats,
  listReportsByConstruction, listAllReports, createReport, deleteReport,
  listImagesByConstruction, listAllImages, createImage, deleteImage,
  listConstructionTasks, createConstructionTask, updateConstructionTask, deleteConstructionTask,
  // Suprimentos e Checklist
  getSupplyCategories, getSupplyItemsByCategory, searchSupplyCategories, searchSupplyItems,
  getConstructionSupplyItems, createConstructionSupplyItem, updateConstructionSupplyItem, deleteConstructionSupplyItem,
  getLastClosedValue,
  getSupplyFiles, createSupplyFile, deleteSupplyFile,
  getConstructionChecklist, initializeChecklist, toggleChecklistItem, updateChecklistNotes,
  // Financeiro
  listFinancialEntries, getFinancialEntry, createFinancialEntry, updateFinancialEntry, deleteFinancialEntry,
  getFinancialSummary, getOverdueEntries, markEntryAsPaid, getEntriesByProperty, getFinancialByProperty,
  listRecurringBills, getRecurringBill, createRecurringBill, updateRecurringBill, deleteRecurringBill,
  generateIPTUEntries, generateRecurringEntries, generateRentInstallments,
  listBankImports, createBankImport, updateBankImport,
  listBankTransactions, createBankTransaction, createBankTransactionsBatch, updateBankTransaction,
  conciliateTransaction, findConciliationCandidates,
  // Calendário Central
  getAllTasks,
  listUsersSimple,
  // Processos — Créditos Judiciais
  listCreditosJudiciais, createCreditoJudicial, updateCreditoJudicial, deleteCreditoJudicial,
} from "./db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,

  // ─── CALENDÁRIO CENTRAL ─────────────────────────────────────────────────
  centralCalendar: router({
    tasks: protectedProcedure
      .input(z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        assignedTo: z.number().optional(),
        source: z.string().optional(),
      }).optional())
      .query(async ({ input, ctx }) => {
        // Non-admin users can only see their own tasks
        const effectiveFilters = { ...input };
        if (ctx.user.role !== 'admin') {
          effectiveFilters.assignedTo = ctx.user.id;
        }
        return getAllTasks(effectiveFilters);
      }),
    // Lista simplificada de usuários (sem dados sensíveis) - acessível a qualquer autenticado
    usersList: protectedProcedure.query(async () => listUsersSimple()),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    login: publicProcedure
      .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const user = await getUserByUsername(input.username);
        if (!user || !user.passwordHash) {
          throw new Error("Usuário ou senha inválidos");
        }
        if (!user.isActive) {
          throw new Error("Usuário desativado. Contacte o administrador.");
        }
        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) {
          throw new Error("Usuário ou senha inválidos");
        }
        // Create JWT session
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true, user: { id: user.id, name: user.name, role: user.role } };
      }),
    changePassword: publicProcedure
      .input(z.object({ username: z.string().min(1), currentPassword: z.string().min(1), newPassword: z.string().min(6) }))
      .mutation(async ({ input }) => {
        const user = await getUserByUsername(input.username);
        if (!user || !user.passwordHash) throw new Error("Usuário não encontrado");
        const valid = await bcrypt.compare(input.currentPassword, user.passwordHash);
        if (!valid) throw new Error("Senha atual incorreta");
        const hash = await bcrypt.hash(input.newPassword, 10);
        await updateUserPassword(user.id, hash, input.newPassword);
        return { success: true } as const;
      }),
  }),

  users: router({
    list: adminProcedure.query(async () => listUsers()),
    updateRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["admin", "gerente", "operador"]) }))
      .mutation(async ({ input }) => { await updateUserRole(input.userId, input.role); return { success: true } as const; }),
    create: adminProcedure
      .input(z.object({
        username: z.string().min(3).max(64),
        password: z.string().min(6),
        name: z.string().min(1),
        email: z.string().optional(),
        role: z.enum(["admin", "gerente", "operador"]),
      }))
      .mutation(async ({ input }) => {
        const existing = await getUserByUsername(input.username);
        if (existing) throw new Error("Nome de usuário já existe");
        const hash = await bcrypt.hash(input.password, 10);
        const user = await createLocalUser({
          username: input.username,
          passwordHash: hash,
          plainPassword: input.password,
          name: input.name,
          email: input.email,
          role: input.role,
        });
        return { success: true, user };
      }),
    resetPassword: adminProcedure
      .input(z.object({ userId: z.number(), newPassword: z.string().min(6) }))
      .mutation(async ({ input }) => {
        const hash = await bcrypt.hash(input.newPassword, 10);
        await updateUserPassword(input.userId, hash, input.newPassword);
        return { success: true } as const;
      }),
    toggleActive: adminProcedure
      .input(z.object({ userId: z.number(), isActive: z.boolean() }))
      .mutation(async ({ input }) => {
        await updateUserActive(input.userId, input.isActive);
        return { success: true } as const;
      }),
    updateProfile: protectedProcedure
      .input(z.object({ name: z.string().optional(), email: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        await updateUserProfile(ctx.user.id, input);
        return { success: true } as const;
      }),
  }),

  // ─── MÓDULO ADMINISTRATIVO ──────────────────────────────────────────────

  employees: router({
    list: protectedProcedure.query(async () => listEmployees()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getEmployee(input.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        cpf: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        position: z.string().optional(),
        department: z.string().optional(),
        salary: z.string().optional(),
        hireDate: z.string().optional(),
        status: z.enum(["ativo", "ferias", "afastado", "desligado"]).optional(),
        projectAllocation: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { hireDate, ...rest } = input;
        return createEmployee({
          ...rest,
          hireDate: hireDate ? new Date(hireDate) : undefined,
        } as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        cpf: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        position: z.string().optional(),
        department: z.string().optional(),
        salary: z.string().optional(),
        hireDate: z.string().optional(),
        status: z.enum(["ativo", "ferias", "afastado", "desligado"]).optional(),
        projectAllocation: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, hireDate, ...rest } = input;
        await updateEmployee(id, {
          ...rest,
          ...(hireDate !== undefined ? { hireDate: new Date(hireDate) } : {}),
        } as any);
        return { success: true } as const;
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deleteEmployee(input.id); return { success: true } as const; }),
  }),

  timeOff: router({
    list: protectedProcedure.input(z.object({ employeeId: z.number().optional() }).optional()).query(async ({ input }) => listTimeOff(input?.employeeId)),
    create: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        type: z.enum(["ferias", "falta_justificada", "falta_injustificada", "licenca", "outro"]),
        startDate: z.string(),
        endDate: z.string(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createTimeOff({
          ...input,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
        } as any);
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), approved: z.boolean().optional(), reason: z.string().optional() }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateTimeOff(id, data); return { success: true } as const; }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deleteTimeOff(input.id); return { success: true } as const; }),
  }),

  documents: router({
    list: protectedProcedure.input(z.object({ category: z.string().optional() }).optional()).query(async ({ input }) => listDocuments(input?.category)),
    expiring: protectedProcedure.input(z.object({ days: z.number().optional() }).optional()).query(async ({ input }) => getExpiringDocuments(input?.days)),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        category: z.enum(["contrato", "alvara", "certidao", "planta", "foto", "fatura", "recibo", "outro"]),
        description: z.string().optional(),
        expiryDate: z.string().optional(),
        relatedEntity: z.string().optional(),
        relatedEntityId: z.number().optional(),
        fileBase64: z.string().optional(),
        fileName: z.string().optional(),
        mimeType: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        let fileUrl: string | undefined;
        let fileKey: string | undefined;
        if (input.fileBase64 && input.fileName) {
          const buffer = Buffer.from(input.fileBase64, "base64");
          const key = `documents/${nanoid()}-${input.fileName}`;
          const result = await storagePut(key, buffer, input.mimeType || "application/octet-stream");
          fileUrl = result.url;
          fileKey = result.key;
        }
        return createDocument({
          title: input.title,
          category: input.category,
          description: input.description,
          expiryDate: input.expiryDate ? new Date(input.expiryDate) : undefined,
          relatedEntity: input.relatedEntity,
          relatedEntityId: input.relatedEntityId,
          fileUrl,
          fileKey,
          fileName: input.fileName,
          mimeType: input.mimeType,
          uploadedBy: ctx.user.id,
        } as any);
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), expiryDate: z.string().optional(), category: z.enum(["contrato", "alvara", "certidao", "planta", "foto", "fatura", "recibo", "outro"]).optional() }))
      .mutation(async ({ input }) => {
        const { id, expiryDate, ...rest } = input;
        await updateDocument(id, {
          ...rest,
          ...(expiryDate !== undefined ? { expiryDate: new Date(expiryDate) } : {}),
        } as any);
        return { success: true } as const;
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deleteDocument(input.id); return { success: true } as const; }),
  }),

  calendar: router({
    list: protectedProcedure.query(async () => listCalendarEvents()),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        eventDate: z.string(),
        eventType: z.enum(["vencimento_contrato", "renovacao_licenca", "manutencao", "marco_projeto", "reuniao", "outro"]),
        relatedEntity: z.string().optional(),
        relatedEntityId: z.number().optional(),
        alertDaysBefore: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return createCalendarEvent({
          ...input,
          eventDate: new Date(input.eventDate),
        } as any);
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), eventDate: z.string().optional(), isCompleted: z.boolean().optional() }))
      .mutation(async ({ input }) => {
        const { id, eventDate, ...rest } = input;
        await updateCalendarEvent(id, {
          ...rest,
          ...(eventDate !== undefined ? { eventDate: new Date(eventDate) } : {}),
        } as any);
        return { success: true } as const;
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deleteCalendarEvent(input.id); return { success: true } as const; }),
  }),

  supplies: router({
    list: protectedProcedure.query(async () => listSupplies()),
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1), category: z.enum(["escritorio", "copa", "limpeza", "outro"]).optional(), currentStock: z.number().optional(), minStock: z.number().optional(), unit: z.string().optional() }))
      .mutation(async ({ input }) => createSupply(input)),
    update: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().optional(), category: z.enum(["escritorio", "copa", "limpeza", "outro"]).optional(), currentStock: z.number().optional(), minStock: z.number().optional(), unit: z.string().optional(), lastRestocked: z.string().optional() }))
      .mutation(async ({ input }) => {
        const { id, lastRestocked, ...rest } = input;
        await updateSupply(id, {
          ...rest,
          ...(lastRestocked !== undefined ? { lastRestocked: new Date(lastRestocked) } : {}),
        } as any);
        return { success: true } as const;
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deleteSupply(input.id); return { success: true } as const; }),
  }),

  fleet: router({
    list: protectedProcedure.query(async () => listFleet()),
    create: protectedProcedure
      .input(z.object({ plate: z.string().min(1), model: z.string().min(1), year: z.number().optional(), status: z.enum(["disponivel", "em_uso", "manutencao", "inativo"]).optional(), assignedTo: z.string().optional(), nextMaintenanceDate: z.string().optional(), km: z.number().optional(), notes: z.string().optional() }))
      .mutation(async ({ input }) => {
        const { nextMaintenanceDate, ...rest } = input;
        return createFleetVehicle({
          ...rest,
          ...(nextMaintenanceDate ? { nextMaintenanceDate: new Date(nextMaintenanceDate) } : {}),
        } as any);
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), plate: z.string().optional(), model: z.string().optional(), year: z.number().optional(), status: z.enum(["disponivel", "em_uso", "manutencao", "inativo"]).optional(), assignedTo: z.string().optional(), nextMaintenanceDate: z.string().optional(), km: z.number().optional(), notes: z.string().optional() }))
      .mutation(async ({ input }) => {
        const { id, nextMaintenanceDate, ...rest } = input;
        await updateFleetVehicle(id, {
          ...rest,
          ...(nextMaintenanceDate !== undefined ? { nextMaintenanceDate: new Date(nextMaintenanceDate) } : {}),
        } as any);
        return { success: true } as const;
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deleteFleetVehicle(input.id); return { success: true } as const; }),
  }),

  pettyCash: router({
    list: protectedProcedure.query(async () => listPettyCash()),
    balance: protectedProcedure.query(async () => getPettyCashBalance()),
    create: protectedProcedure
      .input(z.object({
        description: z.string().min(1),
        amount: z.string(),
        type: z.enum(["entrada", "saida"]),
        category: z.string().optional(),
        date: z.string(),
        receiptBase64: z.string().optional(),
        receiptName: z.string().optional(),
        receiptMime: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        let receiptUrl: string | undefined;
        let receiptKey: string | undefined;
        if (input.receiptBase64 && input.receiptName) {
          const buffer = Buffer.from(input.receiptBase64, "base64");
          const key = `receipts/${nanoid()}-${input.receiptName}`;
          const result = await storagePut(key, buffer, input.receiptMime || "application/octet-stream");
          receiptUrl = result.url;
          receiptKey = result.key;
        }
        return createPettyCashEntry({
          description: input.description,
          amount: input.amount,
          type: input.type,
          category: input.category,
          date: new Date(input.date),
          receiptUrl,
          receiptKey,
          registeredBy: ctx.user.id,
        } as any);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deletePettyCashEntry(input.id); return { success: true } as const; }),
  }),

  tickets: router({
    list: protectedProcedure.input(z.object({ status: z.string().optional() }).optional()).query(async ({ input }) => listTickets(input?.status)),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.enum(["ti", "manutencao", "limpeza", "seguranca", "outro"]).optional(),
        priority: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => createTicket({ ...input, requestedBy: ctx.user.id })),
    update: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(["aberto", "em_andamento", "resolvido", "fechado"]).optional(), assignedTo: z.string().optional(), priority: z.enum(["baixa", "media", "alta", "urgente"]).optional() }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = { ...data };
        if (data.status === "resolvido") updateData.resolvedAt = new Date();
        await updateTicket(id, updateData);
        return { success: true } as const;
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deleteTicket(input.id); return { success: true } as const; }),
  }),

  // ─── MÓDULO GESTÃO DE IMÓVEIS ──────────────────────────────────────────

  owners: router({
    list: protectedProcedure.query(async () => listOwners()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getOwner(input.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        cpfCnpj: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        phone2: z.string().optional(),
        address: z.string().optional(),
        bankName: z.string().optional(),
        bankAgency: z.string().optional(),
        bankAccount: z.string().optional(),
        pixKey: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => createOwner(input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        cpfCnpj: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        phone2: z.string().optional(),
        address: z.string().optional(),
        bankName: z.string().optional(),
        bankAgency: z.string().optional(),
        bankAccount: z.string().optional(),
        pixKey: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateOwner(id, data); return { success: true } as const; }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deleteOwner(input.id); return { success: true } as const; }),
  }),

  clients: router({
    list: protectedProcedure.query(async () => listClients()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getClient(input.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        cpfCnpj: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        phone2: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => createClient(input)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        cpfCnpj: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        phone2: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateClient(id, data); return { success: true } as const; }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deleteClient(input.id); return { success: true } as const; }),
  }),

  properties: router({
    list: protectedProcedure
      .input(z.object({ status: z.string().optional(), ownership: z.string().optional() }).optional())
      .query(async ({ input }) => listProperties(input ?? undefined)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getProperty(input.id)),
    stats: protectedProcedure.query(async () => getPropertyStats()),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        code: z.string().optional(),
        ownership: z.enum(["domobianca", "terceiros"]).optional(),
        propertyType: z.enum(["residencial", "apartamento", "galpao", "sala_comercial", "lote", "casa", "cobertura", "kitnet", "outro"]).optional(),
        status: z.enum(["disponivel_locacao", "disponivel_venda", "alugado", "vendido", "arquivado"]).optional(),
        ownerId: z.number().optional(),
        street: z.string().optional(),
        number: z.string().optional(),
        complement: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        area: z.string().optional(),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        parkingSpots: z.number().optional(),
        suites: z.number().optional(),
        rentValue: z.string().optional(),
        saleValue: z.string().optional(),
        condoFee: z.string().optional(),
        iptuValue: z.string().optional(),
        adminFeePercent: z.string().optional(),
        saleCommissionPercent: z.string().optional(),
        description: z.string().optional(),
        features: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Auto-generate code if not provided
        if (!input.code) {
          const type = input.status === "disponivel_venda" ? "venda" : "locacao";
          input.code = await getNextPropertyCode(type);
        }
        return createProperty(input as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        code: z.string().optional(),
        ownership: z.enum(["domobianca", "terceiros"]).optional(),
        propertyType: z.enum(["residencial", "apartamento", "galpao", "sala_comercial", "lote", "casa", "cobertura", "kitnet", "outro"]).optional(),
        status: z.enum(["disponivel_locacao", "disponivel_venda", "alugado", "vendido", "arquivado"]).optional(),
        ownerId: z.number().optional(),
        street: z.string().optional(),
        number: z.string().optional(),
        complement: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        area: z.string().optional(),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        parkingSpots: z.number().optional(),
        suites: z.number().optional(),
        rentValue: z.string().optional(),
        saleValue: z.string().optional(),
        condoFee: z.string().optional(),
        iptuValue: z.string().optional(),
        adminFeePercent: z.string().optional(),
        saleCommissionPercent: z.string().optional(),
        description: z.string().optional(),
        features: z.string().optional(),
      }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateProperty(id, data as any); return { success: true } as const; }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deleteProperty(input.id); return { success: true } as const; }),
  }),

  rentalContracts: router({
    list: protectedProcedure
      .input(z.object({ propertyId: z.number().optional() }).optional())
      .query(async ({ input }) => listRentalContracts(input?.propertyId)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getRentalContract(input.id)),
    alerts: protectedProcedure.input(z.object({ days: z.number().optional() }).optional()).query(async ({ input }) => getUpcomingRentAlerts(input?.days ?? 7)),
    financialSummary: protectedProcedure.query(async () => getPropertyFinancialSummary()),
    create: protectedProcedure
      .input(z.object({
        propertyId: z.number(),
        tenantId: z.number(),
        occupantName: z.string().optional(),
        occupantCpf: z.string().optional(),
        startDate: z.string(),
        endDate: z.string().optional(),
        leaseTerm: z.enum(["quinzenal", "mensal", "trimestral", "semestral", "anual", "2_anos", "3_anos"]).optional(),
        rentAmount: z.string(),
        condoIncluded: z.boolean().optional(),
        iptuIncluded: z.boolean().optional(),
        isPackage: z.boolean().optional(),
        packageTotal: z.string().optional(),
        adjustmentIndex: z.enum(["igpm", "ipca", "inpc", "nenhum"]).optional(),
        adjustmentValue: z.string().optional(),
        nextAdjustmentDate: z.string().optional(),
        billingDay: z.number().optional(),
        lateFeePercent: z.string().optional(),
        dailyInterestPercent: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createRentalContract({
          ...input,
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          nextAdjustmentDate: input.nextAdjustmentDate ? new Date(input.nextAdjustmentDate) : undefined,
        } as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        occupantName: z.string().optional(),
        occupantCpf: z.string().optional(),
        endDate: z.string().optional(),
        rentAmount: z.string().optional(),
        condoIncluded: z.boolean().optional(),
        iptuIncluded: z.boolean().optional(),
        isPackage: z.boolean().optional(),
        packageTotal: z.string().optional(),
        adjustmentIndex: z.enum(["igpm", "ipca", "inpc", "nenhum"]).optional(),
        billingDay: z.number().optional(),
        lateFeePercent: z.string().optional(),
        dailyInterestPercent: z.string().optional(),
        status: z.enum(["ativo", "encerrado", "pendente", "rescindido"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, endDate, ...rest } = input;
        await updateRentalContract(id, {
          ...rest,
          ...(endDate !== undefined ? { endDate: new Date(endDate) } : {}),
        } as any);
        return { success: true } as const;
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deleteRentalContract(input.id); return { success: true } as const; }),
    uploadContract: protectedProcedure
      .input(z.object({
        id: z.number(),
        fileData: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.fileData, "base64");
        const suffix = Math.random().toString(36).substring(2, 8);
        const fileKey = `contracts/${input.id}-${suffix}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        await updateRentalContract(input.id, {
          contractFileUrl: url,
          contractFileKey: fileKey,
          contractFileName: input.fileName,
        } as any);
        return { success: true, url, fileName: input.fileName } as const;
      }),
    removeContractFile: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await updateRentalContract(input.id, {
          contractFileUrl: null,
          contractFileKey: null,
          contractFileName: null,
        } as any);
        return { success: true } as const;
      }),
  }),

  propertyTodos: router({
    list: protectedProcedure
      .input(z.object({ propertyId: z.number().optional() }).optional())
      .query(async ({ input }) => listPropertyTodos(input?.propertyId)),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        propertyId: z.number().optional(),
        dueDate: z.string().optional(),
        priority: z.enum(["baixa", "media", "alta"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createPropertyTodo({
          ...input,
          dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
          createdBy: ctx.user.id,
        } as any);
      }),
    update: protectedProcedure
      .input(z.object({ id: z.number(), title: z.string().optional(), description: z.string().optional(), dueDate: z.string().optional(), priority: z.enum(["baixa", "media", "alta"]).optional(), isCompleted: z.boolean().optional() }))
      .mutation(async ({ input }) => {
        const { id, dueDate, ...rest } = input;
        await updatePropertyTodo(id, {
          ...rest,
          ...(dueDate !== undefined ? { dueDate: new Date(dueDate) } : {}),
        } as any);
        return { success: true } as const;
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deletePropertyTodo(input.id); return { success: true } as const; }),
  }),

  propertyChecklists: router({
    list: protectedProcedure
      .input(z.object({ propertyId: z.number(), month: z.number(), year: z.number() }))
      .query(async ({ input }) => listPropertyChecklists(input.propertyId, input.month, input.year)),
    create: protectedProcedure
      .input(z.object({
        propertyId: z.number(),
        month: z.number(),
        year: z.number(),
        item: z.string().min(1),
      }))
      .mutation(async ({ input }) => createPropertyChecklist(input)),
    update: protectedProcedure
      .input(z.object({ id: z.number(), isChecked: z.boolean().optional(), notes: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await updatePropertyChecklist(id, {
          ...data,
          ...(data.isChecked ? { checkedBy: ctx.user.id, checkedAt: new Date() } : {}),
        } as any);
        return { success: true } as const;
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deletePropertyChecklist(input.id); return { success: true } as const; }),
  }),

  // ─── IA INTEGRADA ─────────────────────────────────────────────────────────

  ai: router({
    summarizeContract: protectedProcedure
      .input(z.object({ text: z.string().min(10) }))
      .mutation(async ({ input }) => {
        const result = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um assistente jurídico especializado. Resuma o contrato abaixo de forma clara e objetiva, destacando: partes envolvidas, objeto, valor, prazo, cláusulas importantes e penalidades. Responda em português." },
            { role: "user", content: input.text },
          ],
        });
        return { summary: result.choices[0]?.message?.content ?? "Não foi possível gerar o resumo." };
      }),

    draftMemo: protectedProcedure
      .input(z.object({ subject: z.string().min(3), tone: z.enum(["formal", "informal"]).optional(), details: z.string().optional() }))
      .mutation(async ({ input }) => {
        const result = await invokeLLM({
          messages: [
            { role: "system", content: `Você é um assistente administrativo. Gere um rascunho de comunicado interno ${input.tone === "informal" ? "com tom informal e amigável" : "com tom formal e profissional"}. Responda em português.` },
            { role: "user", content: `Assunto: ${input.subject}${input.details ? `\nDetalhes: ${input.details}` : ""}` },
          ],
        });
        return { draft: result.choices[0]?.message?.content ?? "Não foi possível gerar o rascunho." };
      }),

    ocrInvoice: protectedProcedure
      .input(z.object({ imageBase64: z.string(), mimeType: z.string().optional() }))
      .mutation(async ({ input }) => {
        const mime = input.mimeType || "image/jpeg";
        const dataUrl = `data:${mime};base64,${input.imageBase64}`;
        const result = await invokeLLM({
          messages: [
            { role: "system", content: "Você é um assistente de OCR financeiro. Analise a imagem da fatura/recibo e extraia: fornecedor, CNPJ, data, itens, valores e total. Retorne em JSON com os campos: fornecedor, cnpj, data, itens (array de {descricao, quantidade, valorUnitario, valorTotal}), total. Responda apenas o JSON." },
            { role: "user", content: [{ type: "image_url" as const, image_url: { url: dataUrl, detail: "high" as const } }] },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "invoice_ocr",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  fornecedor: { type: "string" },
                  cnpj: { type: "string" },
                  data: { type: "string" },
                  itens: { type: "array", items: { type: "object", properties: { descricao: { type: "string" }, quantidade: { type: "string" }, valorUnitario: { type: "string" }, valorTotal: { type: "string" } }, required: ["descricao", "quantidade", "valorUnitario", "valorTotal"], additionalProperties: false } },
                  total: { type: "string" },
                },
                required: ["fornecedor", "cnpj", "data", "itens", "total"],
                additionalProperties: false,
              },
            },
          },
        });
        const content = result.choices[0]?.message?.content;
        try {
          return { data: JSON.parse(typeof content === "string" ? content : "{}") };
        } catch {
          return { data: null, raw: typeof content === "string" ? content : "" };
        }
      }),

    assistant: protectedProcedure
      .input(z.object({ question: z.string().min(3) }))
      .mutation(async ({ input }) => {
        const result = await invokeLLM({
          messages: [
            { role: "system", content: "Você é o assistente virtual do ERP Domobianca, especializado em gestão imobiliária, obras e administração empresarial. Responda de forma clara, objetiva e prática. Sempre em português." },
            { role: "user", content: input.question },
          ],
        });
        return { answer: result.choices[0]?.message?.content ?? "Desculpe, não consegui processar sua pergunta." };
      }),
  }),

  // ─── MÓDULO GESTÃO DE NEGÓCIOS ──────────────────────────────────────────

  captadores: router({
    list: protectedProcedure.query(async () => listCaptadores()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getCaptador(input.id)),
    dashboard: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getCaptadorDashboard(input.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        partnerType: z.enum(["corretor", "advogado", "investidor", "permutario", "outros"]).optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        cpfCnpj: z.string().optional(),
        defaultCommission: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => createCaptador(input as any)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        partnerType: z.enum(["corretor", "advogado", "investidor", "permutario", "outros"]).optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        cpfCnpj: z.string().optional(),
        defaultCommission: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => { const { id, ...data } = input; await updateCaptador(id, data as any); }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => deleteCaptador(input.id)),
  }),

  negocios: router({
    list: protectedProcedure
      .input(z.object({ isArchived: z.boolean().optional(), phase: z.string().optional() }).optional())
      .query(async ({ input }) => listNegocios(input ?? undefined)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getNegocio(input.id)),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        ownership: z.enum(["proprio", "terceiros"]).optional(),
        captadorId: z.number().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        phase: z.enum(["prospeccao", "analise", "negociacao", "due_diligence", "aprovado", "fechado", "cancelado"]).optional(),
        operationType: z.enum(["compra", "venda", "permuta", "incorporacao", "loteamento", "reforma", "outro"]).optional(),
        priority: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
        totalArea: z.string().optional(),
        usableArea: z.string().optional(),
        zoning: z.string().optional(),
        constructivePotential: z.string().optional(),
        opportunityCost: z.string().optional(),
        marketValue: z.string().optional(),
        maxInvestment: z.string().optional(),
        estimatedVGV: z.string().optional(),
        tirPercent: z.string().optional(),
        profitMarginPercent: z.string().optional(),
        documentationStatus: z.string().optional(),
        nextAction: z.string().optional(),
        nextActionPriority: z.enum(["normal", "urgente"]).optional(),
        nextActionDate: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return createNegocio({
          ...input,
          nextActionDate: input.nextActionDate ? new Date(input.nextActionDate) : undefined,
        } as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        ownership: z.enum(["proprio", "terceiros"]).optional(),
        captadorId: z.number().nullable().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        phase: z.enum(["prospeccao", "analise", "negociacao", "due_diligence", "aprovado", "fechado", "cancelado"]).optional(),
        operationType: z.enum(["compra", "venda", "permuta", "incorporacao", "loteamento", "reforma", "outro"]).optional(),
        priority: z.enum(["baixa", "media", "alta", "urgente"]).optional(),
        totalArea: z.string().optional(),
        usableArea: z.string().optional(),
        zoning: z.string().optional(),
        constructivePotential: z.string().optional(),
        opportunityCost: z.string().optional(),
        marketValue: z.string().optional(),
        maxInvestment: z.string().optional(),
        estimatedVGV: z.string().optional(),
        tirPercent: z.string().optional(),
        profitMarginPercent: z.string().optional(),
        documentationStatus: z.string().optional(),
        nextAction: z.string().optional(),
        nextActionPriority: z.enum(["normal", "urgente"]).optional(),
        nextActionDate: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, nextActionDate, ...rest } = input;
        await updateNegocio(id, {
          ...rest,
          ...(nextActionDate !== undefined ? { nextActionDate: new Date(nextActionDate) } : {}),
        } as any);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => deleteNegocio(input.id)),
    archive: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => archiveNegocio(input.id)),
    unarchive: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => unarchiveNegocio(input.id)),
  }),

  viabilidade: router({
    get: protectedProcedure.input(z.object({ negocioId: z.number() })).query(async ({ input }) => getViabilidade(input.negocioId)),
    upsert: protectedProcedure
      .input(z.object({
        negocioId: z.number(),
        landCost: z.string().optional(),
        constructionCost: z.string().optional(),
        indirectCosts: z.string().optional(),
        taxes: z.string().optional(),
        commissions: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => upsertViabilidade(input.negocioId, input as any)),
  }),

  businessTasks: router({
    list: protectedProcedure
      .input(z.object({ isCompleted: z.boolean().optional(), isUrgent: z.boolean().optional() }).optional())
      .query(async ({ input }) => listBusinessTasks(input ?? undefined)),
    create: protectedProcedure
      .input(z.object({
        negocioId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.string(),
        priority: z.enum(["normal", "urgente"]).optional(),
      }))
      .mutation(async ({ input }) => createBusinessTask({ ...input, dueDate: new Date(input.dueDate) } as any)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        priority: z.enum(["normal", "urgente"]).optional(),
        isCompleted: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, dueDate, ...rest } = input;
        await updateBusinessTask(id, {
          ...rest,
          ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
        } as any);
      }),
     delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => deleteBusinessTask(input.id)),
  }),

  // ─── MÓDULO GESTÃO DE OBRAS ──────────────────────────────────────────────────
  contractors: router({
    list: protectedProcedure.query(async () => listContractors()),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getContractorById(input.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().optional(),
        cpfCnpj: z.string().optional(),
        specialty: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => createContractor(input as any)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        cpfCnpj: z.string().optional(),
        specialty: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...rest } = input;
        await updateContractor(id, rest as any);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => deleteContractor(input.id)),
  }),

  architects: router({
    list: protectedProcedure.query(async () => listArchitects()),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getArchitectById(input.id)),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        email: z.string().optional(),
        cpfCnpj: z.string().optional(),
        specialty: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => createArchitect(input as any)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        cpfCnpj: z.string().optional(),
        specialty: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...rest } = input;
        await updateArchitect(id, rest as any);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => deleteArchitect(input.id)),
  }),

  constructions: router({
    list: protectedProcedure
      .input(z.object({ archived: z.boolean().optional() }).optional())
      .query(async ({ input }) => listConstructions(input?.archived ?? false)),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => getConstructionById(input.id)),
    stats: protectedProcedure.query(async () => getConstructionStats()),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        hasKey: z.boolean().optional(),
        contractorId: z.number().optional(),
        architectId: z.number().optional(),
        constructionType: z.enum(["residencial", "comercial", "reforma", "galpao", "loteamento", "outro"]).optional(),
        status: z.enum(["em_andamento", "paralisada", "concluida"]).optional(),
        progress: z.enum(["avancada", "em_dia", "atrasada", "totalmente_atrasada"]).optional(),
        description: z.string().optional(),
        startDate: z.string().optional(),
        expectedEndDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { startDate, expectedEndDate, ...rest } = input;
        return createConstruction({
          ...rest,
          ...(startDate ? { startDate: new Date(startDate) } : {}),
          ...(expectedEndDate ? { expectedEndDate: new Date(expectedEndDate) } : {}),
        } as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        hasKey: z.boolean().optional(),
        contractorId: z.number().nullable().optional(),
        architectId: z.number().nullable().optional(),
        constructionType: z.enum(["residencial", "comercial", "reforma", "galpao", "loteamento", "outro"]).optional(),
        status: z.enum(["em_andamento", "paralisada", "concluida"]).optional(),
        progress: z.enum(["avancada", "em_dia", "atrasada", "totalmente_atrasada"]).optional(),
        description: z.string().optional(),
        isArchived: z.boolean().optional(),
        startDate: z.string().optional(),
        expectedEndDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, startDate, expectedEndDate, ...rest } = input;
        await updateConstruction(id, {
          ...rest,
          ...(startDate ? { startDate: new Date(startDate) } : {}),
          ...(expectedEndDate ? { expectedEndDate: new Date(expectedEndDate) } : {}),
        } as any);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => deleteConstruction(input.id)),
  }),

  constructionReports: router({
    listByConstruction: protectedProcedure.input(z.object({ constructionId: z.number() })).query(async ({ input }) => listReportsByConstruction(input.constructionId)),
    listAll: protectedProcedure.query(async () => listAllReports()),
    create: protectedProcedure
      .input(z.object({
        constructionId: z.number(),
        title: z.string().min(1),
        content: z.string().min(1),
        author: z.string().optional(),
        reportDate: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { reportDate, ...rest } = input;
        return createReport({ ...rest, reportDate: new Date(reportDate) } as any);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => deleteReport(input.id)),
  }),

  constructionImages: router({
    listByConstruction: protectedProcedure.input(z.object({ constructionId: z.number() })).query(async ({ input }) => listImagesByConstruction(input.constructionId)),
    listAll: protectedProcedure.query(async () => listAllImages()),
    upload: protectedProcedure
      .input(z.object({
        constructionId: z.number(),
        fileBase64: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
        caption: z.string().optional(),
        uploadedBy: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileBase64, "base64");
        const key = `obras/${input.constructionId}/${nanoid()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return createImage({
          constructionId: input.constructionId,
          imageUrl: url,
          imageKey: key,
          caption: input.caption,
          uploadedBy: input.uploadedBy,
        } as any);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => deleteImage(input.id)),
  }),

  constructionTasks: router({
    list: protectedProcedure
      .input(z.object({ constructionId: z.number().optional() }).optional())
      .query(async ({ input }) => listConstructionTasks(input?.constructionId)),
    create: protectedProcedure
      .input(z.object({
        constructionId: z.number().optional(),
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.string(),
        taskType: z.enum(["marco", "prazo_entrega", "vistoria", "reuniao", "outro"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { dueDate, ...rest } = input;
        return createConstructionTask({ ...rest, dueDate: new Date(dueDate) } as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        taskType: z.enum(["marco", "prazo_entrega", "vistoria", "reuniao", "outro"]).optional(),
        isCompleted: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, dueDate, ...rest } = input;
        await updateConstructionTask(id, {
          ...rest,
          ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
        } as any);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => deleteConstructionTask(input.id)),
  }),

  // ─── SUPRIMENTOS E CHECKLIST ──────────────────────────────────────────────
  supplies2: router({
    categories: protectedProcedure.query(() => getSupplyCategories()),
    itemsByCategory: protectedProcedure.input(z.object({ categoryId: z.number() })).query(({ input }) => getSupplyItemsByCategory(input.categoryId)),
    searchCategories: protectedProcedure.input(z.object({ query: z.string() })).query(({ input }) => searchSupplyCategories(input.query)),
    searchItems: protectedProcedure.input(z.object({ query: z.string() })).query(({ input }) => searchSupplyItems(input.query)),
    lastClosedValue: protectedProcedure.input(z.object({ supplyItemId: z.number(), excludeConstructionId: z.number().optional() })).query(({ input }) => getLastClosedValue(input.supplyItemId, input.excludeConstructionId)),
  }),
  constructionSupplies: router({
    list: protectedProcedure.input(z.object({ constructionId: z.number(), categoryId: z.number().optional() })).query(({ input }) => getConstructionSupplyItems(input.constructionId, input.categoryId)),
    create: protectedProcedure
      .input(z.object({
        constructionId: z.number(),
        categoryId: z.number(),
        supplyItemId: z.number(),
        quantity: z.string().optional(),
        unit: z.string().optional(),
        closedValue: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => createConstructionSupplyItem(input as any)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        quantity: z.string().optional(),
        unit: z.string().optional(),
        closedValue: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...rest } = input;
        await updateConstructionSupplyItem(id, rest as any);
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => deleteConstructionSupplyItem(input.id)),
  }),
  supplyFiles: router({
    list: protectedProcedure.input(z.object({ constructionId: z.number(), categoryId: z.number().optional() })).query(({ input }) => getSupplyFiles(input.constructionId, input.categoryId)),
    upload: protectedProcedure
      .input(z.object({
        constructionId: z.number(),
        categoryId: z.number(),
        fileName: z.string(),
        fileBase64: z.string(),
        contentType: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.fileBase64, "base64");
        const key = `supply-files/${input.constructionId}/${input.categoryId}/${nanoid()}-${input.fileName}`;
        const { url } = await storagePut(key, buffer, input.contentType || "application/pdf");
        return createSupplyFile({
          constructionId: input.constructionId,
          categoryId: input.categoryId,
          fileName: input.fileName,
          fileUrl: url,
          fileKey: key,
          uploadedBy: ctx.user?.name ?? "Sistema",
        });
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => deleteSupplyFile(input.id)),
  }),
  constructionChecklist: router({
    get: protectedProcedure.input(z.object({ constructionId: z.number() })).query(({ input }) => getConstructionChecklist(input.constructionId)),
    initialize: protectedProcedure.input(z.object({ constructionId: z.number() })).mutation(({ input }) => initializeChecklist(input.constructionId)),
    toggle: protectedProcedure
      .input(z.object({ id: z.number(), isChecked: z.boolean() }))
      .mutation(async ({ input, ctx }) => toggleChecklistItem(input.id, input.isChecked, ctx.user?.id)),
    updateNotes: protectedProcedure
      .input(z.object({ id: z.number(), notes: z.string() }))
      .mutation(async ({ input }) => updateChecklistNotes(input.id, input.notes)),
  }),
  // ─── MÓDULO FINANCEIRO ────────────────────────────────────────────────────

  financial: router({
    // Dashboard / Resumo
    summary: protectedProcedure
      .input(z.object({ startDate: z.string().optional(), endDate: z.string().optional() }).optional())
      .query(async ({ input }) => getFinancialSummary(input)),
    
    byProperty: protectedProcedure
      .query(async () => getFinancialByProperty()),
    
    overdue: protectedProcedure
      .query(async () => getOverdueEntries()),

    // Lançamentos
    entries: router({
      list: protectedProcedure
        .input(z.object({
          type: z.enum(["entrada", "saida"]).optional(),
          status: z.string().optional(),
          propertyId: z.number().optional(),
          constructionId: z.number().optional(),
          costCenter: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        }).optional())
        .query(async ({ input }) => listFinancialEntries(input)),
      
      get: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => getFinancialEntry(input.id)),
      
      create: protectedProcedure
        .input(z.object({
          type: z.enum(["entrada", "saida"]),
          category: z.enum(["aluguel", "condominio", "iptu", "venda", "manutencao", "comissao", "taxa_admin", "seguro", "agua", "luz", "gas", "internet", "material", "mao_de_obra", "outros"]),
          description: z.string().min(1),
          amount: z.string(),
          dueDate: z.string(),
          status: z.enum(["aberto", "pago", "cancelado", "atrasado"]).optional(),
          propertyId: z.number().nullable().optional(),
          constructionId: z.number().nullable().optional(),
          costCenter: z.string().optional(),
          rentalContractId: z.number().nullable().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => createFinancialEntry({ ...input, createdBy: ctx.user.id })),
      
      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          type: z.enum(["entrada", "saida"]).optional(),
          category: z.enum(["aluguel", "condominio", "iptu", "venda", "manutencao", "comissao", "taxa_admin", "seguro", "agua", "luz", "gas", "internet", "material", "mao_de_obra", "outros"]).optional(),
          description: z.string().optional(),
          amount: z.string().optional(),
          dueDate: z.string().optional(),
          paymentDate: z.string().nullable().optional(),
          status: z.enum(["aberto", "pago", "cancelado", "atrasado"]).optional(),
          propertyId: z.number().nullable().optional(),
          constructionId: z.number().nullable().optional(),
          costCenter: z.string().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          return updateFinancialEntry(id, data);
        }),
      
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => deleteFinancialEntry(input.id)),
      
      markPaid: protectedProcedure
        .input(z.object({ id: z.number(), paymentDate: z.string().optional() }))
        .mutation(async ({ input }) => markEntryAsPaid(input.id, input.paymentDate)),
      
      byProperty: protectedProcedure
        .input(z.object({ propertyId: z.number() }))
        .query(async ({ input }) => getEntriesByProperty(input.propertyId)),
    }),

    // Contas Recorrentes
    recurring: router({
      list: protectedProcedure
        .input(z.object({ propertyId: z.number().optional(), isActive: z.boolean().optional() }).optional())
        .query(async ({ input }) => listRecurringBills(input)),
      
      get: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input }) => getRecurringBill(input.id)),
      
      create: protectedProcedure
        .input(z.object({
          title: z.string().min(1),
          category: z.enum(["iptu", "condominio", "seguro", "agua", "luz", "gas", "internet", "outros"]),
          type: z.enum(["entrada", "saida"]).optional(),
          amount: z.string(),
          propertyId: z.number().nullable().optional(),
          costCenter: z.string().optional(),
          inscricaoImobiliaria: z.string().optional(),
          frequency: z.enum(["mensal", "bimestral", "trimestral", "semestral", "anual"]).optional(),
          billingDay: z.number().min(1).max(28).optional(),
          startDate: z.string(),
          endDate: z.string().nullable().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input, ctx }) => createRecurringBill({ ...input, createdBy: ctx.user.id })),
      
      update: protectedProcedure
        .input(z.object({
          id: z.number(),
          title: z.string().optional(),
          amount: z.string().optional(),
          isActive: z.boolean().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const { id, ...data } = input;
          return updateRecurringBill(id, data);
        }),
      
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input }) => deleteRecurringBill(input.id)),
      
      generateIPTU: protectedProcedure
        .input(z.object({ recurringBillId: z.number(), year: z.number() }))
        .mutation(async ({ input }) => generateIPTUEntries(input.recurringBillId, input.year)),
      
      generateEntries: protectedProcedure
        .input(z.object({ recurringBillId: z.number(), months: z.number().min(1).max(36).optional() }))
        .mutation(async ({ input }) => generateRecurringEntries(input.recurringBillId, input.months)),
    }),

    // Parcelas de Aluguel
    rentInstallments: router({
      generate: protectedProcedure
        .input(z.object({ contractId: z.number(), months: z.number().min(1).max(36).optional() }))
        .mutation(async ({ input }) => generateRentInstallments(input.contractId, input.months)),
    }),

    // Conciliação Bancária
    bank: router({
      imports: router({
        list: protectedProcedure.query(async () => listBankImports()),
        create: protectedProcedure
          .input(z.object({ fileName: z.string() }))
          .mutation(async ({ input, ctx }) => createBankImport({ ...input, importedBy: ctx.user.id })),
      }),
      
      transactions: router({
        list: protectedProcedure
          .input(z.object({ bankImportId: z.number(), status: z.string().optional() }))
          .query(async ({ input }) => listBankTransactions(input.bankImportId, input.status)),
        
        update: protectedProcedure
          .input(z.object({
            id: z.number(),
            status: z.enum(["pendente", "conciliado", "ignorado", "manual"]).optional(),
            matchedEntryId: z.number().nullable().optional(),
            notes: z.string().optional(),
          }))
          .mutation(async ({ input }) => {
            const { id, ...data } = input;
            return updateBankTransaction(id, data);
          }),
        
        conciliate: protectedProcedure
          .input(z.object({ transactionId: z.number(), entryId: z.number() }))
          .mutation(async ({ input }) => conciliateTransaction(input.transactionId, input.entryId)),
        
        findCandidates: protectedProcedure
          .input(z.object({ amount: z.number(), dateStart: z.string(), dateEnd: z.string() }))
          .query(async ({ input }) => findConciliationCandidates(input.amount, { start: input.dateStart, end: input.dateEnd })),
      }),
      
      // Upload e parse de CSV
      uploadCSV: protectedProcedure
        .input(z.object({
          fileName: z.string(),
          csvContent: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
          // Criar registro de importação
          const importResult = await createBankImport({ fileName: input.fileName, importedBy: ctx.user.id });
          const importId = importResult.id;
          
          // Parse do CSV
          const lines = input.csvContent.split("\n").filter(l => l.trim());
          if (lines.length < 2) throw new Error("CSV vazio ou sem dados");
          
          // Detectar separador (vírgula ou ponto-e-vírgula)
          const header = lines[0];
          const separator = header.includes(";") ? ";" : ",";
          const headers = header.split(separator).map(h => h.trim().toLowerCase().replace(/"/g, ""));
          
          // Mapear colunas (flexível)
          const dateIdx = headers.findIndex(h => h.includes("data") || h.includes("date"));
          const descIdx = headers.findIndex(h => h.includes("descri") || h.includes("description") || h.includes("historico") || h.includes("hist"));
          const valueIdx = headers.findIndex(h => h.includes("valor") || h.includes("value") || h.includes("amount") || h.includes("quantia"));
          const idIdx = headers.findIndex(h => h.includes("documento") || h.includes("doc") || h.includes("id") || h.includes("transacao") || h.includes("numero"));
          
          if (dateIdx === -1 || valueIdx === -1) {
            throw new Error("CSV deve conter colunas de Data e Valor. Colunas encontradas: " + headers.join(", "));
          }
          
          const transactions: any[] = [];
          let totalPending = 0;
          
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(separator).map(c => c.trim().replace(/"/g, ""));
            if (cols.length < 2) continue;
            
            const rawDate = cols[dateIdx] || "";
            const rawValue = cols[valueIdx] || "0";
            const rawDesc = descIdx >= 0 ? (cols[descIdx] || "Sem descrição") : "Sem descrição";
            const rawId = idIdx >= 0 ? (cols[idIdx] || "") : "";
            
            // Parse data (DD/MM/YYYY ou YYYY-MM-DD)
            let parsedDate = rawDate;
            if (rawDate.includes("/")) {
              const parts = rawDate.split("/");
              if (parts.length === 3) {
                parsedDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
              }
            }
            
            // Parse valor (aceita vírgula como decimal)
            const cleanValue = rawValue.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
            const numValue = parseFloat(cleanValue);
            if (isNaN(numValue) || numValue === 0) continue;
            
            transactions.push({
              bankImportId: importId,
              transactionDate: parsedDate,
              description: rawDesc,
              amount: String(numValue),
              transactionId: rawId || null,
              status: "pendente" as const,
            });
            totalPending++;
          }
          
          // Inserir transações em batch
          if (transactions.length > 0) {
            await createBankTransactionsBatch(transactions);
          }
          
          // Atualizar contadores da importação
          await updateBankImport(importId, {
            totalRows: transactions.length,
            pendingRows: totalPending,
          });
          
          // Tentar conciliação automática para cada transação
          const autoMatches: { transactionIdx: number; entryId: number; description: string }[] = [];
          for (let i = 0; i < transactions.length; i++) {
            const t = transactions[i];
            const amount = parseFloat(t.amount);
            // Buscar candidatos com tolerância de 30 dias
            const dDate = new Date(t.transactionDate);
            const start = new Date(dDate); start.setDate(start.getDate() - 15);
            const end = new Date(dDate); end.setDate(end.getDate() + 15);
            const candidates = await findConciliationCandidates(
              amount,
              { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] }
            );
            if (candidates.length === 1) {
              autoMatches.push({ transactionIdx: i, entryId: candidates[0].id, description: candidates[0].description });
            }
          }
          
          return {
            importId,
            totalRows: transactions.length,
            autoMatches: autoMatches.length,
            pendingRows: transactions.length - autoMatches.length,
          };
        }),
    }),
  }),

  // ─── MÓDULO PROCESSOS — CRÉDITOS JUDICIAIS (KANBAN) ─────────────────────
  creditosJudiciais: router({
    list: protectedProcedure.query(async () => listCreditosJudiciais()),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        processNumber: z.string().optional(),
        address: z.string().optional(),
        value: z.string().optional(),
        stage: z.enum(["registro_em_andamento", "desocupado", "sem_acao_judicial", "acao_judicial_ordinaria", "execucao", "com_pedido_desocupacao"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const stage = input.stage ?? "registro_em_andamento";
        return createCreditoJudicial({
          ...input,
          stage,
          registroStatus: stage === "registro_em_andamento" ? "sem_registro" : "com_registro",
        } as any);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        processNumber: z.string().optional(),
        address: z.string().optional(),
        value: z.string().optional(),
        stage: z.enum(["registro_em_andamento", "desocupado", "sem_acao_judicial", "acao_judicial_ordinaria", "execucao", "com_pedido_desocupacao"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, stage, ...rest } = input;
        await updateCreditoJudicial(id, {
          ...rest,
          ...(stage ? { stage, registroStatus: stage === "registro_em_andamento" ? "sem_registro" : "com_registro" } : {}),
        } as any);
        return { success: true } as const;
      }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => { await deleteCreditoJudicial(input.id); return { success: true } as const; }),
  }),
});
export type AppRouter = typeof appRouter;
