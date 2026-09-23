const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = __dirname;

app.get("/", (_req, res) => {
  res.sendFile(path.join(ROOT, "home.html"));
});

app.use(express.static(ROOT));

app.listen(PORT, HOST, () => {
  console.log(`Club21 site running at http://${HOST}:${PORT}`);
});
