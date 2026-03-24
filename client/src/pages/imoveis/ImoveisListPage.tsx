import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, BedDouble, Bath, Car, Ruler, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PropertyDetailDialog from "./PropertyDetailDialog";

const statusLabels: Record<string, string> = { disponivel: "Disponível", alugado: "Alugado", a_venda: "À Venda", vendido: "Vendido", arquivado: "Arquivado" };
const statusColors: Record<string, string> = { disponivel: "bg-emerald-100 text-emerald-700", alugado: "bg-blue-100 text-blue-700", a_venda: "bg-amber-100 text-amber-700", vendido: "bg-purple-100 text-purple-700", arquivado: "bg-gray-100 text-gray-600" };
const typeLabels: Record<string, string> = { residencial: "Residencial", apartamento: "Apartamento", galpao: "Galpão", sala_comercial: "Sala Comercial", lote: "Lote", casa: "Casa", cobertura: "Cobertura", kitnet: "Kitnet", outro: "Outro" };

export default function ImoveisListPage({ statusFilter }: { statusFilter?: string }) {
  const [ownershipFilter, setOwnershipFilter] = useState<string>("todos");
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data: allProperties, isLoading } = trpc.properties.list.useQuery(
    statusFilter ? { status: statusFilter } : undefined
  );

  const deleteMutation = trpc.properties.delete.useMutation({
    onSuccess: () => { utils.properties.list.invalidate(); toast.success("Imóvel excluído."); },
  });

  const properties = allProperties?.filter(p =>
    ownershipFilter === "todos" ? true : p.ownership === ownershipFilter
  ) ?? [];

  const title = statusFilter ? statusLabels[statusFilter] || "Imóveis" : "Todos os Imóveis";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtrar:</span>
          <Select value={ownershipFilter} onValueChange={setOwnershipFilter}>
            <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="domobianca">Domobianca</SelectItem>
              <SelectItem value="terceiros">Terceiros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum imóvel encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => (
            <div
              key={p.id}
              className="border border-border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer bg-card"
              onClick={() => setSelectedPropertyId(p.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {p.code && <span className="text-xs font-mono text-muted-foreground">{p.code}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[p.status] || "bg-gray-100"}`}>
                      {statusLabels[p.status] || p.status}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{p.title}</h3>
                  <p className="text-xs text-muted-foreground">{typeLabels[p.propertyType] || p.propertyType} &middot; {p.ownership === "domobianca" ? "Domobianca" : "Terceiros"}</p>
                </div>
              </div>

              {(p.street || p.neighborhood || p.city) && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {[p.street, p.number, p.neighborhood, p.city].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                {p.area && <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{p.area}m²</span>}
                {p.bedrooms && <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{p.bedrooms}q</span>}
                {p.bathrooms && <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{p.bathrooms}b</span>}
                {p.parkingSpots && <span className="flex items-center gap-1"><Car className="h-3.5 w-3.5" />{p.parkingSpots}v</span>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  {p.rentValue && <p className="text-sm font-semibold text-foreground">R$ {parseFloat(p.rentValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}<span className="text-xs font-normal text-muted-foreground">/mês</span></p>}
                  {p.saleValue && <p className="text-sm font-semibold text-foreground">R$ {parseFloat(p.saleValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-destructive hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); if (confirm("Excluir este imóvel?")) deleteMutation.mutate({ id: p.id }); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPropertyId && (
        <PropertyDetailDialog
          propertyId={selectedPropertyId}
          open={!!selectedPropertyId}
          onClose={() => setSelectedPropertyId(null)}
        />
      )}
    </div>
  );
}
