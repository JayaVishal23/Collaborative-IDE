import express from "express";
const router = express.Router();

router.post("/run", (req, res) => {
  const code = req.body.code;
});

export default router;
