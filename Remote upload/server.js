
const express = require("express");
const multer = require("multer");
const axios = require("axios");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // 从环境变量中获取 Token
const GITHUB_REPO = "your-username/your-repo"; // 替换为你的 GitHub 仓库
const GITHUB_BRANCH = "main"; // 替换为你的分支

app.post("/upload", upload.single("file"), async (req, res) => {
    const { filename, originalname, path } = req.file;

    try {
        // 读取文件内容
        const fileContent = require("fs").readFileSync(path, "utf-8");

        // 构造 GitHub API 请求
        const response = await axios.get(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${originalname}?ref=${GITHUB_BRANCH}`,
            {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                },
            }
        );

        const sha = response.data.sha; // 获取文件的 SHA 值（如果文件已存在）

        // 更新文件到 GitHub
        await axios.put(
            `https://api.github.com/repos/${GITHUB_REPO}/contents/${originalname}`,
            {
                message: `Upload ${originalname}`,
                content: Buffer.from(fileContent).toString("base64"),
                sha: sha, // 如果文件不存在，可以省略这个字段
                branch: GITHUB_BRANCH,
            },
            {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                },
            }
        );

        res.json({ message: "文件上传成功！" });
    } catch (error) {
        console.error("上传失败:", error);
        res.status(500).json({ message: "文件上传失败，请检查错误信息！" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
