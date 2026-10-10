import express from "express";
import http from "http";
import sqlite from "sqlite3";
import { WebSocketServer } from "ws";

const __dirname = import.meta.dirname;

const server = http.createServer();

const app = express();

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);

server.listen(3000, function () {
  console.log("Server started on port 3000");
});

process.on("SIGINT", () => {
  wss.clients.forEach(function each(client) {
    client.close();
  });
  server.close(() => {
    shutdownDB();
  });
});

/* Begin Websocket */

const wss = new WebSocketServer({ server });

wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
  console.log("Clients connected", numClients);

  wss.broadcast(`Current visitores: ${numClients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send("Welcome to my server");
  }

  db.run(
    `INSERT INTO visitores (count, time) VALUES (${numClients}, datetime('now'))`,
  );

  ws.on("close", function close() {
    wss.broadcast(`Current visitores: ${wss.clients.size}`);
    console.log("A Client hase disconnected");
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
};

/* End Websocket */

/* Begin Database */

const db = new sqlite.Database(":memory:");

db.serialize(() => {
  db.run(`
        CREATE TABLE visitores (
            count INTEGER,
            time TEXT
        ) 
    `);
});

function getCounts() {
  db.each("SELECT * FROM visitores", (error, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  getCounts();
  console.log("Shuting down db");
  db.close();
}
