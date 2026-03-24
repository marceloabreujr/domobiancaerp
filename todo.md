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

## Módulo Administrativo

### RH e Gestão de Equipes
- [x] Cadastro completo de colaboradores (nome, CPF, cargo, salário, contatos)
- [x] Controle de férias e faltas
- [x] Alocação de pessoal por projeto/obra
- [x] Fluxos de onboarding e offboarding (campo de status: ativo/desligado)

### Gestão de Documentos (GED) e Legal
- [x] Arquivo digital centralizado (PDFs, fotos, plantas)
- [x] Controle de contratos de fornecedores
- [x] Alertas de validade para alvarás e certidões
- [x] Upload e visualização de documentos

### Calendário e Alertas
- [x] Painel central de eventos e prazos
- [x] Alertas automáticos de vencimento de contratos
- [x] Alertas de renovação de licenças
- [x] Marcos de projetos

### Rotinas de Escritório (Facilities)
- [x] Controle de stock de consumíveis
- [x] Gestão da frota automóvel
- [x] Fundo de maneio (pequenos gastos diários)
- [x] Sistema de chamados (helpdesk interno)

### IA Integrada
- [x] OCR de faturas e recibos para lançamento automático
- [x] Sumarização de contratos
- [x] Geração de rascunhos de comunicados internos
- [x] Assistente virtual para consultas de gestão

### Testes do Módulo Administrativo
- [x] Testes de estrutura dos routers (22 testes)
- [x] Testes de controle de acesso (bloqueio de não-autenticados)
- [x] Testes de validação de input (campos obrigatórios)

## Módulo Gestão de Imóveis

### Estrutura e Navegação
- [x] Sidebar interna: Novo Imóvel, Todos, Disponíveis, Alugados, À Venda, Arquivados
- [x] Sidebar interna: Checklist Mensal, Alertas de Cobrança, Resumo Financeiro
- [x] Sidebar interna: Clientes, Proprietários
- [x] Exibição em cards modernos na área principal
- [x] Filtro Domobianca / Terceiros na listagem

### Cadastro de Imóvel
- [x] Posse: Domobianca ou Terceiros
- [x] Tipologia: Residencial, Galpão, Sala Comercial, Apartamento, Lote, etc.
- [x] Campos: metragem, condomínio, IPTU
- [x] Campos residenciais: quartos, banheiros, vagas
- [x] Status: Disponível, Alugado, À Venda, Arquivado

### Contratos e Inquilinos
- [x] Cadastro de inquilino (responsável financeiro)
- [x] Identificação do morador/ocupante (se diferente)
- [x] Data de início e prazo de locação (Mensal a 3 anos)
- [x] Índice de reajuste (IGPM, IPCA, INPC)
- [x] Composição de cobrança (Aluguel+Condomínio+IPTU, checkboxes)
- [x] Pacote de Locação com valor total
- [x] Taxa de administração e comissão de venda

### Alertas e Calendário
- [x] Alerta 7 dias antes do vencimento do aluguel (emissão de boleto)
- [x] Alerta de aniversário de contrato (reajuste)
- [x] To-Do List integrada ao módulo

### Clientes e Proprietários
- [x] Cadastro de clientes (inquilinos/compradores)
- [x] Cadastro de proprietários (com dados bancários/PIX)
- [x] Resumo financeiro (receita aluguéis, condomínios, taxas admin, contratos ativos)
- [x] Checklist mensal de manutenção por imóvel

### Testes do Módulo Gestão de Imóveis
- [x] Testes de estrutura dos routers (32 testes)
- [x] Testes de validação de input (campos obrigatórios)
- [x] Total: 63 testes passando (3 arquivos)

## Refatoração Módulo Gestão de Imóveis (v2)

### Novo Fluxo de Cadastro
- [x] Imóvel entra como "Disponível para Locação" ou "Disponível para Venda"
- [x] Código automático sequencial: LOC-001 para locação, VND-001 para venda
- [x] Formulário separado para Locação (com contrato completo)
- [x] Formulário separado para Venda

### Contrato de Locação Completo
- [x] Data de início do contrato
- [x] Prazo: quinzenal, mensal, trimestral, semestral, anual, 2 anos, 3 anos
- [x] Índice de reajuste: IGPM, IPCA, INPC
- [x] Valor do reajuste anual
- [x] Data do próximo reajuste

### Fluxo de Status nos Cards
- [x] Botão "Alugar" no card do imóvel disponível para locação
- [x] Botão "Vender" no card do imóvel disponível para venda
- [x] Imóvel alugado vai para aba "Alugados"
- [x] Imóvel vendido vai para aba "Vendidos"

## Módulo Gestão de Negócios

### Estrutura e Navegação
- [x] Sidebar: Novo Negócio, Negócios Ativos, Arquivados
- [x] Sidebar: Calendário de Tarefas, Tarefas Urgentes
- [x] Sidebar: Captadores (+ Registar, Ver Base de Dados)

### Captadores (Parceiros de Negócio)
- [x] Cadastro: Nome, Tipo (Corretor, Advogado, Investidor, Permutuário, Outros)
- [x] Campos: Telemóvel, E-mail, CPF/CNPJ, % comissão padrão
- [x] Dashboard do Captador: lista de negócios trazidos, estado e VGV total

### Formulário Novo Negócio (5 seções)
- [x] Seção 1 - Identificação: Nome, Dono (Próprio/Terceiros), Captador (busca), Endereço
- [x] Seção 2 - Classificação: Fase Atual, Tipo de Operação, Prioridade
- [x] Seção 3 - Dados Técnicos: Área Total, Área Útil, Zoneamento, Potencial Construtivo
- [x] Seção 4 - Indicadores Financeiros: Custo, Valor Mercado, Máx Investimento, VGV, TIR, Margem
- [x] Seção 5 - Riscos: Estado Documentação, Próxima Ação, Prioridade, Data Próxima Ação

### Motor de Viabilidade Econômica (EVE)
- [x] Inputs: Custo Terreno, Obra/Reforma, Custos Indiretos, Impostos, Comissões
- [x] Outputs automáticos: Lucro Líquido, Margem %, TIR, ROI
- [x] Farol de viabilidade: verde (bom), amarelo (arriscado), vermelho (inviável)

### Tarefas e Alertas
- [x] Calendário de Tarefas alimentado automaticamente pelas Próximas Ações
- [x] Tarefas Urgentes com destaque visual
- [x] Alerta quando data da próxima ação vence (tarefas atrasadas destacadas em vermelho)

### Testes do Módulo Gestão de Negócios
- [x] Testes de estrutura dos routers (negocios, captadores, viabilidade, businessTasks)
- [x] Testes de validação de input (campos obrigatórios)
- [x] Testes de controle de acesso por role
- [x] Total: 89 testes passando (4 arquivos)

## Bug Fixes
- [x] Corrigir layout responsivo do NegociosLayout (formulário não visível em telas menores)
- [x] Corrigir layout responsivo do ImoveisLayout (mesmo problema)

## Módulo Gestão de Obras

### Estrutura e Navegação
- [x] Abas: Nova Obra, Obras em Andamento, Obras Arquivadas
- [x] Abas: Novo Relatório, Adicionar Imagem, Calendário de Tarefas
- [x] Abas: Empreiteiros (Cadastrar + Ver Base), Arquitetas (Cadastrar + Ver Base)

### Formulário Nova Obra (3 seções)
- [x] Seção 1 - Informações Básicas: Título, Toggle "Temos a chave", Endereço
- [x] Seção 2 - Profissionais: Empreiteiro (busca + cadastrar novo), Arquiteta (busca + cadastrar nova)
- [x] Seção 3 - Características: Tipo (Residencial, Comercial, Reforma, Galpão), Status, Andamento visual (Avançada/Em Dia/Atrasada/Totalmente Atrasada)

### Gestão de Profissionais
- [x] Cadastro de Empreiteiros (Nome, Contato, Especialidade, CNPJ/CPF)
- [x] Cadastro de Arquitetas (Nome, Contato, Especialidade, CNPJ/CPF)
- [x] Vínculo profissionais-obras no banco de dados

### Relatórios e Imagens (Diário de Obra)
- [x] Novo Relatório vinculado a obra (data, autor, texto rico)
- [x] Upload de imagens (galeria vinculada a cada obra)

### Calendário de Tarefas
- [x] Marcos da obra, prazos de entrega e vistorias
- [x] Integração com relatórios e status do projeto

### Testes do Módulo Gestão de Obras
- [x] Testes de estrutura dos routers (constructions, contractors, architects, reports, images, tasks)
- [x] Testes de validação de input (campos obrigatórios)
- [x] Total: 119 testes passando (5 arquivos)

## Melhorias
- [x] Upload de PDF do contrato assinado no módulo Gestão de Imóveis (contratos de locação)

## Renomeações e Remoções
- [x] Renomear "Gestão de Obras" → "Obras"
- [x] Renomear "Gestão de Imóveis" → "Imóveis"
- [x] Renomear "Gestão de Negócios" → "Novas Oportunidades"
- [x] Remover módulo Suprimentos (sidebar, painel, rotas)

## Suprimentos e Checklist (dentro de Obras)

### Suprimentos
- [x] Tabela base de categorias (12 categorias com itens)
- [x] Seed de dados: todas as 12 categorias e itens populados
- [x] Busca inteligente (Typeahead) por categoria
- [x] Pastas dinâmicas (Accordion) por categoria dentro da obra
- [x] Histórico de preços: último valor pago em obras anteriores
- [x] Campos por item: Quantidade, Unidade (m², un, etc.), Valor Fechado
- [x] Upload de orçamentos (PDFs/planilhas) por categoria e obra
- [x] Arquivos salvos no S3 vinculados à categoria e obra

### Checklist de Ação
- [x] Checklist com todos os 12 grupos de itens
- [x] Marcar itens como concluídos por obra
- [x] Progresso visual por categoria
- [x] Integração com os mesmos itens do Suprimentos

### Testes do Suprimentos e Checklist
- [x] Testes de estrutura dos routers (supplies2, constructionSupplies, supplyFiles, constructionChecklist)
- [x] Testes de validação de input (campos obrigatórios)
- [x] Testes de controle de acesso por role (anônimo bloqueado, operador/gerente permitido)
- [x] Testes de funcionalidade com DB (12 categorias, itens por categoria, busca)
- [x] Total: 151 testes passando (6 arquivos)

## Sistema de Login com Usuário e Senha

### Autenticação
- [x] Adicionar campos username e password (hash) na tabela users
- [x] Rota de login com usuário/senha (POST /api/auth/login)
- [x] Hash de senha com bcrypt
- [x] Sessão via JWT/cookie (manter compatibilidade com sistema atual)
- [x] Tela de login com formulário de usuário e senha
- [x] Logout funcional

### Gerenciamento de Usuários (Admin/Master)
- [x] Painel na aba Configurações para criar novos usuários
- [x] Definir permissão ao criar usuário (Admin/Gerente/Operador)
- [x] Alterar permissão de usuários existentes
- [x] Resetar senha de outros usuários
- [x] Listar todos os usuários com seus níveis de acesso

### Usuário Master
- [x] Criar usuário master (Marcelo) como Admin
- [x] Seed inicial com credenciais do master

### Testes
- [x] Testes de login com credenciais válidas/inválidas
- [x] Testes de controle de acesso ao painel de usuários
- [x] Testes de criação de novos usuários

## Módulo Financeiro

### Conciliação Bancária (Importação CSV)
- [x] Upload e parse de arquivo CSV bancário (Data, Descrição, Valor, ID Transação)
- [x] Lógica de conciliação: valor negativo → Contas a Pagar, positivo → Contas a Receber
- [x] Área de Conferência: itens identificados automaticamente + itens pendentes de confirmação
- [x] Prevenção de duplicatas via ID_Transacao_CSV
- [x] Confirmar/rejeitar sugestões de conciliação manualmente

### Contas a Receber (integrado com Imóveis)
- [x] Cronograma financeiro atrelado a cada imóvel (parcelas mensais, balões, reforços)
- [x] Geração automática de parcelas com índices de correção (INCC, IGPM, IPCA)
- [x] Status de cobrança: A Vencer, Recebido, Inadimplente
- [x] Alerta automático de inadimplência após X dias do vencimento
- [x] Listagem com filtros por imóvel, status e período

### Contas a Pagar (Custos Fixos e Variáveis)
- [x] Cadastro de contas recorrentes (IPTU, Condomínio)
- [x] Geração automática de 12 lançamentos de IPTU por inscrição imobiliária
- [x] Rateio por Centro de Custo (imóvel específico ou Administração Central)
- [x] Categorias: IPTU, Condomínio, Aluguel, Venda, Manutenção, Outros
- [x] Status: Aberto, Pago, Cancelado, Atrasado

### Schema e Backend
- [x] Tabela financialEntries (lançamentos financeiros com todos os campos)
- [x] Tabela financialInstallments (parcelas geradas por imóvel)
- [x] Tabela recurringBills (contas recorrentes)
- [x] Tabela bankConciliation (importações CSV e conferência)
- [x] DB helpers para CRUD financeiro
- [x] Routers tRPC para todas as operações financeiras

### Frontend
- [x] Dashboard Financeiro com resumo (total a receber, total a pagar, saldo)
- [x] Aba Contas a Receber com listagem e filtros
- [x] Aba Contas a Pagar com listagem e filtros
- [x] Aba Conciliação Bancária com upload CSV e área de conferência
- [x] Formulário de novo lançamento manual
- [x] Formulário de conta recorrente (IPTU/Condomínio)
- [x] Gerador de parcelas por imóvel

### Testes
- [x] Testes de estrutura dos routers financeiros
- [x] Testes de validação de input
- [x] Testes de controle de acesso
- [x] Testes de lógica de conciliação (positivo/negativo)

## Módulo ADM ERP

### Painel de Administração
- [x] Novo módulo "ADM ERP" na sidebar (visível apenas para Admin)
- [x] Listagem de todos os usuários com nome, username, permissão e senha visível
- [x] Criar novos usuários com username, senha e nível de acesso
- [x] Editar permissão de usuários existentes
- [x] Resetar/alterar senha de qualquer usuário
- [x] Ativar/desativar usuários

### Login e Troca de Senha
- [x] Opção "Trocar Senha" na tela de login
- [x] Formulário de troca: username, senha atual, nova senha
- [x] Atualizar login master: marceloabreu / Ma@468709

### Schema e Backend
- [x] Campo plainPassword na tabela users (senha em texto para admin ver)
- [x] Router de troca de senha (público, com validação de senha atual)
- [x] Mover gerenciamento de usuários do Configurações para ADM ERP

### Testes
- [x] Testes de troca de senha
- [x] Testes de visibilidade de senhas para admin
- [x] Testes de controle de acesso ao ADM ERP

## Segurança e Privacidade

- [x] Tornar repositório marceloabreujr/domobiancaerp privado
- [x] Tornar repositório mauricarvalho/woocomerce privado
- [x] Verificar outros repositórios públicos

## Migração para Supabase (Independência da Manus)

- [x] Configurar credenciais Supabase (URL, Anon Key, Service Role Key, Database URL)
- [x] Instalar dependências PostgreSQL (postgres, drizzle-orm/postgres-js, @supabase/supabase-js)
- [x] Migrar schema de MySQL para PostgreSQL (drizzle-orm/pg-core)
- [x] Migrar storage de Manus S3 para Supabase Storage
- [x] Atualizar server/db.ts para usar PostgreSQL via Session Pooler
- [x] Atualizar server/storage.ts para usar Supabase Storage
- [x] Fazer push das 34 tabelas para o Supabase
- [x] Criar usuário master (mauri / domobianca2025)
- [x] Popular 12 categorias de suprimentos + 108 itens
- [x] Testar todas as funcionalidades (233/233 testes passando)
- [ ] Atualizar repositório GitHub
