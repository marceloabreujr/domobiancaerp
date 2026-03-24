import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
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

describe("Módulo Gestão de Obras - Routers", () => {
  // --- Empreiteiros ---
  describe("contractors", () => {
    it("deve ter router de listagem", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.contractors.list).toBeDefined();
    });

    it("deve ter router de criação com validação", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.contractors.create).toBeDefined();
    });

    it("deve ter router de atualização", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.contractors.update).toBeDefined();
    });

    it("deve ter router de exclusão", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.contractors.delete).toBeDefined();
    });

    it("deve ter router de busca por ID", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.contractors.getById).toBeDefined();
    });
  });

  // --- Arquitetas ---
  describe("architects", () => {
    it("deve ter router de listagem", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.architects.list).toBeDefined();
    });

    it("deve ter router de criação", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.architects.create).toBeDefined();
    });

    it("deve ter router de atualização", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.architects.update).toBeDefined();
    });

    it("deve ter router de exclusão", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.architects.delete).toBeDefined();
    });
  });

  // --- Obras ---
  describe("constructions", () => {
    it("deve ter router de listagem", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructions.list).toBeDefined();
    });

    it("deve ter router de criação com campos obrigatórios", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructions.create).toBeDefined();
    });

    it("deve ter router de atualização", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructions.update).toBeDefined();
    });

    it("deve ter router de exclusão", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructions.delete).toBeDefined();
    });

    it("deve ter router de estatísticas", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructions.stats).toBeDefined();
    });

    it("deve ter router de busca por ID", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructions.getById).toBeDefined();
    });

    it("deve rejeitar criação sem título", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.constructions.create({ title: "" })).rejects.toThrow();
    });
  });

  // --- Relatórios ---
  describe("constructionReports", () => {
    it("deve ter router de listagem por obra", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionReports.listByConstruction).toBeDefined();
    });

    it("deve ter router de listagem geral", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionReports.listAll).toBeDefined();
    });

    it("deve ter router de criação", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionReports.create).toBeDefined();
    });

    it("deve ter router de exclusão", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionReports.delete).toBeDefined();
    });

    it("deve rejeitar criação sem título", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.constructionReports.create({
        constructionId: 1,
        title: "",
        content: "test",
        reportDate: "2025-01-01",
      })).rejects.toThrow();
    });
  });

  // --- Imagens ---
  describe("constructionImages", () => {
    it("deve ter router de listagem por obra", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionImages.listByConstruction).toBeDefined();
    });

    it("deve ter router de listagem geral", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionImages.listAll).toBeDefined();
    });

    it("deve ter router de upload", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionImages.upload).toBeDefined();
    });

    it("deve ter router de exclusão", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionImages.delete).toBeDefined();
    });
  });

  // --- Tarefas ---
  describe("constructionTasks", () => {
    it("deve ter router de listagem", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionTasks.list).toBeDefined();
    });

    it("deve ter router de criação", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionTasks.create).toBeDefined();
    });

    it("deve ter router de atualização", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionTasks.update).toBeDefined();
    });

    it("deve ter router de exclusão", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionTasks.delete).toBeDefined();
    });

    it("deve rejeitar criação sem título", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      await expect(caller.constructionTasks.create({
        title: "",
        dueDate: "2025-01-01",
      })).rejects.toThrow();
    });
  });
});
