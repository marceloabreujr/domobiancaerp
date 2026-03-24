import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Helper to create an authenticated context
function createTestContext(role: "admin" | "gerente" | "operador" = "admin"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@domobianca.com",
      name: "Test User",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("Admin Module - Router Structure", () => {
  it("has employees router with CRUD procedures", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.employees).toBeDefined();
    expect(caller.employees.list).toBeDefined();
    expect(caller.employees.create).toBeDefined();
    expect(caller.employees.update).toBeDefined();
    expect(caller.employees.delete).toBeDefined();
  });

  it("has timeOff router with CRUD procedures", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.timeOff).toBeDefined();
    expect(caller.timeOff.list).toBeDefined();
    expect(caller.timeOff.create).toBeDefined();
  });

  it("has documents router with CRUD procedures", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.documents).toBeDefined();
    expect(caller.documents.list).toBeDefined();
    expect(caller.documents.create).toBeDefined();
    expect(caller.documents.expiring).toBeDefined();
  });

  it("has calendar router with CRUD procedures", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.calendar).toBeDefined();
    expect(caller.calendar.list).toBeDefined();
    expect(caller.calendar.create).toBeDefined();
  });

  it("has supplies router with CRUD procedures", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.supplies).toBeDefined();
    expect(caller.supplies.list).toBeDefined();
    expect(caller.supplies.create).toBeDefined();
  });

  it("has fleet router with CRUD procedures", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.fleet).toBeDefined();
    expect(caller.fleet.list).toBeDefined();
    expect(caller.fleet.create).toBeDefined();
  });

  it("has pettyCash router with CRUD and balance procedures", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.pettyCash).toBeDefined();
    expect(caller.pettyCash.list).toBeDefined();
    expect(caller.pettyCash.create).toBeDefined();
    expect(caller.pettyCash.balance).toBeDefined();
  });

  it("has tickets router with CRUD procedures", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.tickets).toBeDefined();
    expect(caller.tickets.list).toBeDefined();
    expect(caller.tickets.create).toBeDefined();
    expect(caller.tickets.update).toBeDefined();
  });

  it("has AI router with all tools", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.ai).toBeDefined();
    expect(caller.ai.summarizeContract).toBeDefined();
    expect(caller.ai.draftMemo).toBeDefined();
    expect(caller.ai.ocrInvoice).toBeDefined();
    expect(caller.ai.assistant).toBeDefined();
  });
});

describe("Admin Module - Access Control", () => {
  it("blocks unauthenticated users from employees.list", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.employees.list()).rejects.toThrow();
  });

  it("blocks unauthenticated users from documents.list", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.documents.list({})).rejects.toThrow();
  });

  it("blocks unauthenticated users from calendar.list", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.calendar.list()).rejects.toThrow();
  });

  it("blocks unauthenticated users from AI assistant", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.ai.assistant({ question: "teste" })).rejects.toThrow();
  });

  it("blocks unauthenticated users from tickets", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.tickets.list({})).rejects.toThrow();
  });

  it("blocks non-admin from user management", async () => {
    const ctx = createTestContext("operador");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.users.list()).rejects.toThrow();
  });

  it("blocks gerente from user management", async () => {
    const ctx = createTestContext("gerente");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.users.list()).rejects.toThrow();
  });
});

describe("Admin Module - Input Validation", () => {
  it("rejects employee creation without name", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.employees.create({ name: "" })).rejects.toThrow();
  });

  it("rejects document creation without title", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.documents.create({ title: "", category: "outro" })).rejects.toThrow();
  });

  it("rejects calendar event creation without title", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.calendar.create({ title: "", eventDate: "2025-12-31", eventType: "outro" })).rejects.toThrow();
  });

  it("rejects ticket creation without title", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.tickets.create({ title: "" })).rejects.toThrow();
  });

  it("rejects supply creation without name", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.supplies.create({ name: "" })).rejects.toThrow();
  });

  it("rejects petty cash entry without description", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.pettyCash.create({ description: "", amount: "10", type: "saida", date: "2025-12-31" })).rejects.toThrow();
  });
});
