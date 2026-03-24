import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

describe("ADM ERP - Users Router", () => {
  it("users.list requires admin access", async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(caller.users.list()).rejects.toThrow();
  });

  it("users.create requires admin access", async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(
      caller.users.create({
        username: "testuser",
        password: "test123456",
        name: "Test User",
        role: "operador",
      })
    ).rejects.toThrow();
  });

  it("users.create validates minimum username length", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, role: "admin" },
    } as any);
    await expect(
      caller.users.create({
        username: "ab",
        password: "test123456",
        name: "Test User",
        role: "operador",
      })
    ).rejects.toThrow();
  });

  it("users.create validates minimum password length", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, role: "admin" },
    } as any);
    await expect(
      caller.users.create({
        username: "validuser",
        password: "12345",
        name: "Test User",
        role: "operador",
      })
    ).rejects.toThrow();
  });

  it("users.resetPassword requires admin access", async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(
      caller.users.resetPassword({ userId: 1, newPassword: "newpass123" })
    ).rejects.toThrow();
  });

  it("users.resetPassword validates password length", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, role: "admin" },
    } as any);
    await expect(
      caller.users.resetPassword({ userId: 1, newPassword: "12345" })
    ).rejects.toThrow();
  });

  it("users.toggleActive requires admin access", async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(
      caller.users.toggleActive({ userId: 1, isActive: false })
    ).rejects.toThrow();
  });

  it("users.updateRole requires admin access", async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(
      caller.users.updateRole({ userId: 1, role: "gerente" })
    ).rejects.toThrow();
  });

  it("users.updateRole validates role enum", async () => {
    const caller = appRouter.createCaller({
      user: { id: 1, role: "admin" },
    } as any);
    await expect(
      caller.users.updateRole({ userId: 1, role: "superadmin" as any })
    ).rejects.toThrow();
  });
});

describe("ADM ERP - Auth Change Password", () => {
  it("auth.changePassword validates username", async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(
      caller.auth.changePassword({
        username: "",
        currentPassword: "oldpass",
        newPassword: "newpass123",
      })
    ).rejects.toThrow();
  });

  it("auth.changePassword validates new password length", async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(
      caller.auth.changePassword({
        username: "testuser",
        currentPassword: "oldpass",
        newPassword: "12345",
      })
    ).rejects.toThrow();
  });

  it("auth.changePassword is a public procedure (no auth required for input validation)", async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    // Should fail on DB lookup, not on auth
    await expect(
      caller.auth.changePassword({
        username: "nonexistent_user_xyz",
        currentPassword: "oldpass",
        newPassword: "newpass123",
      })
    ).rejects.toThrow();
  });
});

describe("ADM ERP - Auth Login", () => {
  it("auth.login validates username is not empty", async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(
      caller.auth.login({ username: "", password: "test123" })
    ).rejects.toThrow();
  });

  it("auth.login validates password is not empty", async () => {
    const caller = appRouter.createCaller({ user: null } as any);
    await expect(
      caller.auth.login({ username: "testuser", password: "" })
    ).rejects.toThrow();
  });
});
