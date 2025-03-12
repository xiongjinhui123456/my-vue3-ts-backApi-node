require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // 解析 JSON 请求体

// 示例接口：获取用户列表
app.get("/api/users", (req, res) => {
  res.json([
    { id: 1, name: "张三" },
    { id: 2, name: "李四" },
  ]);
});

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
      children: [
        { path: "/1-1", title: "用户1" },
        { path: "/1-2", title: "用户2" },
      ],
    },
    {
      title: "角色管理",
      icon: "DataBoard",
      children: [
        { path: "/3-1", title: "角色1" },
        { path: "/3-2", title: "角色2" },
      ],
    },
    {
      title: "关于",
      icon: "Folder",
      children: [],
    },
  ]);
});

// 示例接口：添加用户
app.post("/api/users", (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "用户名不能为空" });
  }
  res.json({ id: Date.now(), name });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
