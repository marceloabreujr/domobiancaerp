import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  MapPin,
  Phone,
  RotateCcw,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type { RentKanbanCard } from "../../../server/db";

type Status = RentKanbanCard["status"];

const COLUMNS: {
  id: Status;
  label: string;
  header: string;
  body: string;
}[] = [
  {
    id: "a_vencer",
    label: "Boleto a Vencer",
    header: "border-sky-300 bg-sky-100/70 text-sky-800",
    body: "border-sky-200 bg-sky-50/40",
  },
  {
    id: "em_atraso",
    label: "Em Atraso",
    header: "border-red-300 bg-red-100/70 text-red-800",
    body: "border-red-200 bg-red-50/40",
  },
  {
    id: "em_dia",
    label: "Em Dia",
    header: "border-emerald-300 bg-emerald-100/70 text-emerald-800",
    body: "border-emerald-200 bg-emerald-50/40",
  },
];

function formatBRL(v: string | null) {
  if (!v) return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function sumColumn(cards: RentKanbanCard[]) {
  const total = cards.reduce((acc, c) => acc + (Number(c.rentAmount) || 0), 0);
  return total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function AlugueisKanban() {
  const kanban = trpc.alugueis.kanban.useQuery();
  const [expanded, setExpanded] = useState<number | null>(null);

  const markPaid = trpc.alugueis.markPaid.useMutation({
    onSuccess: () => {
      kanban.refetch();
      toast.success("Boleto marcado como pago.");
    },
    onError: (e) => toast.error(e.message),
  });
  const unmarkPaid = trpc.alugueis.unmarkPaid.useMutation({
    onSuccess: () => {
      kanban.refetch();
      toast.success("Pagamento desfeito.");
    },
    onError: (e) => toast.error(e.message),
  });

  const cards = kanban.data ?? [];
  const busy = markPaid.isPending || unmarkPaid.isPending;

  const renderCard = (card: RentKanbanCard) => {
    const isOpen = expanded === card.contractId;
    const overdue = card.status === "em_atraso";
    const paid = card.status === "em_dia";
    return (
      <div
        key={card.contractId}
        className="rounded-md border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
      >
        <button
          type="button"
          onClick={() => setExpanded(isOpen ? null : card.contractId)}
          className="flex w-full items-start gap-2 p-3 text-left"
        >
          {isOpen ? (
            <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-medium leading-tight">
              {card.propertyTitle}
            </h4>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarClock className="h-3 w-3" />
              <span>Vence {formatDate(card.dueDate)}</span>
            </div>
          </div>
          <span
            className={`shrink-0 text-sm font-semibold ${
              overdue ? "text-red-600" : paid ? "text-emerald-600" : "text-sky-700"
            }`}
          >
            {formatBRL(card.rentAmount)}
          </span>
        </button>

        {isOpen && (
          <div className="space-y-2 border-t border-border px-3 pb-3 pt-2 text-xs">
            {card.address && (
              <div className="flex items-start gap-1.5 text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{card.address}</span>
              </div>
            )}
            <div className="flex items-start gap-1.5 text-muted-foreground">
              <User className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Inquilino: <span className="font-medium text-foreground">{card.tenantName}</span>
                {card.occupantName && card.occupantName !== card.tenantName && (
                  <> · Ocupante: {card.occupantName}</>
                )}
              </span>
            </div>
            {card.tenantPhone && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>{card.tenantPhone}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-muted-foreground">Vencimento</span>
                <p className="font-medium">{formatDate(card.dueDate)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Dia de cobrança</span>
                <p className="font-medium">Todo dia {card.billingDay}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Início do contrato</span>
                <p className="font-medium">{formatDate(card.startDate)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Fim do contrato</span>
                <p className="font-medium">{formatDate(card.endDate)}</p>
              </div>
            </div>

            {paid ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mt-1 h-7 w-full text-xs"
                disabled={busy}
                onClick={() =>
                  unmarkPaid.mutate({
                    contractId: card.contractId,
                    year: card.year,
                    month: card.month,
                  })
                }
              >
                <RotateCcw className="mr-1 h-3.5 w-3.5" />
                Desfazer pagamento
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="mt-1 h-7 w-full text-xs"
                disabled={busy}
                onClick={() =>
                  markPaid.mutate({
                    contractId: card.contractId,
                    year: card.year,
                    month: card.month,
                  })
                }
              >
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                Marcar como pago
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (kanban.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhum contrato de locação ativo encontrado.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Os boletos aparecem aqui automaticamente a partir dos contratos ativos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {COLUMNS.map((col) => {
        const colCards = cards.filter((c) => c.status === col.id);
        return (
          <div key={col.id} className="flex flex-col">
            <div className={`rounded-t-lg border-x border-t px-3 py-2 ${col.header}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {col.label}
                </span>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium">
                  {colCards.length}
                </span>
              </div>
              <div className="mt-0.5 text-xs font-medium opacity-80">
                {sumColumn(colCards)}
              </div>
            </div>
            <div
              className={`flex-1 space-y-2 rounded-b-lg border p-2 ${col.body} min-h-[160px]`}
            >
              {colCards.map(renderCard)}
              {colCards.length === 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground/60">
                  Nenhum boleto
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
