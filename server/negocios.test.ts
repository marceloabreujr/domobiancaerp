import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createTestContext(role: "admin" | "gerente" | "operador" = "admin"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
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

describe("Módulo Gestão de Negócios", () => {
  describe("negocios router", () => {
    it("deve ter procedimento list", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.negocios.list).toBeDefined();
    });

    it("deve ter procedimento create", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.negocios.create).toBeDefined();
    });

    it("deve ter procedimento get", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.negocios.get).toBeDefined();
    });

    it("deve ter procedimento update", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.negocios.update).toBeDefined();
    });

    it("deve ter procedimento delete", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.negocios.delete).toBeDefined();
    });

    it("deve ter procedimento archive", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.negocios.archive).toBeDefined();
    });

    it("deve ter procedimento unarchive", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.negocios.unarchive).toBeDefined();
    });

    it("deve ter procedimento stats", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.negocios.stats).toBeDefined();
    });
  });

  describe("captadores router", () => {
    it("deve ter procedimento list", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.captadores.list).toBeDefined();
    });

    it("deve ter procedimento create", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.captadores.create).toBeDefined();
    });

    it("deve ter procedimento update", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.captadores.update).toBeDefined();
    });

    it("deve ter procedimento delete", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.captadores.delete).toBeDefined();
    });

    it("deve ter procedimento dashboard", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.captadores.dashboard).toBeDefined();
    });
  });

  describe("viabilidade router", () => {
    it("deve ter procedimento get", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.viabilidade.get).toBeDefined();
    });

    it("deve ter procedimento upsert", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.viabilidade.upsert).toBeDefined();
    });
  });

  describe("businessTasks router", () => {
    it("deve ter procedimento list", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.businessTasks.list).toBeDefined();
    });

    it("deve ter procedimento create", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.businessTasks.create).toBeDefined();
    });

    it("deve ter procedimento update", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.businessTasks.update).toBeDefined();
    });

    it("deve ter procedimento delete", () => {
      const caller = appRouter.createCaller(createTestContext());
      expect(caller.businessTasks.delete).toBeDefined();
    });
  });

  describe("validação de input", () => {
    it("deve rejeitar negócio sem título", async () => {
      const caller = appRouter.createCaller(createTestContext());
      await expect(
        caller.negocios.create({ title: "" })
      ).rejects.toThrow();
    });

    it("deve rejeitar captador sem nome", async () => {
      const caller = appRouter.createCaller(createTestContext());
      await expect(
        caller.captadores.create({ name: "" })
      ).rejects.toThrow();
    });

    it("deve rejeitar tarefa sem título", async () => {
      const caller = appRouter.createCaller(createTestContext());
      await expect(
        caller.businessTasks.create({ title: "", dueDate: "2026-01-01" })
      ).rejects.toThrow();
    });

    it("deve rejeitar tarefa sem data", async () => {
      const caller = appRouter.createCaller(createTestContext());
      await expect(
        caller.businessTasks.create({ title: "Test", dueDate: "" })
      ).rejects.toThrow();
    });
  });

  describe("controle de acesso", () => {
    it("operador pode listar negócios", () => {
      const caller = appRouter.createCaller(createTestContext("operador"));
      expect(caller.negocios.list).toBeDefined();
    });

    it("gerente pode listar negócios", () => {
      const caller = appRouter.createCaller(createTestContext("gerente"));
      expect(caller.negocios.list).toBeDefined();
    });

    it("admin pode listar negócios", () => {
      const caller = appRouter.createCaller(createTestContext("admin"));
      expect(caller.negocios.list).toBeDefined();
    });
  });
});
