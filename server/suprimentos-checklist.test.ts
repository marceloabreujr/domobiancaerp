import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(role: "admin" | "gerente" | "operador" = "admin"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
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

describe("Suprimentos - Router Structure", () => {
  describe("supplies2 (categorias e itens base)", () => {
    it("deve ter router de listagem de categorias", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.supplies2.categories).toBeDefined();
    });

    it("deve ter router de itens por categoria", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.supplies2.itemsByCategory).toBeDefined();
    });

    it("deve ter router de busca de categorias", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.supplies2.searchCategories).toBeDefined();
    });

    it("deve ter router de busca de itens", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.supplies2.searchItems).toBeDefined();
    });

    it("deve ter router de último valor fechado", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.supplies2.lastClosedValue).toBeDefined();
    });
  });

  describe("constructionSupplies (itens vinculados à obra)", () => {
    it("deve ter router de listagem", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionSupplies.list).toBeDefined();
    });

    it("deve ter router de criação", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionSupplies.create).toBeDefined();
    });

    it("deve ter router de atualização", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionSupplies.update).toBeDefined();
    });

    it("deve ter router de exclusão", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionSupplies.delete).toBeDefined();
    });
  });

  describe("supplyFiles (arquivos de orçamento)", () => {
    it("deve ter router de listagem", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.supplyFiles.list).toBeDefined();
    });

    it("deve ter router de upload", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.supplyFiles.upload).toBeDefined();
    });

    it("deve ter router de exclusão", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.supplyFiles.delete).toBeDefined();
    });
  });
});

describe("Checklist de Ação - Router Structure", () => {
  describe("constructionChecklist", () => {
    it("deve ter router de obter checklist", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionChecklist.get).toBeDefined();
    });

    it("deve ter router de inicializar checklist", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionChecklist.initialize).toBeDefined();
    });

    it("deve ter router de toggle", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionChecklist.toggle).toBeDefined();
    });

    it("deve ter router de atualizar notas", () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);
      expect(caller.constructionChecklist.updateNotes).toBeDefined();
    });
  });
});

describe("Suprimentos - Validação de Input", () => {
  it("deve rejeitar criação de item sem constructionId", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.constructionSupplies.create({
        constructionId: undefined as any,
        categoryId: 1,
        supplyItemId: 1,
      })
    ).rejects.toThrow();
  });

  it("deve rejeitar criação de item sem categoryId", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.constructionSupplies.create({
        constructionId: 1,
        categoryId: undefined as any,
        supplyItemId: 1,
      })
    ).rejects.toThrow();
  });

  it("deve rejeitar criação de item sem supplyItemId", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.constructionSupplies.create({
        constructionId: 1,
        categoryId: 1,
        supplyItemId: undefined as any,
      })
    ).rejects.toThrow();
  });
});

describe("Checklist - Validação de Input", () => {
  it("deve rejeitar toggle sem id", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.constructionChecklist.toggle({
        id: undefined as any,
        isChecked: true,
      })
    ).rejects.toThrow();
  });

  it("deve rejeitar updateNotes sem id", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.constructionChecklist.updateNotes({
        id: undefined as any,
        notes: "test",
      })
    ).rejects.toThrow();
  });

  it("deve rejeitar initialize sem constructionId", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.constructionChecklist.initialize({
        constructionId: undefined as any,
      })
    ).rejects.toThrow();
  });
});

describe("Suprimentos - Controle de Acesso", () => {
  it("usuário anônimo não pode listar categorias", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.supplies2.categories()).rejects.toThrow();
  });

  it("usuário anônimo não pode listar itens de obra", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.constructionSupplies.list({ constructionId: 1 })
    ).rejects.toThrow();
  });

  it("usuário anônimo não pode acessar checklist", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.constructionChecklist.get({ constructionId: 1 })
    ).rejects.toThrow();
  });

  it("operador autenticado pode listar categorias", async () => {
    const ctx = createTestContext("operador");
    const caller = appRouter.createCaller(ctx);
    // Should not throw UNAUTHORIZED - may throw DB error in test env
    try {
      await caller.supplies2.categories();
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("gerente autenticado pode listar categorias", async () => {
    const ctx = createTestContext("gerente");
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.supplies2.categories();
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });
});

describe("Suprimentos - Funcionalidade com DB", () => {
  it("deve listar 12 categorias de suprimentos", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const categories = await caller.supplies2.categories();
      expect(categories).toHaveLength(12);
      expect(categories[0]).toHaveProperty("code");
      expect(categories[0]).toHaveProperty("name");
    } catch (e: any) {
      // DB may not be available in test env - skip gracefully
      if (e.message?.includes("connect") || e.message?.includes("ECONNREFUSED")) {
        return;
      }
      throw e;
    }
  });

  it("deve listar itens por categoria", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const items = await caller.supplies2.itemsByCategory({ categoryId: 1 });
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toHaveProperty("name");
    } catch (e: any) {
      if (e.message?.includes("connect") || e.message?.includes("ECONNREFUSED")) {
        return;
      }
      throw e;
    }
  });

  it("deve buscar categorias por nome", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const results = await caller.supplies2.searchCategories({ query: "Pintura" });
      expect(Array.isArray(results)).toBe(true);
    } catch (e: any) {
      if (e.message?.includes("connect") || e.message?.includes("ECONNREFUSED")) {
        return;
      }
      throw e;
    }
  });

  it("deve buscar itens por nome", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const results = await caller.supplies2.searchItems({ query: "Concreto" });
      expect(Array.isArray(results)).toBe(true);
    } catch (e: any) {
      if (e.message?.includes("connect") || e.message?.includes("ECONNREFUSED")) {
        return;
      }
      throw e;
    }
  });

  it("deve retornar checklist vazio para obra inexistente", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const checklist = await caller.constructionChecklist.get({ constructionId: 99999 });
      expect(Array.isArray(checklist)).toBe(true);
      expect(checklist).toHaveLength(0);
    } catch (e: any) {
      if (e.message?.includes("connect") || e.message?.includes("ECONNREFUSED")) {
        return;
      }
      throw e;
    }
  });
});
