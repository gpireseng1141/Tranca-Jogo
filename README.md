# Tranca — jogo de cartas para 2 jogadores

Projeto full-stack com Vite, React, Express e Socket.IO.

## Requisitos
- Node.js 18+
- npm

## Rodar no Windows
1. Abra a pasta do projeto.
2. Dê duplo clique em `iniciar_jogo.bat`.
3. O navegador abre em `http://localhost:5173`.

Ou no terminal:
```bash
npm install
npm run dev
```
Frontend local: http://localhost:5173  
Servidor multiplayer local: http://localhost:3001/health

## Modos
- **Contra robô:** partida local.
- **Online:** crie uma sala e compartilhe o código de 5 caracteres. O segundo jogador entra pelo mesmo site. Para jogar pela internet, o servidor Socket.IO precisa estar publicado e o frontend configurado com `VITE_SERVER_URL` apontando para o servidor.

## Regras desta versão
- Dois baralhos, sem os Jokers tradicionais.
- O único curinga é o 2, de qualquer naipe.
- No máximo um 2 atuando como curinga por jogo; um 2 natural na posição correta da sequência não conta como curinga.
- Canastra limpa: bônus de 200 pontos. Canastra suja com 2 curinga: bônus de 100 pontos.
- O 2 pode ser descartado e não bloqueia a lixeira.
- Apenas o 3 preto (paus ou espadas) bloqueia a compra da lixeira.
- Se o topo da lixeira for um 2, ele precisa ser encaixado em um jogo com pelo menos duas cartas naturais.
- O 2 curinga pode ser substituído pela carta natural que faltava; depois, permanece na ponta do mesmo jogo e não pode migrar para outra combinação.
- São aceitas trincas/grupos do mesmo valor e sequências do mesmo naipe.

## Build
```bash
npm run build
```

## Render
**Site público:** https://tranca-cartas-online.onrender.com

**Painel do serviço:** https://dashboard.render.com/web/srv-dbv44vlg1s2s73e4of1g
