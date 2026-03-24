import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Briefcase,
  Building2,
  ClipboardList,
  HardHat,
  Wallet,
} from "lucide-react";
import { useLocation } from "wouter";

const modules = [
  {
    icon: Wallet,
    label: "Financeiro",
    description: "Contas, fluxo de caixa e DRE",
    path: "/financeiro",
    color: "bg-emerald-500/10 text-emerald-600",
  },
  {
    icon: ClipboardList,
    label: "Administrativo",
    description: "Documentos, contratos e equipe",
    path: "/administrativo",
    color: "bg-blue-500/10 text-blue-600",
  },
  {
    icon: HardHat,
    label: "Obras",
    description: "Cadastro, tarefas e relatórios",
    path: "/obras",
    color: "bg-amber-500/10 text-amber-600",
  },
  {
    icon: Building2,
    label: "Imóveis",
    description: "Imóveis, contratos e locatários",
    path: "/imoveis",
    color: "bg-violet-500/10 text-violet-600",
  },
  {
    icon: Briefcase,
    label: "Novas Oportunidades",
    description: "Pipeline, clientes e captadores",
    path: "/negocios",
    color: "bg-pink-500/10 text-pink-600",
  },
];

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const firstName = user?.name?.split(" ")[0] ?? "Usuário";

  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Olá, {firstName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo ao Domobianca ERP. Selecione um módulo para começar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <button
              key={mod.path}
              onClick={() => setLocation(mod.path)}
              className="group flex flex-col items-start gap-3 p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all text-left"
            >
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${mod.color}`}
              >
                <mod.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                  {mod.label}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {mod.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
