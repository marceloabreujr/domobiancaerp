import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// Login desativado: toda requisição usa um usuário administrador padrão.
const DEFAULT_USER: User = {
  id: 1,
  openId: "no-auth-admin",
  username: "admin",
  passwordHash: null,
  plainPassword: null,
  name: "Administrador",
  email: null,
  loginMethod: "none",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  return {
    req: opts.req,
    res: opts.res,
    user: DEFAULT_USER,
  };
}
