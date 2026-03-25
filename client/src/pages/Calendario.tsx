import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ChevronLeft, ChevronRight, CalendarDays, Filter, CheckCircle2, Circle, AlertTriangle, Building2, Briefcase, HardHat, Wallet, ClipboardList } from "lucide-react";
import { useState, useMemo } from "react";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const SOURCE_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  calendar: { label: "Administrativo", color: "bg-blue-500", icon: ClipboardList },
  property: { label: "Imóveis", color: "bg-emerald-500", icon: Building2 },
  business: { label: "Negócios", color: "bg-purple-500", icon: Briefcase },
  construction: { label: "Obras", color: "bg-orange-500", icon: HardHat },
  financial: { label: "Financeiro", color: "bg-amber-500", icon: Wallet },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("pt-BR");
}

export default function Calendario() {
  return (
    <DashboardLayout>
      <CalendarioContent />
    </DashboardLayout>
  );
}

function CalendarioContent() {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");

  // Calcular datas do mês
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const { data: tasks, isLoading } = trpc.centralCalendar.tasks.useQuery({
    startDate,
    endDate,
    source: filterSource !== "all" ? filterSource : undefined,
    assignedTo: filterUser !== "all" ? parseInt(filterUser) : undefined,
  });

  const { data: allUsers } = trpc.centralCalendar.usersList.useQuery();
  const isAdmin = user?.role === 'admin';

  // Agrupar tarefas por dia
  const tasksByDay = useMemo(() => {
    const map = new Map<number, typeof tasks>();
    if (!tasks) return map;
    for (const task of tasks) {
      const day = parseInt(task.dueDate.split("-")[2]);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(task);
    }
    return map;
  }, [tasks]);

  // Gerar grid do calendário
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = lastDay;
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
    setSelectedDay(null);
  };

  const goToToday = () => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDay(now.getDate());
  };

  // Tarefas do dia selecionado
  const selectedTasks = selectedDay ? (tasksByDay.get(selectedDay) || []) : [];

  // Contadores
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.isCompleted).length || 0;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks?.filter(t => {
    if (t.isCompleted) return false;
    const d = new Date(t.dueDate + "T23:59:59");
    return d < new Date();
  }).length || 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Calendário Central</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Todas as tarefas e vencimentos de todos os módulos
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday}>
          <CalendarDays className="h-4 w-4 mr-1.5" />
          Hoje
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-3 pb-2 px-3">
            <p className="text-xs text-muted-foreground">Total no Mês</p>
            <p className="text-xl font-bold">{totalTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2 px-3">
            <p className="text-xs text-muted-foreground">Concluídas</p>
            <p className="text-xl font-bold text-emerald-600">{completedTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2 px-3">
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="text-xl font-bold text-blue-600">{pendingTasks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-2 px-3">
            <p className="text-xs text-muted-foreground">Atrasadas</p>
            <p className="text-xl font-bold text-red-600">{overdueTasks}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtros:</span>
        </div>
        <Select value={filterSource} onValueChange={setFilterSource}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Módulo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Módulos</SelectItem>
            <SelectItem value="calendar">Administrativo</SelectItem>
            <SelectItem value="property">Imóveis</SelectItem>
            <SelectItem value="business">Negócios</SelectItem>
            <SelectItem value="construction">Obras</SelectItem>
            <SelectItem value="financial">Financeiro</SelectItem>
          </SelectContent>
        </Select>
        {isAdmin && (
          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Usuários</SelectItem>
              {allUsers?.map((u: any) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.name || u.username || `Usuário #${u.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Calendário + Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendário Grid */}
        <Card className="lg:col-span-2">
          <CardContent className="p-3 sm:p-4">
            {/* Navegação do mês */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold">
                {MONTHS[month]} {year}
              </h2>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
              </div>
            ) : (
              <>
                {/* Header dias da semana */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAYS.map(d => (
                    <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Grid de dias */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, idx) => {
                    if (day === null) return <div key={`empty-${idx}`} className="aspect-square" />;

                    const dayTasks = tasksByDay.get(day) || [];
                    const hasOverdue = dayTasks.some(t => {
                      if (t.isCompleted) return false;
                      const d = new Date(t.dueDate + "T23:59:59");
                      return d < new Date();
                    });
                    const hasPending = dayTasks.some(t => !t.isCompleted);
                    const allCompleted = dayTasks.length > 0 && dayTasks.every(t => t.isCompleted);
                    const isSelected = selectedDay === day;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                        className={`
                          aspect-square rounded-lg flex flex-col items-center justify-start p-1 transition-all text-sm relative
                          ${isToday(day) ? "ring-2 ring-primary" : ""}
                          ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}
                          ${!isSelected && hasOverdue ? "bg-red-50 dark:bg-red-950/20" : ""}
                          ${!isSelected && allCompleted ? "bg-emerald-50 dark:bg-emerald-950/20" : ""}
                        `}
                      >
                        <span className={`text-xs sm:text-sm font-medium ${isToday(day) && !isSelected ? "text-primary" : ""}`}>
                          {day}
                        </span>
                        {dayTasks.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                            {dayTasks.slice(0, 3).map((t, i) => (
                              <div
                                key={i}
                                className={`h-1.5 w-1.5 rounded-full ${
                                  t.isCompleted
                                    ? "bg-emerald-500"
                                    : hasOverdue
                                    ? "bg-red-500"
                                    : SOURCE_CONFIG[t.source]?.color || "bg-gray-400"
                                }`}
                              />
                            ))}
                            {dayTasks.length > 3 && (
                              <span className={`text-[8px] leading-none ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                +{dayTasks.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legenda */}
                <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t">
                  {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => (
                    <div key={key} className="flex items-center gap-1.5">
                      <div className={`h-2.5 w-2.5 rounded-full ${cfg.color}`} />
                      <span className="text-xs text-muted-foreground">{cfg.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Painel de detalhes do dia */}
        <Card>
          <CardContent className="p-3 sm:p-4">
            {selectedDay ? (
              <>
                <h3 className="font-semibold mb-3">
                  {selectedDay} de {MONTHS[month]}
                </h3>
                {selectedTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhuma tarefa neste dia</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {selectedTasks.map((task) => {
                      const cfg = SOURCE_CONFIG[task.source];
                      const Icon = cfg?.icon || CalendarDays;
                      const isOverdue = !task.isCompleted && new Date(task.dueDate + "T23:59:59") < new Date();
                      return (
                        <div
                          key={`${task.source}-${task.id}`}
                          className={`p-3 rounded-lg border transition-colors ${
                            task.isCompleted
                              ? "bg-muted/30 border-border/50"
                              : isOverdue
                              ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900"
                              : "bg-background border-border hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {task.isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                            ) : isOverdue ? (
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium leading-tight ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 gap-1">
                                  <Icon className="h-3 w-3" />
                                  {task.module}
                                </Badge>
                                {task.priority && task.priority !== "normal" && (
                                  <Badge
                                    variant={task.priority === "urgente" || task.priority === "alta" ? "destructive" : "secondary"}
                                    className="text-[10px] px-1.5 py-0 h-5"
                                  >
                                    {task.priority}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Clique em um dia para ver as tarefas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de tarefas atrasadas */}
      {overdueTasks > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="p-3 sm:p-4">
            <h3 className="font-semibold text-red-600 flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4" />
              Tarefas Atrasadas ({overdueTasks})
            </h3>
            <div className="space-y-2">
              {tasks?.filter(t => {
                if (t.isCompleted) return false;
                const d = new Date(t.dueDate + "T23:59:59");
                return d < new Date();
              }).map((task) => {
                const cfg = SOURCE_CONFIG[task.source];
                const Icon = cfg?.icon || CalendarDays;
                return (
                  <div
                    key={`overdue-${task.source}-${task.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg bg-red-50 dark:bg-red-950/20"
                  >
                    <Icon className="h-4 w-4 text-red-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.module}</p>
                    </div>
                    <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
