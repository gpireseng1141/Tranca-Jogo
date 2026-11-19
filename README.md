# Tranca — jogo de cartas para 2 jogadores

Projeto full-stack com Vite, React, React Router DOM, Express e Socket.IO.

## Requisitos
- Node.js 18+
- npm

## Rodar no Windows
1. Extraia a pasta.
2. Dê duplo clique em `iniciar_jogo.bat`.
3. O navegador abre em `http://localhost:5173`.

Ou no terminal:
```bash
npm install
npm run dev
```
Frontend: http://localhost:5173
Servidor multiplayer: http://localhost:3001/health

## Modos
- **Contra robô:** funciona localmente, sem conta ou configuração.
- **Online:** clique em Criar sala e compartilhe o código de 5 caracteres. A outra pessoa abre o mesmo site e informa o código. O servidor precisa estar acessível aos dois jogadores; `localhost` só funciona para quem está no mesmo computador. Para jogar pela internet, hospede o servidor Node e o frontend em um serviço público e configure `VITE_SERVER_URL` com a URL do servidor.

## Rotas React
- `/` lobby e seleção de modo
- `/jogar` mesa de jogo
- `/resultado` placar da rodada

## Regras e escopo desta versão
Esta é uma implementação inicial jogável de Tranca para dois jogadores: dois baralhos, quatro curingas, 11 cartas por jogador, dois mortos de 11 cartas, compra, descarte, jogos de cartas do mesmo valor, canastras e pontuação básica. As regras de Tranca variam entre regiões e grupos. Nesta versão, a validação de jogos é simplificada e ainda não cobre todas as regras oficiais/variações (por exemplo, todas as regras de sequência, restrições de descarte, fechamento de lixo e partidas até pontuação-alvo). O robô é uma IA simples de demonstração, não um adversário estratégico avançado.

## Build
```bash
npm run build
```