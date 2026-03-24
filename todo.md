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
