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
