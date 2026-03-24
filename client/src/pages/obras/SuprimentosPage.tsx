import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, ChevronDown, ChevronRight, Plus, Trash2, Upload, FileText, Download, History, Package } from "lucide-react";
import { toast } from "sonner";

export default function SuprimentosPage() {
  const [selectedConstructionId, setSelectedConstructionId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<number>>(new Set());

  const { data: constructions } = trpc.constructions.list.useQuery();
  const { data: categories } = trpc.supplies2.categories.useQuery();
  const activeConstructions = constructions?.filter((c: any) => c.status !== "concluida") ?? [];

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!searchQuery.trim()) return categories;
    return categories.filter((c: any) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.includes(searchQuery)
    );
  }, [categories, searchQuery]);

  const toggleCategory = (catId: number) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  if (!selectedConstructionId) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Package size={22} /> Suprimentos da Obra</h2>
        <p className="text-gray-500 mb-4">Selecione uma obra para gerenciar os suprimentos:</p>
        {activeConstructions.length === 0 ? (
          <p className="text-gray-400 italic">Nenhuma obra em andamento. Cadastre uma obra primeiro.</p>
        ) : (
          <div className="space-y-2">
            {activeConstructions.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setSelectedConstructionId(c.id)}
                className="w-full text-left p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-gray-500">{c.address || "Sem endereço"}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const selectedConstruction = activeConstructions.find((c: any) => c.id === selectedConstructionId);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Package size={22} /> Suprimentos</h2>
          <p className="text-sm text-gray-500">Obra: <strong>{selectedConstruction?.title}</strong></p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSelectedConstructionId(null)}>Trocar Obra</Button>
      </div>

      {/* Busca inteligente */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input
          placeholder="Buscar categoria (ex: Pintura, Elétrica, Fundações...)"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pastas dinâmicas (Accordion) */}
      <div className="space-y-2">
        {filteredCategories.map((cat: any) => (
          <CategoryFolder
            key={cat.id}
            category={cat}
            constructionId={selectedConstructionId}
            isOpen={openCategories.has(cat.id)}
            onToggle={() => toggleCategory(cat.id)}
          />
        ))}
      </div>

      {filteredCategories.length === 0 && searchQuery && (
        <p className="text-center text-gray-400 mt-8">Nenhuma categoria encontrada para "{searchQuery}"</p>
      )}
    </div>
  );
}

function CategoryFolder({ category, constructionId, isOpen, onToggle }: {
  category: any;
  constructionId: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { data: items } = trpc.supplies2.itemsByCategory.useQuery(
    { categoryId: category.id },
    { enabled: isOpen }
  );
  const { data: supplyItems, refetch: refetchSupplyItems } = trpc.constructionSupplies.list.useQuery(
    { constructionId, categoryId: category.id },
    { enabled: isOpen }
  );
  const { data: files, refetch: refetchFiles } = trpc.supplyFiles.list.useQuery(
    { constructionId, categoryId: category.id },
    { enabled: isOpen }
  );

  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  const createMut = trpc.constructionSupplies.create.useMutation({
    onSuccess: () => { refetchSupplyItems(); setShowAddItem(false); setSelectedItemId(""); toast.success("Item adicionado!"); },
  });
  const deleteMut = trpc.constructionSupplies.delete.useMutation({
    onSuccess: () => { refetchSupplyItems(); toast.success("Item removido"); },
  });

  const addedItemIds = new Set((supplyItems ?? []).map((si: any) => si.supplyItemId));
  const availableItems = (items ?? []).filter((i: any) => !addedItemIds.has(i.id));

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
      >
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{category.code}</span>
        <span className="font-semibold flex-1">{category.name}</span>
        {supplyItems && supplyItems.length > 0 && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{supplyItems.length} itens</span>
        )}
      </button>

      {isOpen && (
        <div className="border-t p-4 bg-gray-50/50">
          {/* Itens já adicionados */}
          {(supplyItems ?? []).length > 0 && (
            <div className="space-y-2 mb-4">
              {(supplyItems ?? []).map((si: any) => (
                <SupplyItemRow
                  key={si.id}
                  item={si}
                  items={items ?? []}
                  constructionId={constructionId}
                  onRefetch={refetchSupplyItems}
                />
              ))}
            </div>
          )}

          {/* Adicionar novo item */}
          {showAddItem ? (
            <div className="flex items-end gap-2 mb-4 p-3 bg-white rounded border">
              <div className="flex-1">
                <Label className="text-xs">Selecione o item</Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                  <SelectTrigger><SelectValue placeholder="Escolha um item..." /></SelectTrigger>
                  <SelectContent>
                    {availableItems.map((item: any) => (
                      <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                disabled={!selectedItemId || createMut.isPending}
                onClick={() => {
                  createMut.mutate({
                    constructionId,
                    categoryId: category.id,
                    supplyItemId: Number(selectedItemId),
                  });
                }}
              >
                {createMut.isPending ? <Loader2 className="animate-spin" size={14} /> : "Adicionar"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setShowAddItem(false); setSelectedItemId(""); }}>Cancelar</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setShowAddItem(true)} className="mb-4">
              <Plus size={14} className="mr-1" /> Adicionar Item
            </Button>
          )}

          {/* Upload de orçamentos */}
          <FileUploadZone
            constructionId={constructionId}
            categoryId={category.id}
            files={files ?? []}
            onRefetch={refetchFiles}
          />
        </div>
      )}
    </div>
  );
}

function SupplyItemRow({ item, items, constructionId, onRefetch }: {
  item: any;
  items: any[];
  constructionId: number;
  onRefetch: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity || "");
  const [unit, setUnit] = useState(item.unit || "un");
  const [closedValue, setClosedValue] = useState(item.closedValue || "");

  const { data: lastValue } = trpc.supplies2.lastClosedValue.useQuery(
    { supplyItemId: item.supplyItemId, excludeConstructionId: constructionId },
  );

  const updateMut = trpc.constructionSupplies.update.useMutation({
    onSuccess: () => { onRefetch(); setEditing(false); toast.success("Atualizado!"); },
  });
  const deleteMut = trpc.constructionSupplies.delete.useMutation({
    onSuccess: () => { onRefetch(); toast.success("Removido"); },
  });

  const itemName = items.find((i: any) => i.id === item.supplyItemId)?.name ?? `Item #${item.supplyItemId}`;

  return (
    <div className="p-3 bg-white rounded border">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{itemName}</span>
        <div className="flex items-center gap-1">
          {!editing && (
            <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="text-xs h-7">Editar</Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate({ id: item.id })} className="text-red-500 h-7">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      {/* Histórico de preço */}
      {lastValue && (
        <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mb-2">
          <History size={12} />
          Último valor pago: <strong>R$ {Number(lastValue.value).toFixed(2)} / {lastValue.unit}</strong> (Fechado na {lastValue.constructionTitle})
        </div>
      )}

      {editing ? (
        <div className="flex items-end gap-2 mt-2">
          <div>
            <Label className="text-xs">Qtd</Label>
            <Input value={quantity} onChange={e => setQuantity(e.target.value)} className="h-8 w-24" placeholder="0" />
          </div>
          <div>
            <Label className="text-xs">Unidade</Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["un", "m²", "m³", "m", "kg", "L", "cx", "pc", "vb", "sc"].map(u => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Valor Fechado (R$)</Label>
            <Input value={closedValue} onChange={e => setClosedValue(e.target.value)} className="h-8 w-32" placeholder="0,00" />
          </div>
          <Button size="sm" className="h-8" disabled={updateMut.isPending} onClick={() => {
            updateMut.mutate({ id: item.id, quantity, unit, closedValue });
          }}>
            {updateMut.isPending ? <Loader2 className="animate-spin" size={14} /> : "Salvar"}
          </Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => setEditing(false)}>Cancelar</Button>
        </div>
      ) : (
        (item.quantity || item.closedValue) && (
          <div className="text-xs text-gray-500 mt-1">
            {item.quantity && <span>Qtd: {item.quantity} {item.unit}</span>}
            {item.closedValue && <span className="ml-3">Valor: R$ {Number(item.closedValue).toFixed(2)}</span>}
          </div>
        )
      )}
    </div>
  );
}

function FileUploadZone({ constructionId, categoryId, files, onRefetch }: {
  constructionId: number;
  categoryId: number;
  files: any[];
  onRefetch: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  const uploadMut = trpc.supplyFiles.upload.useMutation({
    onSuccess: () => { onRefetch(); toast.success("Arquivo enviado!"); setUploading(false); },
    onError: () => { toast.error("Erro ao enviar arquivo"); setUploading(false); },
  });
  const deleteMut = trpc.supplyFiles.delete.useMutation({
    onSuccess: () => { onRefetch(); toast.success("Arquivo removido"); },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx 10MB)");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMut.mutate({
        constructionId,
        categoryId,
        fileName: file.name,
        fileBase64: base64,
        contentType: file.type,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={14} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-500">Orçamentos e Documentos</span>
      </div>

      {files.length > 0 && (
        <div className="space-y-1 mb-2">
          {files.map((f: any) => (
            <div key={f.id} className="flex items-center justify-between text-xs bg-white p-2 rounded border">
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-blue-500" />
                <span>{f.fileName}</span>
                <span className="text-gray-400">{f.uploadedBy}</span>
              </div>
              <div className="flex items-center gap-1">
                <a href={f.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="ghost" className="h-6 text-xs"><Download size={12} /></Button>
                </a>
                <Button size="sm" variant="ghost" className="h-6 text-red-500" onClick={() => deleteMut.mutate({ id: f.id })}>
                  <Trash2 size={12} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-colors text-xs text-gray-400">
        {uploading ? (
          <><Loader2 className="animate-spin" size={14} /> Enviando...</>
        ) : (
          <><Upload size={14} /> Arraste ou clique para enviar orçamento (PDF, imagem, planilha)</>
        )}
        <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls,.csv" disabled={uploading} />
      </label>
    </div>
  );
}
