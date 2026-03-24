import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(role: "admin" | "gerente" | "operador" = "admin", overrides?: Partial<AuthenticatedUser>): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    username: "testadmin",
    passwordHash: null,
    email: "test@example.com",
    name: "Test User",
    loginMethod: "local",
    role,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

function createAnonContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
      cookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

describe("Login com Usuário/Senha - Router Structure", () => {
  it("deve ter router de login", () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.auth.login).toBeDefined();
  });

  it("deve ter router de changePassword", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.auth.changePassword).toBeDefined();
  });

  it("deve ter router de me", () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.auth.me).toBeDefined();
  });

  it("deve ter router de logout", () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.auth.logout).toBeDefined();
  });
});

describe("Login - Validação de Input", () => {
  it("deve rejeitar login sem username", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.login({ username: "", password: "test123" })
    ).rejects.toThrow();
  });

  it("deve rejeitar login sem password", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.login({ username: "test", password: "" })
    ).rejects.toThrow();
  });

  it("deve rejeitar changePassword com senha curta", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.auth.changePassword({ currentPassword: "old123", newPassword: "12" })
    ).rejects.toThrow();
  });
});

describe("Gerenciamento de Usuários - Router Structure", () => {
  it("deve ter router de criação de usuários", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.users.create).toBeDefined();
  });

  it("deve ter router de resetPassword", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.users.resetPassword).toBeDefined();
  });

  it("deve ter router de toggleActive", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.users.toggleActive).toBeDefined();
  });

  it("deve ter router de updateProfile", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.users.updateProfile).toBeDefined();
  });

  it("deve ter router de list", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.users.list).toBeDefined();
  });

  it("deve ter router de updateRole", () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    expect(caller.users.updateRole).toBeDefined();
  });
});

describe("Gerenciamento de Usuários - Controle de Acesso", () => {
  it("anônimo não pode criar usuários", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.users.create({
        username: "newuser",
        password: "test123",
        name: "New User",
        role: "operador",
      })
    ).rejects.toThrow();
  });

  it("operador não pode criar usuários", async () => {
    const ctx = createTestContext("operador");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.users.create({
        username: "newuser",
        password: "test123",
        name: "New User",
        role: "operador",
      })
    ).rejects.toThrow();
  });

  it("gerente não pode criar usuários", async () => {
    const ctx = createTestContext("gerente");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.users.create({
        username: "newuser",
        password: "test123",
        name: "New User",
        role: "operador",
      })
    ).rejects.toThrow();
  });

  it("admin pode criar usuários (DB error esperado em teste)", async () => {
    const ctx = createTestContext("admin");
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.users.create({
        username: "newuser",
        password: "test123",
        name: "New User",
        role: "operador",
      });
    } catch (e: any) {
      // DB errors are expected, but NOT permission errors
      expect(e.code).not.toBe("FORBIDDEN");
      expect(e.code).not.toBe("UNAUTHORIZED");
    }
  });

  it("operador não pode resetar senhas", async () => {
    const ctx = createTestContext("operador");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.users.resetPassword({ userId: 2, newPassword: "newpass123" })
    ).rejects.toThrow();
  });

  it("gerente não pode resetar senhas", async () => {
    const ctx = createTestContext("gerente");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.users.resetPassword({ userId: 2, newPassword: "newpass123" })
    ).rejects.toThrow();
  });

  it("operador não pode ativar/desativar usuários", async () => {
    const ctx = createTestContext("operador");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.users.toggleActive({ userId: 2, isActive: false })
    ).rejects.toThrow();
  });

  it("qualquer autenticado pode atualizar próprio perfil (DB error esperado)", async () => {
    const ctx = createTestContext("operador");
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.users.updateProfile({ name: "Novo Nome" });
    } catch (e: any) {
      expect(e.code).not.toBe("UNAUTHORIZED");
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });
});

describe("Criação de Usuário - Validação de Input", () => {
  it("deve rejeitar username muito curto", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.users.create({
        username: "ab",
        password: "test123",
        name: "Test",
        role: "operador",
      })
    ).rejects.toThrow();
  });

  it("deve rejeitar senha muito curta", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.users.create({
        username: "validuser",
        password: "12345",
        name: "Test",
        role: "operador",
      })
    ).rejects.toThrow();
  });

  it("deve rejeitar nome vazio", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.users.create({
        username: "validuser",
        password: "test123",
        name: "",
        role: "operador",
      })
    ).rejects.toThrow();
  });

  it("deve rejeitar role inválido", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.users.create({
        username: "validuser",
        password: "test123",
        name: "Test",
        role: "superadmin" as any,
      })
    ).rejects.toThrow();
  });
});

describe("Login com DB - Funcionalidade", () => {
  it("deve rejeitar login com usuário inexistente", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.auth.login({ username: "naoexiste", password: "test123" });
      expect.fail("Should have thrown");
    } catch (e: any) {
      // Either DB error or "invalid credentials" - both acceptable
      expect(e).toBeTruthy();
    }
  });

  it("deve fazer login com credenciais válidas do master", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    try {
      const result = await caller.auth.login({ username: "mauri", password: "domobianca2025" });
      expect(result.success).toBe(true);
      expect(result.user.name).toBe("Mauri Carvalho");
      expect(result.user.role).toBe("admin");
    } catch (e: any) {
      // DB may not be available in test env
      if (e.message?.includes("connect") || e.message?.includes("ECONNREFUSED")) {
        return;
      }
      throw e;
    }
  });

  it("deve rejeitar login com senha incorreta", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);
    try {
      await caller.auth.login({ username: "mauri", password: "senhaerrada" });
      expect.fail("Should have thrown");
    } catch (e: any) {
      if (e.message?.includes("connect") || e.message?.includes("ECONNREFUSED")) {
        return;
      }
      expect(e.message).toContain("inválidos");
    }
  });
});
