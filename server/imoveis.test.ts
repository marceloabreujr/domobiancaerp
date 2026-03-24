import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("Módulo Gestão de Imóveis - Routers", () => {
  // Owners
  describe("owners", () => {
    it("deve ter router owners.list definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("owners.list");
    });

    it("deve ter router owners.create definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("owners.create");
    });

    it("deve ter router owners.update definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("owners.update");
    });

    it("deve ter router owners.delete definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("owners.delete");
    });
  });

  // Clients
  describe("clients", () => {
    it("deve ter router clients.list definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("clients.list");
    });

    it("deve ter router clients.create definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("clients.create");
    });

    it("deve ter router clients.update definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("clients.update");
    });

    it("deve ter router clients.delete definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("clients.delete");
    });
  });

  // Properties
  describe("properties", () => {
    it("deve ter router properties.list definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("properties.list");
    });

    it("deve ter router properties.get definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("properties.get");
    });

    it("deve ter router properties.stats definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("properties.stats");
    });

    it("deve ter router properties.create definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("properties.create");
    });

    it("deve ter router properties.update definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("properties.update");
    });

    it("deve ter router properties.delete definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("properties.delete");
    });
  });

  // Rental Contracts
  describe("rentalContracts", () => {
    it("deve ter router rentalContracts.list definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("rentalContracts.list");
    });

    it("deve ter router rentalContracts.get definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("rentalContracts.get");
    });

    it("deve ter router rentalContracts.alerts definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("rentalContracts.alerts");
    });

    it("deve ter router rentalContracts.financialSummary definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("rentalContracts.financialSummary");
    });

    it("deve ter router rentalContracts.create definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("rentalContracts.create");
    });

    it("deve ter router rentalContracts.update definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("rentalContracts.update");
    });

    it("deve ter router rentalContracts.delete definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("rentalContracts.delete");
    });
  });

  // Property Todos
  describe("propertyTodos", () => {
    it("deve ter router propertyTodos.list definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("propertyTodos.list");
    });

    it("deve ter router propertyTodos.create definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("propertyTodos.create");
    });

    it("deve ter router propertyTodos.update definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("propertyTodos.update");
    });

    it("deve ter router propertyTodos.delete definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("propertyTodos.delete");
    });
  });

  // Property Checklists
  describe("propertyChecklists", () => {
    it("deve ter router propertyChecklists.list definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("propertyChecklists.list");
    });

    it("deve ter router propertyChecklists.create definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("propertyChecklists.create");
    });

    it("deve ter router propertyChecklists.update definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("propertyChecklists.update");
    });

    it("deve ter router propertyChecklists.delete definido", () => {
      expect(appRouter._def.procedures).toHaveProperty("propertyChecklists.delete");
    });
  });
});

describe("Validação de input dos routers de imóveis", () => {
  it("properties.create deve rejeitar input sem title", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.properties.create({ title: "" } as any)).rejects.toThrow();
  });

  it("owners.create deve rejeitar input sem name", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.owners.create({ name: "" } as any)).rejects.toThrow();
  });

  it("clients.create deve rejeitar input sem name", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.clients.create({ name: "" } as any)).rejects.toThrow();
  });
});
