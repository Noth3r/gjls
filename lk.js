const fetch = require("node-fetch");
const cheerio = require("cheerio");
const readline = require("readline-sync");

function getString(start, end, all) {
  const regex = new RegExp(`${start}(.*?)${end}`);
  const str = all;
  const result = regex.exec(str);
  return result;
}

const getSlug = (judul) =>
  new Promise((resolve, reject) => {
    const ip = "http://149.56.24.226/";
    fetch(`${ip}?s=${judul}`, {
      method: "GET",
    })
      .then((res) => res.text())
      .then((data) => {
        const $ = cheerio.load(data);
        let judul = $('h2 > a[rel="bookmark"]').attr("href");
        if (judul == undefined) {
          resolve("Judul Tidak Ditemukan");
        }
        judul = getString(ip, "/", judul)[1];
        resolve(judul);
      })
      .catch((e) => reject(e));
  });

const getUrl = (slug) =>
  new Promise((resolve, reject) => {
    fetch(`http://dl.sharemydrive.xyz/verifying.php?slug=${slug}`, {
      method: "POST",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        slug: slug,
      },
    })
      .then((res) => res.text())
      .then(async (data) => {
        const $ = cheerio.load(data);
        const list = $("tr > td > strong")
          .toArray()
          .map((element) => $(element).text());
        const link1080 = $('[class="btnx btn-1080"]')
          .toArray()
          .map((element) => $(element).attr("href"));
        let res = [];
        for (let i = 0; i < list.length; i++) {
          let judul = {};
          if (list[i] == "Google Drive") {
            const data = await gdrive(list[i], link1080[i]);
            res.push(data["result"]);
            judul["source"] = list[i];
            judul["link"] = data["linkS"];
          } else {
            judul["source"] = list[i];
            judul["link"] = link1080[i];
          }
          res.push(judul);
        }
        resolve(res);
      })
      .catch((e) => reject(e));
  });

const gdrive = (judul, link) =>
  new Promise((resolve, reject) => {
    const linkS = `http:${link}`;
    fetch(linkS, {
      method: "GET",
    })
      .then((res) => res.text())
      .then((data) => {
        const $ = cheerio.load(data);
        let result = [];
        const links = $('a[target="_blank"]')
          .toArray()
          .map((el) => {
            const link = $(el).attr("href");
            const reso = $(el).text().trim();
            const r = {
              source: judul,
              link,
              reso,
            };
            result.push(r);
          });
        const hasil = {
          result,
          linkS,
        };
        resolve(hasil);
      })
      .catch((e) => reject(e));
  });

async function getLink(judul) {
  const slug = await getSlug(judul);
  if (slug == "Judul Tidak Ditemukan") {
    return "=> " + slug;
  }
  const link = await getUrl(slug);
  let data = { judul: slug, data: [] };
  for (i in link) {
    try {
      if (i == 0 && link[0][0]["source"] == "Google Drive") {
        for (l in link[0]) {
          data.data.push({
            source: link[0][l]["source"],
            link: link[0][l]["link"],
            reso: link[0][l]["reso"],
          });
        }
      } else {
        data.data.push({ source: link[i]["source"], link: link[i]["link"] });
      }
    } catch (e) {
      data.data.push({ source: link[i]["source"], link: link[i]["link"] });
    }
  }
  return data;
}

module.exports = getLink;
