const express =require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { readdirSync } = require('fs');
const morgan = require("morgan");
require("dotenv").config();



const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(
  http, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-type"]
    }
  }
);


// db
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log("DB CONNECTION ERROR => ", err));

// middlewares
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [process.env.CLIENT_URL],
  })
);


// routes
readdirSync('./routes').map(route => app.use('/api', require(`./routes/${route}`)))

//socket

io.on("connect", ( socket ) => {
  console.log("SOCKET =>",socket)
})


const port = process.env.PORT || 8000;

http.listen(port, () => console.log(`Server running on port ${port}`));