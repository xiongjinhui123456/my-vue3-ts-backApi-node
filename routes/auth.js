const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require("../db"); //引入数据库连接

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 用户认证相关接口
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 用户注册
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               password:
 *                 type: string
 *                 example: 123456
 *               email:
 *                 type: string
 *                 example: test@example.com
 *     responses:
 *       200:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 注册成功
 *       500:
 *         description: 注册失败
 */

//用户注册
router.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const connection = await db.getConnection();
    await connection.query(
      "INSERT INTO users (username,password,email) VALUES(?,?,?)",
      [username, password, email]
    );
    connection.release();
    res.json({ message: "注册成功" });
  } catch (err) {
    res.status(500).json({ message: "注册失败" });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 登录成功
 *                 user:
 *                   type: object
 *                   example: { "id": 1, "username": "testuser", "email": "test@example.com" }
 *       401:
 *         description: 用户名或密码错误
 *       500:
 *         description: 登录失败
 */

//用户登录
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const connection = await db.getConnection();
    const [users] = await connection.query(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );
    connection.release();

    if (users.length > 0) {
      const user = users[0];
      //生成 JWT Token
      const token = jwt.sign(
        { id: user.id, username: user.username }, // 载荷（payload）
        process.env.JWT_SECRET, //密钥,为了保证 Token 安全性，添加 环境变量，在 .env 文件里：
        { expiresIn: "2h" } //过期时间
      );
      res.json({ message: "登录成功", token,user});
    } else {
      res.status(401).json({ error: "用户名或密码错误" });
    }
  } catch (err) {
    res.status(500).json({ message: "登录失败" });
  }
});

module.exports = router;
