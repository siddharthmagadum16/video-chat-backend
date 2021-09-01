const express = require("express");
const app = express();
const server = require("http").Server(app);
// const { PeerServer } = require('peer');
const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer(server, {
  path: '/peer-server'
});

app.use('/peerjs', peerServer)

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    headers: { "Access-Control-Allow-Origin": true },
  },
});

const { v4: uuidV4 } = require("uuid");
const cors = require("cors");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json(uuidV4());
});

app.get("/:room", (req, res) => {
  res.status(200).json(1);
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log(roomId, " ", userId);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("user-connected", userId);
    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });
  });

  socket.on("new-message", (roomId, message) => {
    console.log(`New message: ${message}`);
    socket.broadcast.to(roomId).emit("chat", message);
  });
});

// const peerServer = PeerServer({ port: 9000, path: '/peer-server' });

const port = process.env.PORT || 4000
server.listen(port,()=>{
  console.log(`server is listening on port ${port}`)
});
