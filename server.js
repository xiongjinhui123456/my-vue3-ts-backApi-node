require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const db = require("./db"); // 引入数据库
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json()); // 解析 JSON 请求体

// 初始化用户表
(async () => {
  const connection = await db.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users(
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL
      )
      `);
  } catch (err) {
    console.log("数据库初始化失败", err);
  } finally {
    connection.release();
  }
})();

// Swagger 配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API 文档',
      version: '1.0.0',
      description: '使用 Swagger 生成的 API 文档',
    },
    servers: [
      {
        url: 'http://localhost:3000', // 你的服务器地址
      },
    ],
  },
  apis: ['./routes/*.js'], // 指定路由文件
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

//菜单列表
app.get("/api/menuList", (req, res) => {
  res.json([
    {
      title: "首页",
      icon: "HomeFilled",
      children: [],
    },
    {
      title: "用户管理",
      icon: "Memo",
      children: [{ title: "用户1" }, { title: "用户2" }],
    },
    {
      title: "角色管理",
      icon: "DataBoard",
      children: [{ title: "角色1" }, { title: "角色2" }],
    },
    {
      title: "关于",
      icon: "Folder",
      children: [],
    },
  ]);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// 挂载路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

//受保护接口
app.get("/api/protected", verifyToken, async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(
      "SELECT id,username FROM users WHERE id = ?",
      [req.user.id]
    );
    connection.release();
    res.json({ message: "成功访问受保护的API", user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: "服务器错误" });
  }
});

//JWT 认证中间件
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ message: "未提供令牌" });
  jwt.verify(token.split("")[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "令牌无效" });
  });
  req.USER = decoded;
  next();
}

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT},文档地址: http://localhost:${PORT}/api-docs`);
});
