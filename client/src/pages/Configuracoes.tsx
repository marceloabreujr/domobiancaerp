import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Shield, Users } from "lucide-react";
import { toast } from "sonner";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  operador: "Operador",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500/10 text-red-600",
  gerente: "bg-amber-500/10 text-amber-600",
  operador: "bg-blue-500/10 text-blue-600",
};

export default function Configuracoes() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Acesso restrito
          </h1>
          <p className="text-muted-foreground max-w-md">
            Apenas administradores podem acessar as configurações do sistema.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie usuários e permissões do sistema.
          </p>
        </div>

        <UserManagement currentUserId={user.id} />
      </div>
    </DashboardLayout>
  );
}

function UserManagement({ currentUserId }: { currentUserId: number }) {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.users.list.useQuery();
  const updateRole = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      utils.users.list.invalidate();
      toast.success("Permissão atualizada com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao atualizar permissão.");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p>Nenhum usuário cadastrado.</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="bg-muted/40 px-5 py-3 border-b border-border">
        <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Users className="h-4 w-4" />
          Usuários ({users.length})
        </h2>
      </div>
      <div className="divide-y divide-border">
        {users.map((u) => {
          const isSelf = u.id === currentUserId;
          return (
            <div
              key={u.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors"
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="text-xs font-medium">
                  {u.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">
                  {u.name || "Sem nome"}
                  {isSelf && (
                    <span className="text-xs text-muted-foreground ml-2">(você)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {u.email || "—"}
                </p>
              </div>
              <div className="shrink-0">
                {isSelf ? (
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role]}`}
                  >
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
                    <SelectTrigger className="w-[150px] h-8 text-xs">
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
