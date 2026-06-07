# Dungeon Escape 🏰

Um jogo de ação 2D no navegador onde você enfrenta ondas de inimigos em diferentes masmorras. Escolha seu personagem, selecione a dificuldade e escape da dungeon!

---

## 📥 Instalação e Como Rodar

### Pré-requisitos
- Qualquer navegador moderno (Chrome, Firefox, Safari, Edge, etc.)
- Um servidor HTTP simples (o navegador não permite rodar localmente arquivos com certos módulos)

### Usando Python

Você deve possuir Python 3 instalado:

```bash
# 1. Clone o repositório (se ainda não tiver)
git clone <url-do-repositorio>
cd DungeonEscape

# 2. Inicie um servidor HTTP local
python3 -m http.server 8000
```

Depois abra seu navegador e acesse: **`http://localhost:8000/game/`**


## 🎮 Instruções de Uso

### Navegação no Menu

- **Setas do teclado**: navegue entre opções do menu
- **Enter** ou **Space**: confirma a opção selecionada
- **Botão Music**: alterna música de fundo
- **Botão Sound**: alterna efeitos sonoros
- **Botão Alterar Personagem**: abre seletor de personagens

### Durante o Jogo

| Controle | Ação |
|----------|------|
| **W, A, S, D** ou **Setas** | Move o personagem |
| **Espaço** | Atira |
| **Shift** | Executa um dash (movimento rápido) |
| **Esc** ou **P** | Pausa o jogo |

### Objetivo

Sobreviva até o final de cada fase eliminando todos os inimigos que surgem. Complete todas as 5 fases para escapar da dungeon!

---

## 🎭 Componentes do Jogo

### 🗺️ Mapas (Fases)

O jogo possui 5 fases com cenários diferentes:

1. **Pântano** (Fase 1)
   - Primeiro cenário: um pântano sombrio
   - Inimigos: Slimes (se multiplicam)

2. **Catacumba** (Fase 2)
   - Catacumbas antigas e escuras
   - Inimigos: Esqueletos (podem atirar)

3. **Inferno** (Fase 3)
   - Sala flamejante cheia de lava
   - Inimigos: Demônios (podem fazer dash)

4. **Mista** (Fase 4)
   - Combinação de todos os cenários anteriores
   - Inimigos: Slimes, Esqueletos e Demônios (simultaneamente)

5. **Sala do Boss** (Fase 5 - Final)
   - Arena de batalha contra o boss final
   - Inimigos: Boss, Slimes, Esqueletos e Demônios

### 👥 Personagens

Desbloqueie novos personagens conquistando pontos! Cada um tem uma aparência única mas as mesmas mecânicas de jogo.

| Personagem | Pontos Requeridos | Descrição |
|------------|-------------------|-----------|
| **Cowboy** | 0 pts (Padrão) | O guerreiro padrão pronto para escapar |
| **Cowgirl** | 200 pts | Uma mulher corajosa com estilo western |
| **Professor** | 350 pts | Um acadêmico disposto a lutar |
| **Exploradora** | 600 pts | Uma aventureira experiente na dungeon |

### 👹 Inimigos

#### 1. **Slime** (Fase 1)
- **Vida**: 1
- **Velocidade**: Lenta
- **Habilidades**: Nenhuma
- **Dificuldade**: Fácil
- **Pontos**: Pequena quantidade

#### 2. **Esqueleto** (Fase 2)
- **Vida**: 2
- **Velocidade**: Média-Rápida
- **Habilidades**: Atira projéteis no jogador (cada 2.5s, até 350px de distância)
- **Dificuldade**: Média
- **Pontos**: Moderada quantidade

#### 3. **Demônio** (Fase 3)
- **Vida**: 4
- **Velocidade**: Rápida
- **Habilidades**: Executa dashes rápidos em direção ao jogador (a cada 3s)
- **Dificuldade**: Difícil
- **Pontos**: Grande quantidade

#### 4. **Boss** (Fase 5)
- **Vida**: 30 (pode aumentar em dificuldades altas)
- **Velocidade**: Média
- **Habilidades**:
  - Dispara bolas de fogo em padrão (a cada 1.5s)
  - Invoca Slimes menores auxiliares (a cada 8s)
  - Gira em volta do jogador (efeito visual de pulso)
  - Segunda fase ativada quando vida cai para metade
- **Dificuldade**: Muito difícil
- **Pontos**: Bônus especial ao vencer

---

## ⚙️ Modos de Dificuldade e Níveis

### 3 Modos Disponíveis

Escolha sua dificuldade no menu inicial. Cada modo altera:

| Aspecto | Fácil | Normal | Difícil |
|---------|-------|--------|---------|
| **Velocidade dos Inimigos** | 70% | 100% | 140% |
| **Vida dos Inimigos** | 70% | 100% | 150% |
| **Frequência de Spawn** | 120% (mais lento) | 100% | 65% (mais rápido) |

### Como o Spawn de Inimigos Funciona

Cada fase tem um **intervalo de spawn dinâmico** que diminui progressivamente:

| Fase | Intervalo Inicial | Intervalo Mínimo | Inimigos |
|------|-------------------|------------------|----------|
| 1 - Pântano | 4s | 1.5s | Slimes |
| 2 - Catacumba | 3.5s | 1.2s | Esqueletos |
| 3 - Inferno | 3s | 1s | Demônios |
| 4 - Mista | 2.5s | 0.8s | Todos (aleatório) |
| 5 - Boss | 8s | 5s | Boss único |


### Power-ups

Durante o jogo, você pode coletar power-ups que caem dos inimigos derrotados:

- ⭐ **Triple Shot**: Dispara 3 projéteis ao mesmo tempo
- 🛡️ **Shield**: Proteção contra um golpe
- 💨 **Speed**: Aumenta sua velocidade de movimento
- ❤️ **Heart**: Recupera uma vida

---

## 🎮 Cheats e Atalhos de Teclado

Use estes atalhos para ativar cheats durante o jogo (em qualquer momento):

| Atalho | Cheat | Efeito |
|--------|-------|--------|
| **Ctrl+G** | God Mode | Ativa/desativa invencibilidade + Triple Shot automático |
| **Ctrl+Y** | Triple Shot | Ativa/desativa disparo triplo |
| **Ctrl+S** | Skip Phase | Pula para a próxima fase (fase final = vitória) |
| **Ctrl+K** | Kill All | Elimina todos os inimigos da tela |
| **Ctrl+E** | Extra Lives | Adiciona 5 vidas (máximo 20) |

### Notas sobre Cheats

- **God Mode** ativa automaticamente Triple Shot enquanto estiver ativo
- **Triple Shot** pode funcionar independentemente ou junto com outros cheats
- **Skip Phase** respeita a fase final (aciona vitória automática)
- **Kill All** não termina a fase - inimigos continuam aparecer
- **Extra Lives** respeita limite máximo de 20 vidas


---

## 📝 Créditos

Desenvolvido por:
- Luis Henrique de Carvalho Ribeiro
- Rebeca Gabrielle Xavier
- Estefany Licinha

2026

---

Boa sorte, aventureiro! 🗡️

