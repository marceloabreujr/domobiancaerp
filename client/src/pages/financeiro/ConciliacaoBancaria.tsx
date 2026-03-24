import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Upload, FileSpreadsheet, Check, X, Eye, Link2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR");
}

const STATUS_COLORS: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800",
  conciliado: "bg-emerald-100 text-emerald-800",
  ignorado: "bg-gray-100 text-gray-800",
  manual: "bg-blue-100 text-blue-800",
};

const IMPORT_STATUS_COLORS: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800",
  parcial: "bg-blue-100 text-blue-800",
  concluido: "bg-emerald-100 text-emerald-800",
};

export default function ConciliacaoBancaria() {
  const [selectedImportId, setSelectedImportId] = useState<number | null>(null);
  const [showCandidates, setShowCandidates] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: imports, isLoading: loadingImports } = trpc.financial.bank.imports.list.useQuery();
  const { data: transactions, isLoading: loadingTx } = trpc.financial.bank.transactions.list.useQuery(
    { bankImportId: selectedImportId! },
    { enabled: !!selectedImportId }
  );

  const uploadMutation = trpc.financial.bank.uploadCSV.useMutation({
    onSuccess: (data) => {
      utils.financial.bank.imports.list.invalidate();
      toast.success(`${data.totalRows} transações importadas. ${data.autoMatches} conciliadas automaticamente.`);
      setSelectedImportId(data.importId);
      setUploading(false);
    },
    onError: (e) => { toast.error(e.message); setUploading(false); },
  });

  const conciliateMutation = trpc.financial.bank.transactions.conciliate.useMutation({
    onSuccess: () => {
      utils.financial.bank.transactions.list.invalidate();
      utils.financial.bank.imports.list.invalidate();
      utils.financial.entries.list.invalidate();
      utils.financial.summary.invalidate();
      toast.success("Transação conciliada");
      setShowCandidates(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateTxMutation = trpc.financial.bank.transactions.update.useMutation({
    onSuccess: () => {
      utils.financial.bank.transactions.list.invalidate();
      toast.success("Status atualizado");
    },
    onError: (e) => toast.error(e.message),
  });

  // Buscar candidatos para conciliação
  const amount = selectedTransaction ? parseFloat(String(selectedTransaction.amount)) : 0;
  const txDate = selectedTransaction?.transactionDate || "";
  const startDate = txDate ? (() => { const d = new Date(txDate); d.setDate(d.getDate() - 15); return d.toISOString().split("T")[0]; })() : "";
  const endDate = txDate ? (() => { const d = new Date(txDate); d.setDate(d.getDate() + 15); return d.toISOString().split("T")[0]; })() : "";

  const { data: candidates } = trpc.financial.bank.transactions.findCandidates.useQuery(
    { amount, dateStart: startDate, dateEnd: endDate },
    { enabled: showCandidates && !!selectedTransaction && !!startDate && !!endDate }
  );

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".CSV")) {
      toast.error("Selecione um arquivo CSV");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      uploadMutation.mutate({ fileName: file.name, csvContent: content });
    };
    reader.readAsText(file, "UTF-8");
    if (fileRef.current) fileRef.current.value = "";
  }

  if (loadingImports) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Conciliação Bancária</h3>
          <p className="text-sm text-muted-foreground">Importe o extrato CSV do banco e concilie com os lançamentos do sistema</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".csv,.CSV" className="hidden" onChange={handleFileUpload} />
          <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin h-3.5 w-3.5 mr-1" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
            Importar CSV
          </Button>
        </div>
      </div>

      {/* Instruções do CSV */}
      <Card className="border-dashed">
        <CardContent className="py-3 px-4">
          <p className="text-xs text-muted-foreground">
            <strong>Formato esperado:</strong> CSV com colunas de Data, Descrição e Valor (separador: vírgula ou ponto-e-vírgula).
            Valores negativos serão buscados em Contas a Pagar, positivos em Contas a Receber.
            O sistema tenta conciliar automaticamente por valor e data.
          </p>
        </CardContent>
      </Card>

      {/* Lista de importações */}
      {(!imports || imports.length === 0) ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Nenhuma importação realizada</p>
            <p className="text-xs mt-1">Clique em "Importar CSV" para começar a conciliação</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {imports.map((imp) => (
            <Card key={imp.id} className={`cursor-pointer transition-colors ${selectedImportId === imp.id ? "ring-2 ring-primary" : "hover:bg-muted/20"}`} onClick={() => setSelectedImportId(imp.id)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{imp.fileName}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${IMPORT_STATUS_COLORS[imp.status] || ""}`}>
                        {imp.status}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{imp.totalRows} transações</span>
                      <span>{imp.conciliatedRows} conciliadas</span>
                      <span>{imp.pendingRows} pendentes</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedImportId(imp.id); }}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Área de Conferência - Transações da importação selecionada */}
      {selectedImportId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Área de Conferência
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTx ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma transação nesta importação</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground bg-muted/30">
                      <th className="px-3 py-2 font-medium">Data</th>
                      <th className="px-3 py-2 font-medium">Descrição</th>
                      <th className="px-3 py-2 font-medium text-right">Valor</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const val = parseFloat(String(tx.amount));
                      return (
                        <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/20">
                          <td className="px-3 py-2 whitespace-nowrap">{formatDate(tx.transactionDate)}</td>
                          <td className="px-3 py-2 max-w-[250px] truncate">{tx.description}</td>
                          <td className={`px-3 py-2 text-right font-medium ${val >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {formatCurrency(val)}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[tx.status] || ""}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            {tx.status === "pendente" && (
                              <div className="flex gap-1 justify-end">
                                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setSelectedTransaction(tx); setShowCandidates(true); }}>
                                  <Link2 className="h-3 w-3 mr-1" />Conciliar
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => updateTxMutation.mutate({ id: tx.id, status: "ignorado" })}>
                                  <X className="h-3 w-3 mr-1" />Ignorar
                                </Button>
                              </div>
                            )}
                            {tx.status === "conciliado" && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 inline" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog Candidatos para Conciliação */}
      <Dialog open={showCandidates} onOpenChange={setShowCandidates}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Conciliar Transação</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Transação bancária:</p>
                <p className="text-sm font-medium">{selectedTransaction.description}</p>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  <span>Data: {formatDate(selectedTransaction.transactionDate)}</span>
                  <span className={`font-medium ${parseFloat(String(selectedTransaction.amount)) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    Valor: {formatCurrency(parseFloat(String(selectedTransaction.amount)))}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Lançamentos candidatos:</p>
                {!candidates || candidates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum lançamento encontrado com valor e data compatíveis.
                    Crie um lançamento manual em Contas a Pagar ou Receber primeiro.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {candidates.map((c) => (
                      <div key={c.id} className="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/20">
                        <div>
                          <p className="text-sm font-medium">{c.description}</p>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>Venc: {formatDate(c.dueDate)}</span>
                            <span>{formatCurrency(parseFloat(String(c.amount)))}</span>
                            <span className="capitalize">{c.category?.replace("_", " ")}</span>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => conciliateMutation.mutate({ transactionId: selectedTransaction.id, entryId: c.id })} disabled={conciliateMutation.isPending}>
                          <Check className="h-3.5 w-3.5 mr-1" />
                          Vincular
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCandidates(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
