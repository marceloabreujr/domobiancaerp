# Domobianca ERP - TODO

## Base e Infraestrutura
- [x] Schema do banco com roles (admin/gerente/operador)
- [x] DB helpers para usuários e gerenciamento de roles
- [x] Routers tRPC com procedures protegidas por role
- [x] Middleware de autorização por nível de acesso

## Autenticação e Controle de Acesso
- [x] Login via OAuth (Manus Auth)
- [x] Controle de acesso: Admin (total), Gerente (relatórios/aprovações), Operador (lançamento)
- [x] Proteção de rotas no frontend baseada em role
- [x] Logout e gerenciamento de sessão
- [x] Página de perfil com exibição de role

## Layout e Navegação
- [x] Tema CSS limpo e leve (cores, tipografia, sombras)
- [x] DashboardLayout com sidebar de navegação
- [x] Navegação entre os 6 módulos
- [x] Indicador visual de módulo ativo
- [x] Layout responsivo

## Módulos Placeholder
- [x] Financeiro - placeholder "em desenvolvimento"
- [x] Administrativo - placeholder "em desenvolvimento"
- [x] Gestão de Obras - placeholder "em desenvolvimento"
- [x] Gestão de Imóveis - placeholder "em desenvolvimento"
- [x] Suprimentos - placeholder "em desenvolvimento"
- [x] Gestão de Negócios - placeholder "em desenvolvimento"

## Testes
- [x] Testes vitest para routers de autenticação
- [x] Testes vitest para middleware de autorização por role
