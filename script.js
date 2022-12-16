import express from "express";
import * as http from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = http.createServer(app, { allowHalfOpen: true });
const socketIo = new Server(httpServer, {
  origin: ":",
  cors: {
    origin: "*",
  },
  serveClient: true,
});

var clients = [];

socketIo.on("connection", (clientSocket) => {
  console.log(`User connected with socket id: ${clientSocket.id}`);
  // Écouter les événements de nouveau message des utilisateurs
  

  

  clientSocket.on("disconnect", () => {
    console.log("user disconnected");
    clients.splice(clients.indexOf(clientSocket.id), 1);
    clients.forEach((client) => {
      socketIo.to(client).emit("userDisconnect", clientSocket.id);
    });
  });

  clientSocket.on("clientList", (id) => {
    clients.push(id);

    clientSocket.emit("getClientList", clients);

    clients.forEach((client) => {
      if (client != id) {
        socketIo.to(client).emit("newUser", id);
      }
    });
  });

  clientSocket.on("entrant", (id, message) => {
    console.log(id + " " + message);
    // Send the message to all connected clients, except for the client that sent the message
    clients.forEach((client) => {
      if (client != id) {
        // Include the client's ID in the message that is sent
        socketIo.to(client).emit("sortant", id, message);
      }
    });
  });

});

// Configurer la route d'accueil pour servir le fichier HTML
app.use(express.static("./"));

// Écouter les connexions sur le port 3000
httpServer.listen(3000);
