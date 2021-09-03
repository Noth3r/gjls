const express = require("express");
const fetch = require("node-fetch");
const dotenv = require("dotenv").config();
const lk = require("./lk");

const app = express();
const api = process.env.API_WEATHER;
console.log(api);
app.set("view engine", "ejs");

const getApi = (url) =>
  new Promise((resolve, reject) => {
    fetch(url, {
      method: "GET",
    })
      .then((res) => resolve(res.json()))
      .catch((err) => reject(err));
  });

app.get("/", async (req, res) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=indonesia&appid=${api}&lang=id`;
  const cuaca = await getApi(url);
  console.log(cuaca);
  res.render("index", { cuaca });
}); //Home

app.get("/meme", async (req, res) => {
  const url = "https://api.imgflip.com/get_memes";
  const { data } = await getApi(url);
  res.render("meme", { memes: data.memes });
});

app.get("/lk21/:judul", async (req, res) => {
  const judul = req.params.judul;
  console.log(judul);
  const datas = await lk(judul);
  if (datas == "=> Judul Tidak Ditemukan") {
    res.render("wrong");
  } else {
    res.render("lk", { datas });
  }
});

app.listen("3000", (err) => {
  console.log("listening on http://localhost:3000/");
});
