const express = require("express");
const fetch = require("node-fetch");
const dotenv = require("dotenv");
const socketio = require("socket.io");
const lk = require("./lk");
const http = require("http");
const upload = require("express-fileupload");
const { spawn } = require("child_process");

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: "*" } });

dotenv.config();

app.use(upload());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

const api = process.env.API_WEATHER;

const randomInt = (min, max) => {
  return Math.random() * (max - min) + min;
};

const getApi = (url) =>
  new Promise((resolve, reject) => {
    fetch(url, {
      method: "GET",
    })
      .then((res) => resolve(res.json()))
      .catch((err) => reject(err));
  });

app.get("/", async (req, res) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=indonesia&appid=${api}`;
  const cuaca = await getApi(url);
  res.render("index", { cuaca });
});

app.get("/convert", (req, res) => {
  res.render("speech", { hasil: false });
});

app.post("/convert", (req, res) => {
  if (req.files) {
    const data = req.files.file;
    if (data.mimetype != "audio/mpeg") {
      res.send("Only Accept audio files");
    }
    const nama = randomInt(10000000, 99999999);
    data.mv(nama + ".mp3", (err) => {
      if (err) {
        res.send(err);
      } else {
        const python = spawn("python", ["speech.py", nama]);
        python.stdout.on("data", function (data) {
          res.render("speech", { hasil: data.toString() });
        });
      }
    });
  }
});

app.get("/meme", async (req, res) => {
  const url = "https://api.imgflip.com/get_memes";
  const { data } = await getApi(url);
  res.render("meme", { memes: data.memes });
});

app.get("/lk21/:judul", async (req, res) => {
  const judul = req.params.judul;
  const datas = await lk(judul);
  if (datas == "=> Judul Tidak Ditemukan") {
    res.render("wrong");
  } else {
    res.render("lk", { datas });
  }
});

server.listen("8000", (err) => {
  console.log("listening on http://localhost:8000/");
});

const simi = (msg) =>
  new Promise((resolve, reject) => {
    fetch(`https://simsumi.herokuapp.com/api?text=${msg}&lang=id`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((res) => resolve(res))
      .catch((err) => resolve({ success: "Maaf Kak Server Busy" }));
  });

io.on("connection", (socket) => {
  socket.on("chat", async (data) => {
    io.emit("chatId", data.hasil);
    if (data.msg[0] == "!") {
      const simichan = await simi(data.msg.replace("!", ""));
      const today = new Date();
      let minute = today.getMinutes();
      let second = today.getSeconds();
      minute < 10 ? (minute = "0" + minute) : minute;
      second < 10 ? (second = "0" + second) : second;
      const time = today.getHours() + ":" + minute + ":" + second + " ";
      const msg = `<div class="msgln"><span class="chat-time">${time}</span><b class="user-name">SimiChan: </b>${simichan.success}<br></div>`;
      io.emit("chatId", msg);
    }
  });
});
