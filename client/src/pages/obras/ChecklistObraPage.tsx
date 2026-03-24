import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckSquare, ChevronDown, ChevronRight, Search, ClipboardList } from "lucide-react";
import { toast } from "sonner";

export default function ChecklistObraPage() {
  const [selectedConstructionId, setSelectedConstructionId] = useState<number | null>(null);

  const { data: constructions } = trpc.constructions.list.useQuery();
  const activeConstructions = constructions?.filter((c: any) => c.status !== "concluida") ?? [];

  if (!selectedConstructionId) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ClipboardList size={22} /> Checklist de Ação</h2>
        <p className="text-gray-500 mb-4">Selecione uma obra para ver o checklist:</p>
        {activeConstructions.length === 0 ? (
          <p className="text-gray-400 italic">Nenhuma obra em andamento.</p>
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

  return (
    <ChecklistContent
      constructionId={selectedConstructionId}
      constructionTitle={activeConstructions.find((c: any) => c.id === selectedConstructionId)?.title ?? ""}
      onBack={() => setSelectedConstructionId(null)}
    />
  );
}

function ChecklistContent({ constructionId, constructionTitle, onBack }: {
  constructionId: number;
  constructionTitle: string;
  onBack: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<number>>(new Set());

  const { data: categories } = trpc.supplies2.categories.useQuery();
  const { data: checklist, refetch } = trpc.constructionChecklist.get.useQuery({ constructionId });
  const initMut = trpc.constructionChecklist.initialize.useMutation({
    onSuccess: () => { refetch(); toast.success("Checklist inicializado!"); },
  });

  // Initialize checklist if empty
  const isInitialized = (checklist ?? []).length > 0;

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!searchQuery.trim()) return categories;
    return categories.filter((c: any) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.includes(searchQuery)
    );
  }, [categories, searchQuery]);

  // Group checklist items by category
  const checklistByCategory = useMemo(() => {
    const map: Record<number, any[]> = {};
    (checklist ?? []).forEach((item: any) => {
      if (!map[item.categoryId]) map[item.categoryId] = [];
      map[item.categoryId].push(item);
    });
    return map;
  }, [checklist]);

  // Calculate progress
  const totalItems = (checklist ?? []).length;
  const checkedItems = (checklist ?? []).filter((i: any) => i.isChecked).length;
  const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  const toggleCategory = (catId: number) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><ClipboardList size={22} /> Checklist de Ação</h2>
          <p className="text-sm text-gray-500">Obra: <strong>{constructionTitle}</strong></p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>Trocar Obra</Button>
      </div>

      {/* Barra de progresso */}
      {isInitialized && (
        <div className="mb-6 p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso Geral</span>
            <span className="text-sm font-bold text-blue-600">{checkedItems}/{totalItems} ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: progressPercent === 100 ? '#22c55e' : progressPercent > 50 ? '#3b82f6' : '#f59e0b'
              }}
            />
          </div>
        </div>
      )}

      {!isInitialized ? (
        <div className="text-center py-12">
          <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">O checklist desta obra ainda não foi inicializado.</p>
          <p className="text-sm text-gray-400 mb-6">Ao inicializar, todos os 108 itens das 12 categorias serão criados para acompanhamento.</p>
          <Button onClick={() => initMut.mutate({ constructionId })} disabled={initMut.isPending}>
            {initMut.isPending ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckSquare size={16} className="mr-2" />}
            Inicializar Checklist
          </Button>
        </div>
      ) : (
        <>
          {/* Busca */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Buscar categoria..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categorias */}
          <div className="space-y-2">
            {filteredCategories.map((cat: any) => {
              const catItems = checklistByCategory[cat.id] ?? [];
              const catChecked = catItems.filter((i: any) => i.isChecked).length;
              const catTotal = catItems.length;
              const catPercent = catTotal > 0 ? Math.round((catChecked / catTotal) * 100) : 0;
              const isOpen = openCategories.has(cat.id);

              return (
                <div key={cat.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{cat.code}</span>
                    <span className="font-semibold flex-1">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        catPercent === 100 ? 'bg-green-100 text-green-700' :
                        catPercent > 0 ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {catChecked}/{catTotal}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${catPercent}%`,
                            backgroundColor: catPercent === 100 ? '#22c55e' : '#3b82f6'
                          }}
                        />
                      </div>
                    </div>
                  </button>

                  {isOpen && catItems.length > 0 && (
                    <div className="border-t bg-gray-50/50 p-2">
                      {catItems.map((item: any) => (
                        <ChecklistItemRow key={item.id} item={item} onRefetch={refetch} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ChecklistItemRow({ item, onRefetch }: { item: any; onRefetch: () => void }) {
  const [notes, setNotes] = useState(item.notes || "");
  const [showNotes, setShowNotes] = useState(false);

  const { data: allItems } = trpc.supplies2.itemsByCategory.useQuery({ categoryId: item.categoryId });
  const toggleMut = trpc.constructionChecklist.toggle.useMutation({
    onSuccess: () => onRefetch(),
  });
  const notesMut = trpc.constructionChecklist.updateNotes.useMutation({
    onSuccess: () => { onRefetch(); toast.success("Nota salva"); setShowNotes(false); },
  });

  const itemName = allItems?.find((i: any) => i.id === item.supplyItemId)?.name ?? `Item #${item.supplyItemId}`;

  return (
    <div className={`flex items-center gap-3 p-2 rounded hover:bg-white transition-colors ${item.isChecked ? 'opacity-60' : ''}`}>
      <button
        onClick={() => toggleMut.mutate({ id: item.id, isChecked: !item.isChecked })}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          item.isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        {item.isChecked && <CheckSquare size={12} />}
      </button>
      <span className={`flex-1 text-sm ${item.isChecked ? 'line-through text-gray-400' : ''}`}>{itemName}</span>
      
      {showNotes ? (
        <div className="flex items-center gap-1">
          <Input
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Observação..."
            className="h-7 text-xs w-40"
          />
          <Button size="sm" className="h-7 text-xs" onClick={() => notesMut.mutate({ id: item.id, notes })}>OK</Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowNotes(false)}>X</Button>
        </div>
      ) : (
        <button onClick={() => setShowNotes(true)} className="text-xs text-gray-400 hover:text-blue-500">
          {item.notes ? `📝 ${item.notes.substring(0, 20)}...` : "+ nota"}
        </button>
      )}

      {item.isChecked && item.checkedAt && (
        <span className="text-xs text-gray-400">{new Date(item.checkedAt).toLocaleDateString("pt-BR")}</span>
      )}
    </div>
  );
}
