import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  listUsers, updateUserRole,
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
  listProperties, getProperty, createProperty, updateProperty, deleteProperty, getPropertyStats,
  listRentalContracts, getRentalContract, createRentalContract, updateRentalContract, deleteRentalContract, getUpcomingRentAlerts, getPropertyFinancialSummary,
  listPropertyTodos, createPropertyTodo, updatePropertyTodo, deletePropertyTodo,
  listPropertyChecklists, createPropertyChecklist, updatePropertyChecklist, deletePropertyChecklist,
} from "./db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  users: router({
    list: adminProcedure.query(async () => listUsers()),
    updateRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["admin", "gerente", "operador"]) }))
      .mutation(async ({ input }) => { await updateUserRole(input.userId, input.role); return { success: true } as const; }),
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
        status: z.enum(["disponivel", "alugado", "a_venda", "vendido", "arquivado"]).optional(),
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
      .mutation(async ({ input }) => createProperty(input as any)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        code: z.string().optional(),
        ownership: z.enum(["domobianca", "terceiros"]).optional(),
        propertyType: z.enum(["residencial", "apartamento", "galpao", "sala_comercial", "lote", "casa", "cobertura", "kitnet", "outro"]).optional(),
        status: z.enum(["disponivel", "alugado", "a_venda", "vendido", "arquivado"]).optional(),
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
        leaseTerm: z.enum(["mensal", "trimestral", "semestral", "anual", "2_anos", "3_anos"]).optional(),
        rentAmount: z.string(),
        condoIncluded: z.boolean().optional(),
        iptuIncluded: z.boolean().optional(),
        isPackage: z.boolean().optional(),
        packageTotal: z.string().optional(),
        adjustmentIndex: z.enum(["igpm", "ipca", "inpc", "nenhum"]).optional(),
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
});

export type AppRouter = typeof appRouter;
