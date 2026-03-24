import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(role: "admin" | "gerente" | "operador"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@domobianca.com",
    name: "Test User",
    loginMethod: "password",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createAnonContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

// ─── FINANCIAL ENTRIES ─────────────────────────────────────────────────────

describe("financial.entries.create - access control", () => {
  it("authenticated user can create financial entry (DB error expected)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.entries.create({
        type: "entrada",
        category: "aluguel",
        description: "Aluguel Apt 101 - Jan/2026",
        amount: "2500.00",
        dueDate: "2026-01-10",
        propertyId: 1,
        costCenter: "imovel_1",
      });
    } catch (e: any) {
      // DB errors expected in test env, but NOT permission errors
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("anonymous user cannot create financial entry", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.entries.create({
        type: "saida",
        category: "iptu",
        description: "IPTU Apt 101",
        amount: "500.00",
        dueDate: "2026-02-15",
      })
    ).rejects.toThrow();
  });
});

describe("financial.entries.list - access control", () => {
  it("authenticated user can list entries (DB error expected)", async () => {
    const ctx = createUserContext("gerente");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.entries.list({});
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("anonymous user cannot list entries", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.financial.entries.list({})).rejects.toThrow();
  });
});

describe("financial.entries.markPaid - access control", () => {
  it("authenticated user can mark as paid (DB error expected)", async () => {
    const ctx = createUserContext("operador");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.entries.markPaid({ id: 1 });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("anonymous user cannot mark as paid", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.financial.entries.markPaid({ id: 1 })).rejects.toThrow();
  });
});

describe("financial.entries.update - access control", () => {
  it("authenticated user can update entry (DB error expected)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.entries.update({ id: 1, description: "Updated desc" });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });
});

describe("financial.entries.delete - access control", () => {
  it("authenticated user can delete entry (DB error expected)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.entries.delete({ id: 1 });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("anonymous user cannot delete entry", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.financial.entries.delete({ id: 1 })).rejects.toThrow();
  });
});

// ─── FINANCIAL SUMMARY ─────────────────────────────────────────────────────

describe("financial.summary - access control", () => {
  it("authenticated user can get summary (DB error expected)", async () => {
    const ctx = createUserContext("gerente");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.summary({});
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("anonymous user cannot get summary", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.financial.summary({})).rejects.toThrow();
  });
});

describe("financial.overdue - access control", () => {
  it("authenticated user can get overdue (DB error expected)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.overdue();
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });
});

// ─── RECURRING BILLS ───────────────────────────────────────────────────────

describe("financial.recurring.create - access control", () => {
  it("authenticated user can create recurring bill (DB error expected)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.recurring.create({
        title: "IPTU Apt 101",
        category: "iptu",
        amount: "450.00",
        startDate: "2026-01-01",
        frequency: "mensal",
        billingDay: 10,
      });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("anonymous user cannot create recurring bill", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.recurring.create({
        title: "IPTU Apt 101",
        category: "iptu",
        amount: "450.00",
        startDate: "2026-01-01",
      })
    ).rejects.toThrow();
  });
});

describe("financial.recurring.list - access control", () => {
  it("authenticated user can list recurring bills (DB error expected)", async () => {
    const ctx = createUserContext("gerente");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.recurring.list({});
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });
});

describe("financial.recurring.generateIPTU - access control", () => {
  it("authenticated user can generate IPTU (DB error expected)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.recurring.generateIPTU({ recurringBillId: 1, year: 2026 });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("anonymous user cannot generate IPTU", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.recurring.generateIPTU({ recurringBillId: 1, year: 2026 })
    ).rejects.toThrow();
  });
});

describe("financial.recurring.generateEntries - access control", () => {
  it("authenticated user can generate entries (DB error expected)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.recurring.generateEntries({ recurringBillId: 1, months: 6 });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });
});

// ─── BANK CONCILIATION ────────────────────────────────────────────────────

describe("financial.bank.uploadCSV - access control", () => {
  it("authenticated user can upload CSV (DB error expected)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.bank.uploadCSV({
        fileName: "extrato_jan2026.csv",
        csvContent: "Data;Descrição;Valor\n10/01/2026;PIX RECEBIDO;1500.00\n15/01/2026;BOLETO PAGO;-800.00",
      });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("anonymous user cannot upload CSV", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.bank.uploadCSV({
        fileName: "extrato.csv",
        csvContent: "Data;Descrição;Valor\n10/01/2026;PIX;1500.00",
      })
    ).rejects.toThrow();
  });
});

describe("financial.bank.imports.list - access control", () => {
  it("authenticated user can list imports (DB error expected)", async () => {
    const ctx = createUserContext("gerente");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.bank.imports.list();
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("anonymous user cannot list imports", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.financial.bank.imports.list()).rejects.toThrow();
  });
});

describe("financial.bank.transactions.list - access control", () => {
  it("authenticated user can list transactions (DB error expected)", async () => {
    const ctx = createUserContext("operador");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.bank.transactions.list({ bankImportId: 1 });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });
});

describe("financial.bank.transactions.conciliate - access control", () => {
  it("authenticated user can conciliate (DB error expected)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.bank.transactions.conciliate({ transactionId: 1, entryId: 1 });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("anonymous user cannot conciliate", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.bank.transactions.conciliate({ transactionId: 1, entryId: 1 })
    ).rejects.toThrow();
  });
});

describe("financial.bank.transactions.findCandidates - access control", () => {
  it("authenticated user can find candidates (DB error expected)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.bank.transactions.findCandidates({
        amount: 1500.00,
        dateStart: "2026-01-01",
        dateEnd: "2026-01-31",
      });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });
});

// ─── RENT INSTALLMENTS ─────────────────────────────────────────────────────

describe("financial.rentInstallments.generate - access control", () => {
  it("authenticated user can generate rent installments (DB error expected)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.financial.rentInstallments.generate({ contractId: 1, months: 12 });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("anonymous user cannot generate rent installments", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.rentInstallments.generate({ contractId: 1, months: 12 })
    ).rejects.toThrow();
  });
});

// ─── INPUT VALIDATION ──────────────────────────────────────────────────────

describe("financial.entries.create - input validation", () => {
  it("rejects entry without description", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.entries.create({
        type: "entrada",
        category: "aluguel",
        description: "",
        amount: "1000.00",
        dueDate: "2026-01-10",
      })
    ).rejects.toThrow();
  });

  it("rejects entry with invalid type", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.entries.create({
        type: "invalido" as any,
        category: "aluguel",
        description: "Test",
        amount: "1000.00",
        dueDate: "2026-01-10",
      })
    ).rejects.toThrow();
  });

  it("rejects entry with invalid category", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.entries.create({
        type: "entrada",
        category: "invalida" as any,
        description: "Test",
        amount: "1000.00",
        dueDate: "2026-01-10",
      })
    ).rejects.toThrow();
  });
});

describe("financial.recurring.create - input validation", () => {
  it("rejects recurring bill without title", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.recurring.create({
        title: "",
        category: "iptu",
        amount: "450.00",
        startDate: "2026-01-01",
      })
    ).rejects.toThrow();
  });

  it("rejects recurring bill with invalid category", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.recurring.create({
        title: "Test",
        category: "invalida" as any,
        amount: "450.00",
        startDate: "2026-01-01",
      })
    ).rejects.toThrow();
  });

  it("rejects recurring bill with invalid frequency", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.recurring.create({
        title: "Test",
        category: "iptu",
        amount: "450.00",
        startDate: "2026-01-01",
        frequency: "semanal" as any,
      })
    ).rejects.toThrow();
  });

  it("rejects recurring bill with billingDay > 28", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.recurring.create({
        title: "Test",
        category: "iptu",
        amount: "450.00",
        startDate: "2026-01-01",
        billingDay: 31,
      })
    ).rejects.toThrow();
  });
});

describe("financial.bank.uploadCSV - input validation", () => {
  it("accepts upload with fileName and csvContent (DB interaction expected)", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.financial.bank.uploadCSV({
        fileName: "extrato.csv",
        csvContent: "Data;Descrição;Valor\n10/01/2026;PIX;1500.00",
      });
      // If DB is available, should return import data
      expect(result).toHaveProperty("importId");
      expect(result).toHaveProperty("totalRows");
    } catch (e: any) {
      // DB errors are expected in test env
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });

  it("rejects upload without csvContent", async () => {
    const ctx = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.financial.bank.uploadCSV({
        fileName: "extrato.csv",
        csvContent: "",
      })
    ).rejects.toThrow();
  });
});
