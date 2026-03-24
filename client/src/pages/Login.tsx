import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Building2, Eye, EyeOff, Key, Loader2, Lock, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Mode = "login" | "changePassword";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Domobianca ERP
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Sistema de Gestão Empresarial
            </p>
          </div>
        </div>

        {mode === "login" ? (
          <LoginForm onChangePassword={() => setMode("changePassword")} />
        ) : (
          <ChangePasswordForm onBack={() => setMode("login")} />
        )}

        <p className="text-center text-xs text-slate-400 mt-6">
          Domobianca &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

function LoginForm({ onChangePassword }: { onChangePassword: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Login realizado com sucesso!");
      utils.auth.me.invalidate();
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <Card className="shadow-xl border-0 bg-white">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl text-center">Entrar</CardTitle>
        <CardDescription className="text-center">
          Insira suas credenciais para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Usuário
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                autoComplete="username"
                autoFocus
                disabled={loginMutation.isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                autoComplete="current-password"
                disabled={loginMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onChangePassword}
            className="text-sm text-slate-500 hover:text-slate-700 underline-offset-4 hover:underline transition-colors inline-flex items-center gap-1.5"
          >
            <Key className="h-3.5 w-3.5" />
            Trocar minha senha
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChangePasswordForm({ onBack }: { onBack: () => void }) {
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso! Faça login com a nova senha.");
      onBack();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao trocar senha");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !currentPassword.trim() || !newPassword.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }
    changePasswordMutation.mutate({
      username: username.trim(),
      currentPassword,
      newPassword,
    });
  };

  return (
    <Card className="shadow-xl border-0 bg-white">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-500"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <CardTitle className="text-xl">Trocar Senha</CardTitle>
        </div>
        <CardDescription>
          Informe seu usuário, senha atual e a nova senha desejada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cp-username" className="text-sm font-medium">
              Usuário
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="cp-username"
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                autoComplete="username"
                autoFocus
                disabled={changePasswordMutation.isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-current" className="text-sm font-medium">
              Senha Atual
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="cp-current"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Sua senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                autoComplete="current-password"
                disabled={changePasswordMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-new" className="text-sm font-medium">
              Nova Senha
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="cp-new"
                type={showNewPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                autoComplete="new-password"
                disabled={changePasswordMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cp-confirm" className="text-sm font-medium">
              Confirmar Nova Senha
            </Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="cp-confirm"
                type={showNewPassword ? "text" : "password"}
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                autoComplete="new-password"
                disabled={changePasswordMutation.isPending}
              />
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500">As senhas não conferem</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-medium shadow-md hover:shadow-lg transition-all"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Alterando...
              </>
            ) : (
              "Alterar Senha"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
