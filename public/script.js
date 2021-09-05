const socket = io();

let input = document.querySelector(".inputLK");
let movie = document.querySelector(".movie");

let key = "";
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    return;
  }
  key += e.key;
  movie.href = `/lk21/${key}`;
});

movie.addEventListener("click", (e) => {
  input.value = "";
});

function login() {
  if (document.querySelector("#username").value == "") {
    return;
  }
  document.querySelector("#login").style.display = "none";
  document.querySelector("#chat").style.display = "block";
}

const chat = () => {
  const msg = document.querySelector("#usermsg").value;
  const player = document.querySelector("#username").value + ": ";
  const today = new Date();
  let minute = today.getMinutes();
  let second = today.getSeconds();
  minute < 10 ? (minute = "0" + minute) : minute;
  second < 10 ? (second = "0" + second) : second;
  const time = today.getHours() + ":" + minute + ":" + second + " ";

  const hasil = `<div class="msgln"><span class="chat-time">${time}</span><b class="user-name">${player}</b>${stripslashes(
    escapeHtml(msg)
  )}<br></div>`;
  document.querySelector("#usermsg").value = "";
  console.log(hasil);
  socket.emit("chat", { hasil, msg });
};

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

function stripslashes(str) {
  return str.replace(/\\(.)/gm, "$1");
}

socket.on("chatId", (data) => {
  console.log(data);
  let isinow = document.querySelector("#chatbox").innerHTML.trim();
  const chatbox = document.querySelector("#chatbox");
  chatbox.innerHTML = "";
  let isi = document.createElement("div");
  chatbox.appendChild(isi);
  isi.outerHTML = data + isinow;
  console.log("Socket : " + data);
});
