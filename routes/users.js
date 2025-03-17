const express = require("express");
const router = express.Router();
const db = require("../db");

//获取所有用户
router.get("/", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [users] = await connection.query(
      "SELECT id,username,email FROM  users"
    );
    connection.release();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "获取用户列表失败" });
  }
});

module.exports = router;
