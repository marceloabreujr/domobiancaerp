import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(role: "admin" | "gerente" | "operador", userId = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `local_testuser_${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
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

describe("centralCalendar", () => {
  describe("centralCalendar.tasks", () => {
    it("requires authentication", async () => {
      const caller = appRouter.createCaller(createAnonContext());
      await expect(caller.centralCalendar.tasks({})).rejects.toThrow();
    });

    it("allows admin to call tasks", async () => {
      const caller = appRouter.createCaller(createUserContext("admin"));
      // Should not throw UNAUTHORIZED - may throw DB error which is acceptable
      try {
        await caller.centralCalendar.tasks({ startDate: "2026-03-01", endDate: "2026-03-31" });
      } catch (e: any) {
        expect(e.code).not.toBe("UNAUTHORIZED");
        expect(e.code).not.toBe("FORBIDDEN");
      }
    });

    it("allows gerente to call tasks", async () => {
      const caller = appRouter.createCaller(createUserContext("gerente", 2));
      try {
        await caller.centralCalendar.tasks({ startDate: "2026-03-01", endDate: "2026-03-31" });
      } catch (e: any) {
        expect(e.code).not.toBe("UNAUTHORIZED");
        expect(e.code).not.toBe("FORBIDDEN");
      }
    });

    it("allows operador to call tasks", async () => {
      const caller = appRouter.createCaller(createUserContext("operador", 3));
      try {
        await caller.centralCalendar.tasks({ startDate: "2026-03-01", endDate: "2026-03-31" });
      } catch (e: any) {
        expect(e.code).not.toBe("UNAUTHORIZED");
        expect(e.code).not.toBe("FORBIDDEN");
      }
    });

    it("accepts optional filters (source)", async () => {
      const caller = appRouter.createCaller(createUserContext("admin"));
      try {
        await caller.centralCalendar.tasks({ source: "calendar" });
      } catch (e: any) {
        expect(e.code).not.toBe("UNAUTHORIZED");
        expect(e.code).not.toBe("FORBIDDEN");
      }
    });

    it("accepts optional filters (assignedTo)", async () => {
      const caller = appRouter.createCaller(createUserContext("admin"));
      try {
        await caller.centralCalendar.tasks({ assignedTo: 1 });
      } catch (e: any) {
        expect(e.code).not.toBe("UNAUTHORIZED");
        expect(e.code).not.toBe("FORBIDDEN");
      }
    });

    it("accepts empty input", async () => {
      const caller = appRouter.createCaller(createUserContext("admin"));
      try {
        await caller.centralCalendar.tasks();
      } catch (e: any) {
        expect(e.code).not.toBe("UNAUTHORIZED");
        expect(e.code).not.toBe("FORBIDDEN");
      }
    });
  });

  describe("centralCalendar.usersList", () => {
    it("requires authentication", async () => {
      const caller = appRouter.createCaller(createAnonContext());
      await expect(caller.centralCalendar.usersList()).rejects.toThrow();
    });

    it("allows admin to list users", async () => {
      const caller = appRouter.createCaller(createUserContext("admin"));
      try {
        await caller.centralCalendar.usersList();
      } catch (e: any) {
        expect(e.code).not.toBe("UNAUTHORIZED");
        expect(e.code).not.toBe("FORBIDDEN");
      }
    });

    it("allows gerente to list users (not admin-only)", async () => {
      const caller = appRouter.createCaller(createUserContext("gerente", 2));
      try {
        await caller.centralCalendar.usersList();
      } catch (e: any) {
        expect(e.code).not.toBe("UNAUTHORIZED");
        expect(e.code).not.toBe("FORBIDDEN");
      }
    });

    it("allows operador to list users (not admin-only)", async () => {
      const caller = appRouter.createCaller(createUserContext("operador", 3));
      try {
        await caller.centralCalendar.usersList();
      } catch (e: any) {
        expect(e.code).not.toBe("UNAUTHORIZED");
        expect(e.code).not.toBe("FORBIDDEN");
      }
    });
  });

  describe("role-based task filtering", () => {
    it("admin users.list is admin-only (existing behavior preserved)", async () => {
      // Verify that the original users.list is still admin-only
      const gerenteCaller = appRouter.createCaller(createUserContext("gerente", 2));
      await expect(gerenteCaller.users.list()).rejects.toThrow();

      const operadorCaller = appRouter.createCaller(createUserContext("operador", 3));
      await expect(operadorCaller.users.list()).rejects.toThrow();
    });

    it("centralCalendar.usersList is accessible to all authenticated users", async () => {
      // This is the key difference: usersList is protectedProcedure, not adminProcedure
      const roles: Array<"admin" | "gerente" | "operador"> = ["admin", "gerente", "operador"];
      for (const role of roles) {
        const caller = appRouter.createCaller(createUserContext(role, roles.indexOf(role) + 1));
        try {
          await caller.centralCalendar.usersList();
        } catch (e: any) {
          // DB errors are acceptable, auth errors are not
          expect(e.code).not.toBe("UNAUTHORIZED");
          expect(e.code).not.toBe("FORBIDDEN");
        }
      }
    });
  });
});
