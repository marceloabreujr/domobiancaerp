import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, BedDouble, Bath, Car, FileText, Plus, Upload, Download, Trash2, File } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";
import NovoContratoForm from "./NovoContratoForm";

const statusLabels: Record<string, string> = { disponivel_locacao: "Disponível Locação", disponivel_venda: "Disponível Venda", alugado: "Alugado", vendido: "Vendido", arquivado: "Arquivado" };
const typeLabels: Record<string, string> = { residencial: "Residencial", apartamento: "Apartamento", galpao: "Galpão", sala_comercial: "Sala Comercial", lote: "Lote", casa: "Casa", cobertura: "Cobertura", kitnet: "Kitnet", outro: "Outro" };
const leaseLabels: Record<string, string> = { quinzenal: "Quinzenal", mensal: "Mensal", trimestral: "Trimestral", semestral: "Semestral", anual: "Anual", "2_anos": "2 Anos", "3_anos": "3 Anos" };

function ContractPdfSection({ contract }: { contract: any }) {
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadMutation = trpc.rentalContracts.uploadContract.useMutation({
    onSuccess: () => {
      toast.success("Contrato PDF anexado com sucesso!");
      utils.rentalContracts.list.invalidate();
    },
    onError: (err) => toast.error("Erro ao enviar: " + err.message),
  });

  const removeMutation = trpc.rentalContracts.removeContractFile.useMutation({
    onSuccess: () => {
      toast.success("PDF removido.");
      utils.rentalContracts.list.invalidate();
    },
    onError: (err) => toast.error("Erro ao remover: " + err.message),
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são aceitos.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }
    setUploading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      await uploadMutation.mutateAsync({
        id: contract.id,
        fileData: base64,
        fileName: file.name,
        mimeType: file.type,
      });
    } catch {
      // error handled by mutation
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mt-2 pt-2 border-t border-border/50">
      <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelect} />
      {contract.contractFileUrl ? (
        <div className="flex items-center gap-2 bg-blue-50 rounded-md p-2">
          <File className="h-4 w-4 text-blue-600 shrink-0" />
          <span className="text-xs text-blue-700 font-medium truncate flex-1">{contract.contractFileName || "Contrato.pdf"}</span>
          <a href={contract.contractFileUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800">
              <Download className="h-3.5 w-3.5" />
            </Button>
          </a>
          <Button
            size="sm" variant="ghost"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            onClick={() => removeMutation.mutate({ id: contract.id })}
            disabled={removeMutation.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          size="sm" variant="outline"
          className="h-7 text-xs w-full"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
          {uploading ? "Enviando..." : "Anexar Contrato Assinado (PDF)"}
        </Button>
      )}
    </div>
  );
}

export default function PropertyDetailDialog({ propertyId, open, onClose }: { propertyId: number; open: boolean; onClose: () => void }) {
  const { data: property, isLoading } = trpc.properties.get.useQuery({ id: propertyId });
  const { data: contracts } = trpc.rentalContracts.list.useQuery({ propertyId });
  const { data: clients } = trpc.clients.list.useQuery();
  const [showNewContract, setShowNewContract] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        {isLoading || !property ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {property.title}
                {property.code && <span className="text-sm font-mono text-muted-foreground">({property.code})</span>}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Info básica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Tipo:</span> <span className="font-medium">{typeLabels[property.propertyType]}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <span className="font-medium">{statusLabels[property.status]}</span></div>
                <div><span className="text-muted-foreground">Posse:</span> <span className="font-medium">{property.ownership === "domobianca" ? "Domobianca" : "Terceiros"}</span></div>
                {property.area && <div><span className="text-muted-foreground">Área:</span> <span className="font-medium">{property.area}m²</span></div>}
              </div>

              {/* Endereço */}
              {(property.street || property.city) && (
                <div className="flex items-start gap-2 text-sm bg-muted/30 rounded-lg p-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{[property.street, property.number, property.complement, property.neighborhood, property.city, property.state, property.zipCode].filter(Boolean).join(", ")}</span>
                </div>
              )}

              {/* Características */}
              <div className="flex items-center gap-4 text-sm">
                {property.bedrooms && <span className="flex items-center gap-1"><BedDouble className="h-4 w-4 text-muted-foreground" />{property.bedrooms} quartos</span>}
                {property.suites && <span className="text-muted-foreground">({property.suites} suítes)</span>}
                {property.bathrooms && <span className="flex items-center gap-1"><Bath className="h-4 w-4 text-muted-foreground" />{property.bathrooms} banheiros</span>}
                {property.parkingSpots && <span className="flex items-center gap-1"><Car className="h-4 w-4 text-muted-foreground" />{property.parkingSpots} vagas</span>}
              </div>

              {/* Valores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-muted/30 rounded-lg p-3">
                {property.rentValue && <div className="text-sm"><span className="text-muted-foreground">Aluguel:</span> <span className="font-semibold">R$ {parseFloat(property.rentValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></div>}
                {property.saleValue && <div className="text-sm"><span className="text-muted-foreground">Venda:</span> <span className="font-semibold">R$ {parseFloat(property.saleValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></div>}
                {property.condoFee && <div className="text-sm"><span className="text-muted-foreground">Condomínio:</span> <span className="font-medium">R$ {parseFloat(property.condoFee).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></div>}
                {property.iptuValue && <div className="text-sm"><span className="text-muted-foreground">IPTU:</span> <span className="font-medium">R$ {parseFloat(property.iptuValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span></div>}
                {property.adminFeePercent && <div className="text-sm"><span className="text-muted-foreground">Taxa Admin:</span> <span className="font-medium">{property.adminFeePercent}%</span></div>}
                {property.saleCommissionPercent && <div className="text-sm"><span className="text-muted-foreground">Comissão Venda:</span> <span className="font-medium">{property.saleCommissionPercent}%</span></div>}
              </div>

              {property.description && <p className="text-sm text-muted-foreground">{property.description}</p>}

              {/* Contratos */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm flex items-center gap-1.5"><FileText className="h-4 w-4" />Contratos de Locação</h3>
                  <Button size="sm" variant="outline" className="h-7" onClick={() => setShowNewContract(!showNewContract)}>
                    <Plus className="h-3.5 w-3.5 mr-1" />{showNewContract ? "Cancelar" : "Novo Contrato"}
                  </Button>
                </div>

                {showNewContract && (
                  <div className="mb-4 border border-border rounded-lg p-4 bg-muted/10">
                    <NovoContratoForm propertyId={propertyId} clients={clients ?? []} onSuccess={() => setShowNewContract(false)} />
                  </div>
                )}

                {contracts && contracts.length > 0 ? (
                  <div className="space-y-2">
                    {contracts.map((c) => {
                      const tenant = clients?.find(cl => cl.id === c.tenantId);
                      return (
                        <div key={c.id} className="border border-border rounded-lg p-3 text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{tenant?.name || `Inquilino #${c.tenantId}`}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === "ativo" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{c.status}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
                            <span>Aluguel: R$ {parseFloat(c.rentAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                            <span>Prazo: {leaseLabels[c.leaseTerm] || c.leaseTerm}</span>
                            <span>Início: {c.startDate ? new Date(c.startDate).toLocaleDateString("pt-BR") : "-"}</span>
                            <span>Reajuste: {c.adjustmentIndex?.toUpperCase()}</span>
                            {c.adjustmentValue && <span>Valor Reajuste: R$ {parseFloat(c.adjustmentValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                            {c.nextAdjustmentDate && <span>Próx. Reajuste: {new Date(c.nextAdjustmentDate).toLocaleDateString("pt-BR")}</span>}
                            {c.isPackage && c.packageTotal && <span className="col-span-2">Pacote: R$ {parseFloat(c.packageTotal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>}
                          </div>
                          {/* Seção de PDF do contrato assinado */}
                          <ContractPdfSection contract={c} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhum contrato cadastrado.</p>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
