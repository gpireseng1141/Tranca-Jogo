import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createGame, publicState, applyAction, startNextHand } from "../shared/game.js";

const app = express();
app.use(cors());
app.get("/health", (_req, res) => res.json({ ok: true, service: "tranca-server" }));

// Em produção, o próprio servidor entrega o site compilado.
const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const distDir = resolve(rootDir, "dist");
if (existsSync(resolve(distDir, "index.html"))) {
  app.use(express.static(distDir));
  app.get("*", (_req, res) => res.sendFile(resolve(distDir, "index.html")));
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
  pingInterval: 25000,
  pingTimeout: 20000
});

const rooms = new Map();
function roomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do { code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""); }
  while (rooms.has(code));
  return code;
}
function emitRoom(room) {
  for (const player of room.players) {
    const socket = io.sockets.sockets.get(player.socketId);
    if (socket) socket.emit("room:state", {
      code: room.code,
      players: room.players.map(({ name, connected }) => ({ name, connected })),
      state: publicState(room.game, player.seat)
    });
  }
}
io.on("connection", (socket) => {
  socket.on("room:create", ({ name }, callback = () => {}) => {
    const code = roomCode();
    const room = { code, players: [{ socketId: socket.id, name: cleanName(name), seat: 0, connected: true }], game: null };
    rooms.set(code, room); socket.join(code);
    callback({ ok: true, code, seat: 0 }); emitRoom(room);
  });
  socket.on("room:join", ({ code, name }, callback = () => {}) => {
    const room = rooms.get(String(code || "").trim().toUpperCase());
    if (!room) return callback({ ok: false, error: "Sala não encontrada." });
    if (room.players.length >= 2) return callback({ ok: false, error: "Esta sala já está completa." });
    if (room.game) return callback({ ok: false, error: "A partida já começou." });
    const seat = 1;
    room.players.push({ socketId: socket.id, name: cleanName(name), seat, connected: true });
    socket.join(room.code); room.game = createGame([room.players[0].name, room.players[1].name]);
    callback({ ok: true, code: room.code, seat }); emitRoom(room);
  });
  socket.on("game:action", ({ code, action }, callback = () => {}) => {
    const room = rooms.get(String(code || "").toUpperCase());
    const player = room?.players.find((p) => p.socketId === socket.id);
    if (!room || !player || !room.game) return callback({ ok: false, error: "Partida não encontrada." });
    const result = applyAction(room.game, player.seat, action);
    if (!result.ok) return callback(result);
    room.game = result.game; emitRoom(room); callback({ ok: true });
  });
  socket.on("game:next-hand", ({ code }, callback = () => {}) => {
    const room = rooms.get(String(code || "").toUpperCase());
    const player = room?.players.find((p) => p.socketId === socket.id);
    if (!room || !player || !room.game || room.game.status !== "finished") return callback({ ok: false, error: "A rodada ainda não terminou." });
    room.game = startNextHand(room.game); emitRoom(room); callback({ ok: true });
  });
  socket.on("disconnect", () => {
    for (const [code, room] of rooms) {
      const player = room.players.find((p) => p.socketId === socket.id);
      if (player) {
        player.connected = false; emitRoom(room);
        setTimeout(() => {
          const current = rooms.get(code);
          if (current && current.players.some((p) => p.socketId === socket.id && !p.connected)) {
            rooms.delete(code);
            for (const p of current.players) io.to(p.socketId).emit("room:closed", "A sala foi encerrada por desconexão.");
          }
        }, 120000);
      }
    }
  });
});
function cleanName(value) { return String(value || "Jogador").trim().slice(0, 18) || "Jogador"; }
const PORT = Number(process.env.PORT || 3001);
httpServer.listen(PORT, "0.0.0.0", () => console.log(`Servidor Tranca ativo na porta ${PORT}`));