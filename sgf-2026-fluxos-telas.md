# SGF 2026 — Organização de Telas, Menus e Fluxos

**Cores do Sistema:**
- Primária Escura: HSL(188°, 49%, 12%) → #0F2B2F
- Primária Verde: HSL(160°, 100%, 33%) → #00A86B
- Secundária Menta: HSL(161°, 33%, 60%) → #70C4A8

---

# PARTE 1: APP MOBILE (MOTORISTA)

---

## 1. Estrutura de Navegação

```
┌─────────────────────────────────────────────────────────────┐
│                    BOTTOM NAVIGATION                        │
├───────────────┬───────────────┬───────────────┬─────────────┤
│    🏠 Home    │   🚗 Viagens  │  ⛽ Serviços  │  👤 Perfil  │
└───────────────┴───────────────┴───────────────┴─────────────┘
```

---

## 2. Mapa de Telas

### 2.1 Módulo: Autenticação (Pré-Login)

```
[SPLASH]
    │
    ▼
[LOGIN]
    ├── Campo: CPF (máscara 000.000.000-00)
    ├── Campo: Senha
    ├── Checkbox: Lembrar-me
    ├── Link: Esqueci minha senha
    └── Botão: ENTRAR
            │
            ▼
      [BIOMETRIA] (opcional)
            │
            ▼
        [HOME]
```

### 2.2 Módulo: Home (Tab Principal)

```
[HOME]
├── Header
│   ├── Logo SGF
│   ├── Nome do Motorista
│   └── Ícone de Notificações (badge)
│
├── Card Principal: Status Atual
│   ├── Se SEM veículo vinculado:
│   │   └── Botão Grande: "VINCULAR VEÍCULO" (QR Code)
│   │
│   └── Se COM veículo vinculado:
│       ├── Placa do Veículo
│       ├── Modelo
│       ├── Status: Parado / Em Viagem
│       └── Botão: "INICIAR VIAGEM" ou "VER VIAGEM ATUAL"
│
├── Seção: Ações Rápidas (Grid 2x2)
│   ├── [Abastecimento]
│   ├── [Manutenção]
│   ├── [Checklist]
│   └── [Histórico]
│
└── Seção: Alertas (se houver)
    ├── CNH vencendo em X dias
    ├── Manutenção pendente
    └── etc.
```

### 2.3 Módulo: Vinculação de Veículo

```
[VINCULAR VEÍCULO]
    │
    ├── [SCANNER QR CODE]
    │   ├── Câmera ativa com guia visual
    │   ├── Instrução: "Aponte para o QR Code no painel"
    │   └── Link inferior: "QR Code danificado? Buscar manualmente"
    │           │
    │           ▼
    │       [BUSCA MANUAL]
    │           ├── Campo: Buscar por placa
    │           ├── Filtro: Secretaria
    │           └── Lista de veículos disponíveis
    │
    ▼
[CONFIRMAÇÃO DE VEÍCULO]
    ├── Foto do veículo (se cadastrada)
    ├── Placa
    ├── Modelo / Ano
    ├── Odômetro atual
    ├── Secretaria
    └── Botões: [CANCELAR] [CONFIRMAR VINCULAÇÃO]
            │
            ▼
        [HOME] (com veículo vinculado)
```

### 2.4 Módulo: Viagem

```
[INICIAR VIAGEM]
    │
    ▼
[CHECKLIST PRÉ-VIAGEM]
    ├── Lista de itens por categoria:
    │   ├── 🔧 Motor e Fluidos
    │   │   ├── Nível de óleo ────── [OK] [PROBLEMA] [N/A]
    │   │   └── Água do radiador ─── [OK] [PROBLEMA] [N/A]
    │   ├── 🛞 Pneus e Rodas
    │   │   └── Estado dos pneus ─── [OK] [PROBLEMA] [N/A]
    │   ├── 💡 Iluminação
    │   │   ├── Faróis ───────────── [OK] [PROBLEMA] [N/A]
    │   │   └── Setas ────────────── [OK] [PROBLEMA] [N/A]
    │   ├── 🛡️ Segurança
    │   │   ├── Freio de mão ─────── [OK] [PROBLEMA] [N/A]
    │   │   ├── Triângulo ────────── [OK] [PROBLEMA] [N/A]
    │   │   └── Extintor ─────────── [OK] [PROBLEMA] [N/A]
    │   └── 🚛 Carroceria (se aplicável)
    │       └── Estado geral ─────── [OK] [PROBLEMA] [N/A]
    │
    ├── Se PROBLEMA selecionado:
    │   ├── Campo: Descreva o problema
    │   ├── Botão: Tirar foto (opcional)
    │   └── Se item CRÍTICO:
    │       └── ⚠️ Bloqueio de viagem + Gerar O.S. automática
    │
    └── Botão: CONTINUAR
            │
            ▼
[DEFINIR DESTINO]
    ├── Campo: Destino (autocomplete)
    ├── Lista: Destinos frequentes
    ├── Mapa com preview da rota
    ├── Info: Distância estimada
    ├── Info: Tempo estimado
    └── Botão: INICIAR VIAGEM
            │
            ▼
[VIAGEM EM ANDAMENTO]
    ├── Mapa (60% da tela)
    │   ├── Posição atual
    │   ├── Rota traçada
    │   └── Destino marcado
    │
    ├── Card inferior (40% da tela)
    │   ├── Velocidade atual: XX km/h
    │   ├── Tempo decorrido: 00:00:00
    │   ├── Km rodados: XX.X km
    │   └── Destino: [Nome]
    │
    ├── Botão Flutuante: PARADA
    │       │
    │       ▼
    │   [MODAL: REGISTRAR PARADA]
    │       ├── Tipo: [Refeição] [Carga/Descarga] [Emergência] [Pessoal]
    │       ├── Campo: Observação (opcional)
    │       └── Botões: [CANCELAR] [CONFIRMAR PARADA]
    │               │
    │               ▼
    │       [VIAGEM PAUSADA]
    │           ├── Cronômetro de parada
    │           └── Botão: RETOMAR VIAGEM
    │
    └── Botão: FINALIZAR VIAGEM
            │
            ▼
[RESUMO DA VIAGEM]
    ├── ✅ Viagem concluída!
    ├── Destino: [Nome]
    ├── Distância percorrida: XX.X km
    ├── Tempo total: 00:00:00
    ├── Odômetro final: XXXXX km
    ├── Consumo estimado: X.X L
    │
    ├── Campo: Odômetro atual (confirmar/corrigir)
    │
    └── Botões: [NOVA VIAGEM] [VOLTAR AO INÍCIO]
            │
            ▼
        [HOME]
```

### 2.5 Módulo: Viagens (Tab)

```
[VIAGENS]
├── Header: "Minhas Viagens"
│
├── Filtros
│   ├── Período: [Hoje] [Semana] [Mês] [Personalizado]
│   └── Veículo: [Todos] [Dropdown]
│
└── Lista de Viagens
    └── Card de Viagem
        ├── Data/Hora
        ├── Origem → Destino
        ├── Distância | Duração
        ├── Veículo (placa)
        └── Status: Concluída / Em andamento
                │
                ▼ (ao clicar)
        [DETALHES DA VIAGEM]
            ├── Mapa com rota percorrida
            ├── Informações completas
            ├── Paradas realizadas
            └── Checklist realizado
```

### 2.6 Módulo: Serviços (Tab)

```
[SERVIÇOS]
├── Header: "Serviços"
│
├── Card: Abastecimento
│   └── → [REGISTRAR ABASTECIMENTO]
│
├── Card: Manutenção
│   └── → [SOLICITAR MANUTENÇÃO]
│
└── Card: Histórico de Serviços
    └── → [HISTÓRICO]
```

#### Fluxo de Abastecimento:

```
[REGISTRAR ABASTECIMENTO]
    │
    ├── Veículo vinculado: [Placa] (automático)
    │
    ├── Etapa 1: Dados
    │   ├── Campo: Odômetro atual *
    │   ├── Campo: Litros abastecidos *
    │   ├── Campo: Valor total (R$) *
    │   ├── Campo: Tipo de combustível * [Diesel] [Gasolina] [Etanol]
    │   └── Campo: Posto/Fornecedor (autocomplete ou novo)
    │
    ├── Etapa 2: Foto do Painel *
    │   ├── Câmera com guia visual
    │   ├── Instrução: "Fotografe o painel mostrando o odômetro"
    │   └── Preview da foto tirada
    │
    ├── Etapa 3: Foto da Nota/Requisição *
    │   ├── Câmera com guia visual
    │   ├── Instrução: "Fotografe a nota fiscal ou requisição"
    │   └── Preview da foto tirada
    │
    └── Etapa 4: Confirmação
        ├── Resumo dos dados
        ├── Thumbnails das fotos
        ├── Km/L calculado (se houver abastecimento anterior)
        │   └── ⚠️ Alerta se fora da faixa esperada
        └── Botão: CONFIRMAR ABASTECIMENTO
                │
                ▼
        [SUCESSO]
            └── "Abastecimento registrado com sucesso!"
```

#### Fluxo de Manutenção:

```
[SOLICITAR MANUTENÇÃO]
    │
    ├── Veículo: [Placa] (automático se vinculado)
    │
    ├── Campo: Categoria *
    │   └── [Mecânica] [Elétrica] [Pneus] [Carroceria] [Emergência]
    │
    ├── Campo: Descrição do problema *
    │   └── Textarea com placeholder de exemplo
    │
    ├── Campo: Urgência *
    │   └── Slider 1-5 (Baixa → Crítica)
    │
    ├── Seção: Fotos (opcional)
    │   ├── Botão: Adicionar foto
    │   └── Grid de fotos adicionadas (até 5)
    │
    └── Botão: ENVIAR SOLICITAÇÃO
            │
            ▼
    [SUCESSO]
        ├── "Solicitação #XXX enviada!"
        └── "Aguarde a análise do gestor"
```

### 2.7 Módulo: Perfil (Tab)

```
[PERFIL]
├── Header com foto/avatar
│   ├── Nome do Motorista
│   └── Matrícula
│
├── Seção: Dados Pessoais
│   ├── CPF: XXX.XXX.XXX-XX
│   ├── Telefone: (XX) XXXXX-XXXX
│   └── Email: xxxx@prefeitura.gov.br
│
├── Seção: CNH
│   ├── Número: XXXXXXXXXXX
│   ├── Categoria: X
│   ├── Validade: DD/MM/AAAA
│   └── Status: [Válida] ou [⚠️ Vence em X dias]
│
├── Seção: Estatísticas
│   ├── Total de viagens: XXX
│   ├── Km percorridos: X.XXX km
│   └── Score: ⭐ X.X / 5.0
│
├── Seção: Configurações
│   ├── Notificações → [Toggle]
│   ├── Biometria → [Toggle]
│   └── Alterar senha → [TELA]
│
└── Botão: SAIR
```

---

## 3. Fluxos Completos do App

### Fluxo Principal: Jornada Completa do Motorista

```
┌─────────┐     ┌─────────┐     ┌───────────┐     ┌─────────┐
│  LOGIN  │ ──▶ │  HOME   │ ──▶ │  VINCULAR │ ──▶ │CHECKLIST│
└─────────┘     └─────────┘     │  VEÍCULO  │     └────┬────┘
                                └───────────┘          │
                                                       ▼
┌─────────┐     ┌─────────┐     ┌───────────┐     ┌─────────┐
│  HOME   │ ◀── │ RESUMO  │ ◀── │  VIAGEM   │ ◀── │ DESTINO │
└─────────┘     └─────────┘     │EM ANDAMENTO│     └─────────┘
                                └───────────┘
```

### Fluxo de Abastecimento Durante Viagem

```
[VIAGEM EM ANDAMENTO]
        │
        ▼ (Menu ou Botão)
[REGISTRAR ABASTECIMENTO]
        │
        ▼
[PARADA AUTOMÁTICA REGISTRADA]
        │
        ▼ (após confirmar)
[VIAGEM EM ANDAMENTO] (retoma)
```

---

# PARTE 2: PAINEL WEB (GESTOR)

---

## 4. Estrutura de Navegação

```
┌──────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                   │
│  ┌──────┐                                        ┌────┐ ┌────┐ ┌────────┐│
│  │ LOGO │  SGF 2026                              │🔔  │ │ ❓ │ │ Usuário││
│  └──────┘                                        └────┘ └────┘ └────────┘│
├────────────────┬─────────────────────────────────────────────────────────┤
│   SIDEBAR      │                    CONTEÚDO PRINCIPAL                   │
│                │                                                          │
│  📊 Dashboard  │                                                          │
│  🗺️ Mapa       │                                                          │
│  ──────────    │                                                          │
│  🚗 Veículos   │                                                          │
│  👤 Motoristas │                                                          │
│  ──────────    │                                                          │
│  🛣️ Viagens    │                                                          │
│  ⛽ Abastec.   │                                                          │
│  🔧 Manutenção │                                                          │
│  ──────────    │                                                          │
│  📈 Relatórios │                                                          │
│  ⚙️ Config.    │                                                          │
│                │                                                          │
└────────────────┴─────────────────────────────────────────────────────────┘
```

---

## 5. Mapa de Telas

### 5.1 Login

```
[LOGIN]
├── Logo centralizado
├── Título: "Painel de Gestão"
├── Campo: Email institucional
├── Campo: Senha
├── Botão: ENTRAR
│       │
│       ▼
│   [2FA - VERIFICAÇÃO]
│       ├── Instrução: "Digite o código do autenticador"
│       ├── Campo: Código (6 dígitos)
│       └── Botão: VERIFICAR
│               │
│               ▼
│           [DASHBOARD]
│
└── Link: Esqueci minha senha
```

### 5.2 Dashboard

```
[DASHBOARD]
├── Breadcrumb: Home > Dashboard
│
├── Seção: KPIs (4 cards em linha)
│   ├── Card 1: Veículos na Rua
│   │   ├── Número grande: XX
│   │   ├── Subtítulo: "de XX total"
│   │   └── Ícone: 🚗
│   │
│   ├── Card 2: Gasto Combustível (Mês)
│   │   ├── Número grande: R$ XX.XXX
│   │   ├── Variação: ▲ +X% vs mês anterior
│   │   └── Ícone: ⛽
│   │
│   ├── Card 3: Em Manutenção
│   │   ├── Número grande: XX
│   │   ├── Subtítulo: "veículos parados"
│   │   └── Ícone: 🔧
│   │
│   └── Card 4: Km Rodados (Mês)
│       ├── Número grande: XX.XXX
│       ├── Subtítulo: "quilômetros"
│       └── Ícone: 🛣️
│
├── Seção: Gráficos (2 colunas)
│   ├── Gráfico 1 (60%): Evolução de Gastos
│   │   ├── Tipo: Linha
│   │   ├── Período: Últimos 6 meses
│   │   └── Filtro: [Combustível] [Manutenção] [Total]
│   │
│   └── Gráfico 2 (40%): Distribuição por Secretaria
│       ├── Tipo: Pizza/Donut
│       └── Legenda: Secretarias com valores
│
├── Seção: Alertas Ativos
│   ├── Lista de alertas com badges de prioridade
│   │   ├── 🔴 CNH vencida - João Silva
│   │   ├── 🟡 Manutenção pendente - ABC-1234
│   │   └── 🟡 Consumo anômalo - XYZ-5678
│   └── Link: Ver todos os alertas
│
└── Seção: Atividade Recente
    ├── Tabela com últimas ações
    │   ├── Hora | Motorista | Ação | Veículo
    │   ├── 14:32 | Maria Santos | Iniciou viagem | ABC-1234
    │   ├── 14:28 | João Silva | Finalizou viagem | XYZ-5678
    │   └── 14:15 | Pedro Lima | Abasteceu | DEF-9012
    └── Link: Ver histórico completo
```

### 5.3 Mapa de Rastreamento

```
[MAPA]
├── Breadcrumb: Home > Mapa
│
├── Header da página
│   ├── Título: "Rastreamento em Tempo Real"
│   ├── Badge: "● XX veículos ativos"
│   └── Filtros inline:
│       ├── Secretaria: [Todas ▼]
│       ├── Status: [Todos ▼] [Em movimento] [Parado] [Desligado]
│       └── Buscar: [Placa ou motorista]
│
├── Mapa (área principal)
│   ├── Visualização fullscreen com controles
│   ├── Pins coloridos por status:
│   │   ├── 🟢 Verde: Em movimento
│   │   ├── 🔵 Azul: Parado (motor ligado)
│   │   ├── ⚫ Cinza: Desligado
│   │   └── 🔴 Vermelho: Alerta
│   │
│   └── Ao clicar no pin:
│       └── Popup com:
│           ├── Placa
│           ├── Motorista
│           ├── Velocidade
│           ├── Última atualização
│           └── Botão: "Ver detalhes"
│
└── Sidebar lateral (retrátil)
    ├── Lista de veículos ativos
    │   └── Card resumido por veículo
    │       ├── Placa | Status
    │       ├── Motorista
    │       └── Destino atual
    │
    └── Ao selecionar veículo:
        └── Painel de detalhes
            ├── Informações do veículo
            ├── Informações do motorista
            ├── Viagem atual (destino, tempo, km)
            ├── Histórico de posições (timeline)
            └── Botão: "Ver rota completa"
```

### 5.4 Gestão de Veículos

```
[VEÍCULOS]
├── Breadcrumb: Home > Veículos
│
├── Header da página
│   ├── Título: "Gestão de Veículos"
│   ├── Subtítulo: "XX veículos cadastrados"
│   └── Botão: "+ NOVO VEÍCULO"
│
├── Barra de filtros
│   ├── Buscar: [Placa, modelo...]
│   ├── Secretaria: [Todas ▼]
│   ├── Status: [Todos ▼]
│   └── Tipo: [Todos ▼]
│
├── Tabela de veículos
│   ├── Colunas: [☐] | Placa | Modelo | Ano | Secretaria | Odômetro | Status | Ações
│   ├── Linha exemplo:
│   │   ├── [☐] ABC-1234 | Fiat Strada | 2022 | Obras | 45.230 km | 🟢 Disponível | [👁️] [✏️]
│   │   └── Expandir: Detalhes rápidos inline
│   │
│   └── Paginação: < 1 2 3 ... 10 >
│
└── Ações em lote (quando selecionados)
    └── [Exportar] [Alterar status] [Gerar relatório]
```

#### Modal: Novo/Editar Veículo

```
[MODAL: VEÍCULO]
├── Título: "Novo Veículo" ou "Editar Veículo"
│
├── Abas: [Dados Gerais] [Documentos] [Configurações]
│
├── Aba: Dados Gerais
│   ├── Placa *
│   ├── Renavam
│   ├── Chassi
│   ├── Marca *
│   ├── Modelo *
│   ├── Ano *
│   ├── Cor
│   ├── Tipo de combustível *
│   ├── Capacidade do tanque (L) *
│   ├── Odômetro atual *
│   └── Secretaria *
│
├── Aba: Documentos
│   ├── Upload: CRLV
│   ├── Upload: Seguro
│   └── Upload: Outros
│
├── Aba: Configurações
│   ├── Intervalo troca de óleo (km)
│   └── Consumo médio esperado (km/L)
│
└── Botões: [CANCELAR] [SALVAR]
```

#### Tela: Detalhes do Veículo

```
[VEÍCULO: ABC-1234]
├── Breadcrumb: Home > Veículos > ABC-1234
│
├── Header
│   ├── Foto do veículo (se houver)
│   ├── Placa grande
│   ├── Modelo | Ano
│   ├── Status badge
│   └── Botões: [EDITAR] [QR CODE] [DESATIVAR]
│
├── Cards de resumo (3 colunas)
│   ├── Odômetro atual: XX.XXX km
│   ├── Última viagem: DD/MM/AAAA
│   └── Próxima manutenção: em X.XXX km
│
├── Abas: [Histórico] [Viagens] [Abastecimentos] [Manutenções] [Documentos]
│
├── Aba: Histórico (timeline)
│   └── Lista cronológica de eventos
│
├── Aba: Viagens
│   └── Tabela de viagens realizadas
│
├── Aba: Abastecimentos
│   └── Tabela com consumo e custos
│
├── Aba: Manutenções
│   └── Histórico de manutenções
│
└── Aba: Documentos
    └── Lista de documentos anexados
```

### 5.5 Gestão de Motoristas

```
[MOTORISTAS]
├── Breadcrumb: Home > Motoristas
│
├── Header da página
│   ├── Título: "Gestão de Motoristas"
│   ├── Subtítulo: "XX motoristas ativos"
│   └── Botão: "+ NOVO MOTORISTA"
│
├── Barra de filtros
│   ├── Buscar: [Nome, CPF...]
│   ├── Secretaria: [Todas ▼]
│   ├── Status: [Todos ▼]
│   └── CNH: [Todas ▼] [Válida] [Vencendo] [Vencida]
│
├── Tabela de motoristas
│   ├── Colunas: [☐] | Nome | CPF | CNH | Validade | Secretaria | Score | Status | Ações
│   └── Linha com indicadores visuais para CNH
│
└── Cards alternativos (toggle view)
    └── Grid de cards com foto e resumo
```

#### Tela: Detalhes do Motorista

```
[MOTORISTA: João Silva]
├── Breadcrumb: Home > Motoristas > João Silva
│
├── Header
│   ├── Foto/Avatar
│   ├── Nome
│   ├── Matrícula | Secretaria
│   └── Botões: [EDITAR] [SUSPENDER]
│
├── Cards de resumo
│   ├── CNH: Categoria X | Validade: DD/MM/AAAA
│   ├── Viagens realizadas: XXX
│   ├── Km percorridos: XX.XXX
│   └── Score: ⭐ X.X / 5.0
│
├── Abas: [Viagens] [Abastecimentos] [Ocorrências] [Documentos]
│
└── Conteúdo das abas (similar ao veículo)
```

### 5.6 Viagens

```
[VIAGENS]
├── Breadcrumb: Home > Viagens
│
├── Header
│   ├── Título: "Registro de Viagens"
│   └── Botões de visualização: [Lista] [Calendário]
│
├── Filtros avançados
│   ├── Período: [De] [Até]
│   ├── Secretaria: [Todas ▼]
│   ├── Veículo: [Todos ▼]
│   ├── Motorista: [Todos ▼]
│   ├── Status: [Todos ▼]
│   └── Flags: [☐ Apenas com anomalias]
│
├── Tabela de viagens
│   ├── Colunas: Data | Motorista | Veículo | Origem → Destino | Km | Duração | Status | Ações
│   └── Indicador de anomalia (ícone de alerta)
│
└── Ao clicar: [DETALHES DA VIAGEM]
    ├── Mapa com rota percorrida
    ├── Timeline de eventos
    ├── Dados completos
    └── Checklist realizado
```

### 5.7 Abastecimentos

```
[ABASTECIMENTOS]
├── Breadcrumb: Home > Abastecimentos
│
├── Header
│   ├── Título: "Controle de Abastecimentos"
│   └── Cards resumo:
│       ├── Total do mês: R$ XX.XXX
│       ├── Litros do mês: X.XXX L
│       └── Média km/L: X.X
│
├── Filtros
│   ├── Período: [De] [Até]
│   ├── Veículo: [Todos ▼]
│   ├── Motorista: [Todos ▼]
│   ├── Fornecedor: [Todos ▼]
│   └── Flags: [☐ Apenas anomalias] [☐ Pendentes validação]
│
├── Tabela
│   ├── Colunas: Data | Veículo | Motorista | Litros | Valor | Km/L | Status | Ações
│   ├── Status: ✅ Validado | ⏳ Pendente | ⚠️ Anomalia
│   └── Ações: [👁️ Ver] [✓ Validar] [✗ Rejeitar]
│
└── Ao clicar: [DETALHES DO ABASTECIMENTO]
    ├── Dados completos
    ├── Fotos (painel e nota)
    ├── Localização no mapa
    ├── Cálculo de consumo
    └── Se anomalia: Detalhes do problema
```

### 5.8 Manutenções

```
[MANUTENÇÕES]
├── Breadcrumb: Home > Manutenções
│
├── Header
│   └── Título: "Gestão de Manutenções"
│
├── Kanban de status
│   ├── Coluna: Aguardando Análise (XX)
│   │   └── Cards de solicitação
│   │
│   ├── Coluna: Aprovadas (XX)
│   │   └── Cards aprovados
│   │
│   ├── Coluna: Em Andamento (XX)
│   │   └── Cards em execução
│   │
│   └── Coluna: Concluídas (XX)
│       └── Cards finalizados
│
├── Alternativa: Visualização em tabela
│
└── Ao clicar no card: [DETALHES DA MANUTENÇÃO]
    ├── Informações do veículo
    ├── Descrição do problema
    ├── Fotos anexadas
    ├── Timeline de status
    ├── Custos (estimado vs real)
    └── Ações: [APROVAR] [REJEITAR] [ATUALIZAR STATUS]
```

### 5.9 Relatórios

```
[RELATÓRIOS]
├── Breadcrumb: Home > Relatórios
│
├── Grid de relatórios disponíveis
│   ├── Card: Consumo de Combustível
│   │   ├── Descrição breve
│   │   └── Botão: GERAR
│   │
│   ├── Card: Viagens por Período
│   │   ├── Descrição breve
│   │   └── Botão: GERAR
│   │
│   ├── Card: Manutenções Realizadas
│   │   ├── Descrição breve
│   │   └── Botão: GERAR
│   │
│   ├── Card: Anomalias e Flags
│   │   ├── Descrição breve
│   │   └── Botão: GERAR
│   │
│   ├── Card: Custos por Secretaria
│   │   ├── Descrição breve
│   │   └── Botão: GERAR
│   │
│   └── Card: Relatório para Tribunal de Contas
│       ├── Descrição breve
│       └── Botão: GERAR
│
└── Ao clicar GERAR: [MODAL DE CONFIGURAÇÃO]
    ├── Período: [De] [Até]
    ├── Filtros específicos do relatório
    ├── Formato: [PDF] [Excel] [CSV]
    └── Botões: [CANCELAR] [GERAR RELATÓRIO]
            │
            ▼
    [PREVIEW/DOWNLOAD]
```

### 5.10 Configurações

```
[CONFIGURAÇÕES]
├── Breadcrumb: Home > Configurações
│
├── Menu lateral de configurações
│   ├── Geral
│   ├── Manutenção Preventiva
│   ├── Alertas
│   ├── Checklists
│   ├── Usuários
│   └── Integrações
│
├── Seção: Geral
│   ├── Nome da instituição
│   ├── Logo
│   └── Fuso horário
│
├── Seção: Manutenção Preventiva
│   ├── Intervalo troca de óleo (km): [____]
│   ├── Intervalo troca de óleo (meses): [____]
│   ├── Intervalo rodízio de pneus (km): [____]
│   └── Intervalo revisão geral (km): [____]
│
├── Seção: Alertas
│   ├── CNH - Alertar X dias antes: [____]
│   ├── CRLV - Alertar X dias antes: [____]
│   └── Tempo máximo de parada (min): [____]
│
├── Seção: Checklists
│   ├── Obrigatório antes da viagem: [Toggle]
│   ├── Bloquear viagem se item crítico: [Toggle]
│   └── Gerenciar templates: [EDITAR]
│
├── Seção: Usuários
│   └── Tabela CRUD de usuários do painel
│
└── Seção: Integrações
    ├── Google Maps API Key
    ├── Firebase
    └── Sistemas externos
```

---

## 6. Fluxos Principais do Painel

### Fluxo: Aprovar Manutenção

```
[DASHBOARD]
    │ (Clique em alerta ou menu)
    ▼
[MANUTENÇÕES]
    │ (Kanban: coluna "Aguardando")
    ▼
[CARD DA SOLICITAÇÃO]
    │ (Clique)
    ▼
[MODAL: DETALHES]
    ├── Revisar informações
    ├── Ver fotos
    ├── Adicionar observação
    └── Botões: [APROVAR] [REJEITAR]
            │
            ▼
    [CONFIRMAÇÃO]
        │
        ▼
    [CARD MOVE PARA PRÓXIMA COLUNA]
```

### Fluxo: Validar Abastecimento com Anomalia

```
[DASHBOARD]
    │ (Alerta de anomalia)
    ▼
[ABASTECIMENTOS] (filtro: anomalias)
    │
    ▼
[LINHA COM FLAG]
    │ (Clique em detalhes)
    ▼
[MODAL: DETALHES]
    ├── Ver dados reportados
    ├── Ver fotos (painel + nota)
    ├── Ver localização
    ├── Ver cálculo de consumo
    ├── Comparar com histórico do veículo
    └── Decisão:
        ├── [VALIDAR MESMO ASSIM] → Justificativa obrigatória
        └── [REJEITAR] → Motivo obrigatório
```

### Fluxo: Gerar Relatório para Auditoria

```
[RELATÓRIOS]
    │
    ▼
[CARD: Tribunal de Contas]
    │ (Clique em GERAR)
    ▼
[MODAL: CONFIGURAÇÃO]
    ├── Período: Último trimestre
    ├── Incluir: [✓] Viagens [✓] Abastecimentos [✓] Manutenções
    ├── Formato: PDF
    └── [GERAR]
            │
            ▼
    [LOADING: Gerando relatório...]
            │
            ▼
    [PREVIEW DO PDF]
        └── Botões: [DOWNLOAD] [ENVIAR POR EMAIL]
```

---

## 7. Estados e Feedbacks

### Estados dos Componentes

```
BOTÕES:
├── Default: Fundo verde (#00A86B), texto branco
├── Hover: Fundo mais escuro
├── Loading: Spinner + texto "Aguarde..."
├── Disabled: Fundo cinza, cursor not-allowed
└── Secundário: Borda verde, fundo transparente

INPUTS:
├── Default: Borda cinza clara
├── Focus: Borda verde (#00A86B), shadow
├── Error: Borda vermelha, mensagem abaixo
├── Success: Borda verde, ícone ✓
└── Disabled: Fundo cinza claro

CARDS:
├── Default: Fundo branco, sombra leve
├── Hover: Sombra mais pronunciada
├── Selected: Borda verde
└── Alert: Borda laranja ou vermelha

TABELAS:
├── Header: Fundo escuro (#0F2B2F), texto branco
├── Linha par: Fundo branco
├── Linha ímpar: Fundo cinza muito claro
├── Hover: Fundo menta claro (#70C4A8 com 10% opacity)
└── Selecionada: Fundo verde claro
```

### Mensagens de Feedback

```
TOAST NOTIFICATIONS:
├── Sucesso: Fundo verde, ícone ✓
│   └── "Operação realizada com sucesso!"
├── Erro: Fundo vermelho, ícone ✗
│   └── "Erro ao processar. Tente novamente."
├── Warning: Fundo amarelo, ícone ⚠
│   └── "Atenção: dados incompletos"
└── Info: Fundo azul, ícone ℹ
    └── "Sincronizando dados..."

MODAIS DE CONFIRMAÇÃO:
├── Ações destrutivas: "Tem certeza que deseja excluir?"
├── Ações importantes: "Confirmar aprovação?"
└── Botões: [CANCELAR] [CONFIRMAR]

EMPTY STATES:
├── Nenhum dado: Ilustração + "Nenhum registro encontrado"
├── Filtro vazio: "Nenhum resultado para os filtros aplicados"
└── Primeiro uso: "Cadastre seu primeiro veículo"
```

---

## 8. Responsividade

### Breakpoints

```
MOBILE:     < 640px   (App nativo)
TABLET:     640px - 1024px
DESKTOP:    > 1024px
WIDE:       > 1440px
```

### Adaptações do Painel

```
TABLET (640px - 1024px):
├── Sidebar: Colapsada (apenas ícones)
├── Dashboard: KPIs em 2x2
├── Tabelas: Scroll horizontal
└── Modais: Fullscreen

DESKTOP (> 1024px):
├── Sidebar: Expandida
├── Dashboard: KPIs em linha
├── Tabelas: Todas as colunas
└── Modais: Centralizados com overlay
```

---

**Documento de Fluxos e Telas — SGF 2026**
