import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Financeiro from "./pages/Financeiro";
import AdminLayout from "./pages/admin/AdminLayout";
import Obras from "./pages/Obras";
import Imoveis from "./pages/Imoveis";
import Suprimentos from "./pages/Suprimentos";
import Negocios from "./pages/Negocios";
import Configuracoes from "./pages/Configuracoes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/financeiro" component={Financeiro} />
      <Route path="/administrativo" component={AdminLayout} />
      <Route path="/obras" component={Obras} />
      <Route path="/imoveis" component={Imoveis} />
      <Route path="/suprimentos" component={Suprimentos} />
      <Route path="/negocios" component={Negocios} />
      <Route path="/configuracoes" component={Configuracoes} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
