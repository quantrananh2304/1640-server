import express = require("express");

const router = express.Router();

router.get("/test", (req, res) => {
  res.send({ foo: "bar" });
});

export default router;
