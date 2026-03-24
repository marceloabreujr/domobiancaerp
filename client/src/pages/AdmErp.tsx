import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  Eye,
  EyeOff,
  Key,
  Loader2,
  Plus,
  Power,
  PowerOff,
  Shield,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  operador: "Operador",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/10 text-red-600 border-red-200",
  gerente: "bg-amber-500/10 text-amber-600 border-amber-200",
  operador: "bg-blue-500/10 text-blue-600 border-blue-200",
};

export default function AdmErp() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
            Acesso restrito
          </h1>
          <p className="text-muted-foreground max-w-md">
            Apenas o administrador master pode acessar o ADM ERP.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">ADM ERP</h1>
              <p className="text-muted-foreground text-sm">
                Painel de administração master — gerenciar usuários, permissões e senhas.
              </p>
            </div>
          </div>
        </div>

        <UserManagement currentUserId={user.id} />
      </div>
    </DashboardLayout>
  );
}

function UserManagement({ currentUserId }: { currentUserId: number }) {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.users.list.useQuery();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ userId: number; name: string } | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());

  const updateRole = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("Permissão atualizada com sucesso.");
    },
    onError: () => toast.error("Erro ao atualizar permissão."),
  });

  const toggleActive = trpc.users.toggleActive.useMutation({
    onSuccess: (_, vars) => {
      utils.users.list.invalidate();
      toast.success(vars.isActive ? "Usuário ativado." : "Usuário desativado.");
    },
    onError: () => toast.error("Erro ao alterar status do usuário."),
  });

  const togglePasswordVisibility = (userId: number) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const totalUsers = users?.length ?? 0;
  const activeUsers = users?.filter(u => u.isActive).length ?? 0;
  const adminCount = users?.filter(u => u.role === "admin").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold">{totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total de Usuários</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Power className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold">{activeUsers}</p>
              <p className="text-xs text-muted-foreground">Usuários Ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold">{adminCount}</p>
              <p className="text-xs text-muted-foreground">Administradores</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-medium">
            Gerenciamento de Usuários
          </h2>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <CreateUserForm
              onSuccess={() => {
                setCreateDialogOpen(false);
                utils.users.list.invalidate();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      {!users || users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Nenhum usuário cadastrado.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Clique em "Novo Usuário" para criar o primeiro acesso.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
        {/* Mobile: Cards */}
        <div className="space-y-3 md:hidden">
          {users.map((u) => {
            const isSelf = u.id === currentUserId;
            const isPasswordVisible = visiblePasswords.has(u.id);
            return (
              <Card key={u.id} className={`${!u.isActive ? "opacity-50" : ""}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                        {u.name?.charAt(0).toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">
                        {u.name || "Sem nome"}
                        {isSelf && <span className="text-xs text-muted-foreground ml-1">(você)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">@{u.username || "—"}</p>
                    </div>
                    {u.isActive ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs shrink-0">Ativo</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-xs shrink-0">Inativo</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Senha:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                      {isPasswordVisible ? ((u as any).plainPassword || "•••") : "••••••••"}
                    </code>
                    <button onClick={() => togglePasswordVisibility(u.id)} className="text-muted-foreground hover:text-foreground">
                      {isPasswordVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      {isSelf ? (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                      ) : (
                        <Select value={u.role} onValueChange={(value) => updateRole.mutate({ userId: u.id, role: value as "admin" | "gerente" | "operador" })}>
                          <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="gerente">Gerente</SelectItem>
                            <SelectItem value="operador">Operador</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    {!isSelf && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => setResetPasswordDialog({ userId: u.id, name: u.name || "Usuário" })}>
                          <Key className="h-3.5 w-3.5" /> Resetar
                        </Button>
                        <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${u.isActive ? "text-emerald-600 hover:text-red-600" : "text-slate-400 hover:text-emerald-600"}`} onClick={() => toggleActive.mutate({ userId: u.id, isActive: !u.isActive })} title={u.isActive ? "Desativar" : "Ativar"}>
                          {u.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Desktop: Table */}
        <div className="border border-border rounded-xl overflow-hidden bg-card hidden md:block">
          <div className="bg-muted/40 px-5 py-3 border-b border-border grid grid-cols-[auto_1fr_100px_140px_180px_100px_70px] gap-4 items-center">
            <div className="w-9" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome / Usuário</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Permissão</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Senha</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ativo</span>
          </div>
          <div className="divide-y divide-border">
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              const isPasswordVisible = visiblePasswords.has(u.id);
              return (
                <div
                  key={u.id}
                  className={`grid grid-cols-[auto_1fr_100px_140px_180px_100px_70px] gap-4 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors ${!u.isActive ? "opacity-50" : ""}`}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                      {u.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-foreground">
                      {u.name || "Sem nome"}
                      {isSelf && (
                        <span className="text-xs text-muted-foreground ml-2">(você)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{u.username || "—"}
                    </p>
                  </div>

                  <div>
                    {u.isActive ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 text-xs">
                        Inativo
                      </Badge>
                    )}
                  </div>

                  <div>
                    {isSelf ? (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role]}`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    ) : (
                      <Select
                        value={u.role}
                        onValueChange={(value) => {
                          updateRole.mutate({
                            userId: u.id,
                            role: value as "admin" | "gerente" | "operador",
                          });
                        }}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="gerente">Gerente</SelectItem>
                          <SelectItem value="operador">Operador</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Senha visível */}
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono min-w-[80px]">
                      {isPasswordVisible ? ((u as any).plainPassword || "•••") : "••••••••"}
                    </code>
                    <button
                      onClick={() => togglePasswordVisibility(u.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title={isPasswordVisible ? "Ocultar senha" : "Ver senha"}
                    >
                      {isPasswordVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <div>
                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={() => setResetPasswordDialog({ userId: u.id, name: u.name || "Usuário" })}
                      >
                        <Key className="h-3.5 w-3.5" />
                        Resetar
                      </Button>
                    )}
                  </div>

                  <div>
                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 ${u.isActive ? "text-emerald-600 hover:text-red-600" : "text-slate-400 hover:text-emerald-600"}`}
                        onClick={() => toggleActive.mutate({ userId: u.id, isActive: !u.isActive })}
                        title={u.isActive ? "Desativar usuário" : "Ativar usuário"}
                      >
                        {u.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        </>
      )}

      {/* Reset Password Dialog */}
      {resetPasswordDialog && (
        <ResetPasswordDialog
          userId={resetPasswordDialog.userId}
          userName={resetPasswordDialog.name}
          open={!!resetPasswordDialog}
          onOpenChange={(open) => !open && setResetPasswordDialog(null)}
        />
      )}
    </div>
  );
}

function CreateUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "gerente" | "operador">("operador");
  const [showPassword, setShowPassword] = useState(false);

  const createUser = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar usuário.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !name.trim()) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    createUser.mutate({
      username: username.trim(),
      password,
      name: name.trim(),
      email: email.trim() || undefined,
      role,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Novo Usuário
        </DialogTitle>
        <DialogDescription>
          Crie um novo acesso ao sistema. O usuário poderá fazer login com as credenciais definidas.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <div className="space-y-2">
          <Label htmlFor="create-name">Nome completo *</Label>
          <Input
            id="create-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: João Silva"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="create-username">Nome de usuário *</Label>
          <Input
            id="create-username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
            placeholder="Ex: joao.silva"
            required
          />
          <p className="text-xs text-muted-foreground">Apenas letras minúsculas, números, pontos e hifens.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="create-password">Senha *</Label>
          <div className="relative">
            <Input
              id="create-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="create-email">E-mail (opcional)</Label>
          <Input
            id="create-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex: joao@domobianca.com"
          />
        </div>

        <div className="space-y-2">
          <Label>Nível de Acesso</Label>
          <Select value={role} onValueChange={(v) => setRole(v as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">
                <div className="flex flex-col">
                  <span className="font-medium">Administrador</span>
                  <span className="text-xs text-muted-foreground">Acesso total ao sistema</span>
                </div>
              </SelectItem>
              <SelectItem value="gerente">
                <div className="flex flex-col">
                  <span className="font-medium">Gerente</span>
                  <span className="text-xs text-muted-foreground">Relatórios e aprovações</span>
                </div>
              </SelectItem>
              <SelectItem value="operador">
                <div className="flex flex-col">
                  <span className="font-medium">Operador</span>
                  <span className="text-xs text-muted-foreground">Lançamentos e consultas</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="pt-2">
          <Button type="submit" disabled={createUser.isPending} className="w-full gap-2">
            {createUser.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Criar Usuário
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function ResetPasswordDialog({
  userId,
  userName,
  open,
  onOpenChange,
}: {
  userId: number;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const utils = trpc.useUtils();
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const resetPassword = trpc.users.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Senha resetada com sucesso!");
      utils.users.list.invalidate();
      onOpenChange(false);
      setNewPassword("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao resetar senha.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    resetPassword.mutate({ userId, newPassword });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Resetar Senha
          </DialogTitle>
          <DialogDescription>
            Defina uma nova senha para <strong>{userName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="reset-password">Nova Senha</Label>
            <div className="relative">
              <Input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                autoFocus
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={resetPassword.isPending} className="gap-2">
              {resetPassword.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Nova Senha"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
