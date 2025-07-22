const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

// ✅ config/config.json 로드
const configPath = path.resolve(__dirname, '../config/config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

app.use(cors());

app.get('/clickup-data', async (req, res) => {
  const url = `https://api.clickup.com/api/v3/workspaces/${config.workspaceId}/docs/${config.docId}/pageListing?max_page_depth=10`;

  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        Authorization: config.apiToken
      }
    });

    // ✅ 응답을 그대로 전달
    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("❌ ClickUp API fetch error:", err);
    res.status(500).json({ error: 'Failed to fetch from ClickUp API' });
  }
});

app.get("/config", (req, res) => {
  const configPath = path.join(__dirname, "../config/config.json");
  fs.readFile(configPath, "utf8", (err, data) => {
    if (err) {
      console.error("❌ config 읽기 실패:", err);
      return res.status(500).json({ error: "Config file not found" });
    }
    res.json(JSON.parse(data));
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Express running: http://localhost:${PORT}`);
});
