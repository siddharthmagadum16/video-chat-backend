const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidV4 } = require("uuid");
const cors = require("cors");

app.use(cors());
app.options("*", cors());

app.use(express.json());

const options = {
  cors: true,
  origins: [
    "http://localhost:3000",
    "https://video-chat-heroku-frontend.herokuapp.com/",
    "https://video-chat-frontend-siddharthmagadum16.vercel.app/",
    "https://video-chat-frontend.vercel.app/",
    "https://video-chat-frontend-two.vercel.app/"
    // "*"
  ],
  allowEIO3: true,
};

const io = require("socket.io")(server, options);

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

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
