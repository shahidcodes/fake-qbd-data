const express = require("express");
const router = express.Router();
const userMap = require("./userMap");
const uuid = require("node-uuid");

router.get("/", function(req, res) {
  res.sendFile(`${__dirname}/views/index.html`);
});

router.get("/set/:username/:count", (req, res) => {
  userMap[req.params.username] = req.params.count;
  res.redirect("/download/" + req.params.username);
});

router.get("/download/:username", (req, res) => {
  const url = process.env.BASE_URL || "http://localhost:8000/wsdl";
  const username = req.params.username;
  const data = `<?xml version="1.0"?>
  <QBWCXML>
     <AppName>Faker QBD</AppName>
     <AppID></AppID>
     <AppURL>${url}</AppURL>
     <AppDescription>Faker QBD</AppDescription>
     <AppSupport>${url}/wsdl</AppSupport>
     <UserName>${username || "example"}</UserName>
     <OwnerID>{${uuid.v4()}}</OwnerID>
     <FileID>{${uuid.v4()}}</FileID>
     <QBType>QBFS</QBType>
     <IsReadOnly>false</IsReadOnly>
  </QBWCXML>
  `;
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${username || "faker"}.qwc`
  );
  res.setHeader("Content-Type", "text/plain");
  res.end(Buffer.from(data));
});

module.exports = router;
