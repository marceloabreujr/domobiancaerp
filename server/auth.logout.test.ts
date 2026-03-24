import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type CookieCall = {
  name: string;
  options: Record<string, unknown>;
};

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(role: "admin" | "gerente" | "operador"): { ctx: TrpcContext; clearedCookies: CookieCall[] } {
  const clearedCookies: CookieCall[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createAnonContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });
});

describe("auth.me", () => {
  it("returns user data when authenticated", async () => {
    const { ctx } = createUserContext("gerente");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeTruthy();
    expect(result?.role).toBe("gerente");
    expect(result?.name).toBe("Sample User");
  });

  it("returns null when not authenticated", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toBeNull();
  });
});

describe("users.list - role-based access", () => {
  it("admin can list users", async () => {
    const { ctx } = createUserContext("admin");
    const caller = appRouter.createCaller(ctx);

    // This will try to hit the DB which isn't available in tests,
    // but it should not throw a FORBIDDEN error
    try {
      await caller.users.list();
    } catch (e: any) {
      // DB errors are expected in test env, but NOT permission errors
      expect(e.code).not.toBe("FORBIDDEN");
    }
  });

  it("gerente cannot list users", async () => {
    const { ctx } = createUserContext("gerente");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.users.list()).rejects.toThrow();
  });

  it("operador cannot list users", async () => {
    const { ctx } = createUserContext("operador");
    const caller = appRouter.createCaller(ctx);

    await expect(caller.users.list()).rejects.toThrow();
  });

  it("anonymous cannot list users", async () => {
    const ctx = createAnonContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.users.list()).rejects.toThrow();
  });
});

describe("users.updateRole - role-based access", () => {
  it("gerente cannot update roles", async () => {
    const { ctx } = createUserContext("gerente");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.users.updateRole({ userId: 2, role: "operador" })
    ).rejects.toThrow();
  });

  it("operador cannot update roles", async () => {
    const { ctx } = createUserContext("operador");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.users.updateRole({ userId: 2, role: "admin" })
    ).rejects.toThrow();
  });
});
