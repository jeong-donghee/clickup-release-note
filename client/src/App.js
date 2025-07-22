import React, { useEffect, useState } from "react";

// ✅ 트리 컴포넌트
const PageTree = ({ page, depth = 0 }) => {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = page.pages && page.pages.length > 0;
  const clickupUrl = `https://app.clickup.com/${page.workspace_id}/v/dc/${page.doc_id}/${page.id}`;

  return (
    <div style={{ paddingLeft: depth * 20 }}>
      {hasChildren ? (
        <span
          onClick={() => setExpanded(!expanded)}
          style={{ cursor: "pointer", fontWeight: "bold" }}
        >
          {expanded ? "📂" : "📁"} {page.name}
        </span>
      ) : (
        <a
          href={clickupUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none", fontWeight: "bold", color: "#2a5bd7" }}
        >
          📄 {page.name}
        </a>
      )}

      {expanded && hasChildren && (
        <div>
          {page.pages.map((subPage) => (
            <PageTree key={subPage.id} page={subPage} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// ✅ 트리에서 특정 ID 찾기
const findNodeById = (nodes, targetId) => {
  if (!Array.isArray(nodes)) return null;
  for (const node of nodes) {
    if (node.id === targetId) return node;
    if (node.pages?.length > 0) {
      const found = findNodeById(node.pages, targetId);
      if (found) return found;
    }
  }
  return null;
};

function App() {
  const [config, setConfig] = useState(null);
  const [treeData, setTreeData] = useState(null);

  useEffect(() => {
    // ✅ config.json 불러오기
    fetch("http://localhost:4000/config")
      .then((res) => res.json())
      .then((cfg) => {
        setConfig(cfg);
        return fetch("http://localhost:4000/clickup-data");
      })
      .then((res) => res.json())
      .then((apiData) => {
        setTreeData(apiData);
      })
      .catch((err) => {
        console.error("❌ fetch error:", err);
      });
  }, []);

  if (!config || !treeData) return <p>🔄 로딩 중...</p>;

  const target = findNodeById(treeData, config.targetId);
  if (!target) return <p>❌ ID {config.targetId}를 찾을 수 없습니다.</p>;

  return (
    <div className="App">
      <h2>📚 ClickUp 문서 트리 뷰어</h2>
      <PageTree page={target} />
    </div>
  );
}

export default App;
