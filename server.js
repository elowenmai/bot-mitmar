require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const mysql = require("mysql2");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const TELEGRAM_API = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error("❌ DB error:", err);
  } else {
    console.log("✅ Terhubung ke MySQL");
  }
});

app.post("/", async (req, res) => {
  const msg = req.body.message;
  if (!msg) return res.sendStatus(200);

  const text = msg.text?.toLowerCase().trim();
  const chatId = msg.chat.id;

  if (text === "/guru") {
    db.query("SELECT * FROM guru", async (err, results) => {
      if (err) return console.error("DB error:", err);

      let reply = results.length
        ? "*📋 Daftar Guru:*
" + results.map(g =>
            `🆔 *ID*: ${g.id}\n👤 *Nama*: ${g.nama}\n📚 *Mapel*: ${g.mapel}\n🔒 *PIN*: ${g.pin}`
          ).join("\n\n")
        : "📭 Data guru kosong.";

      await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply,
          parse_mode: "Markdown"
        })
      });
    });
  }

  res.sendStatus(200);
});

app.listen(PORT, () => console.log("🚀 Bot berjalan di port", PORT));
