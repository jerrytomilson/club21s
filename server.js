const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;
const ROOT = __dirname;

app.get("/", (_req, res) => {
  res.sendFile(path.join(ROOT, "home.html"));
});

app.use(express.static(ROOT));

app.listen(PORT, () => {
  console.log(`Club21 site running at http://localhost:${PORT}`);
});
