const year = document.querySelector("#year");
const topButton = document.querySelector(".top-button");
const defaultData = window.GROWTH_OS_DATA || { assetTypes: [], projects: [], assets: [] };
const STORAGE_KEY = "ajian_growth_os_assets_v1";
const DELETED_KEY = "ajian_growth_os_deleted_assets_v1";

const getStoredAssets = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch (error) {
    return [];
  }
};

const saveStoredAssets = (assets) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
};

const getDeletedAssetIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(DELETED_KEY) || "[]"));
  } catch (error) {
    return new Set();
  }
};

const saveDeletedAssetIds = (ids) => {
  localStorage.setItem(DELETED_KEY, JSON.stringify([...ids]));
};

const getAllAssets = () => {
  const localAssets = getStoredAssets();
  const localIds = new Set(localAssets.map((item) => item.id));
  const deletedIds = getDeletedAssetIds();
  return [...localAssets, ...(defaultData.assets || []).filter((item) => !localIds.has(item.id) && !deletedIds.has(item.id))];
};

const getTypeName = (type) => (defaultData.assetTypes || []).find((item) => item.id === type)?.name || type;
const getProjectById = (id) => (defaultData.projects || []).find((item) => item.id === id);
const getProjectName = (id) => getProjectById(id)?.title || id;
const todayISO = () => new Date().toISOString().slice(0, 10);
const normalizeTags = (value) => Array.isArray(value) ? value : String(value || "").split(/[,，]/).map((item) => item.trim()).filter(Boolean);
const getAssetDate = (asset) => asset.date || asset.updatedAt || asset.createdAt || "";
const getAssetSummary = (asset) => asset.summary || asset.content || "";
const rootPrefix = location.pathname.includes("/projects/") || location.pathname.includes("/experiments/") || location.pathname.includes("/archive/") || location.pathname.includes("/handoffs/") || location.pathname.includes("/whitepapers/") || location.pathname.includes("/workflow/") ? "../" : "";
const assetUrl = (id) => `${rootPrefix}asset.html?id=${encodeURIComponent(id)}`;
const libraryUrl = (id) => `${rootPrefix}library.html?id=${encodeURIComponent(id)}`;
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;"
}[char]));

if (year) year.textContent = new Date().getFullYear();
if (topButton) {
  topButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const copyContact = document.querySelector(".copy-contact");
const copyStatus = document.querySelector(".copy-status");

if (copyContact) {
  copyContact.addEventListener("click", async () => {
    const value = copyContact.dataset.copy;
    let copied = false;

    try {
      await navigator.clipboard.writeText(value);
      copied = true;
    } catch (error) {
      const textArea = document.createElement("textarea");
      textArea.value = value;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      copied = document.execCommand("copy");
      textArea.remove();
    }

    if (copyStatus) copyStatus.textContent = copied ? `QQ 号 ${value} 已复制到剪贴板` : `QQ：${value}`;
    const label = copyContact.querySelector(".copy-label");
    if (label && copied) {
      label.textContent = "已复制";
      window.setTimeout(() => { label.textContent = "复制号码"; }, 1800);
    }
  });
}

const themeToggle = document.querySelector("[data-theme-toggle]");
if (themeToggle) {
  const savedMode = localStorage.getItem("growthMode");
  if (savedMode === "focus") document.body.classList.add("focus-mode");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("focus-mode");
    localStorage.setItem("growthMode", document.body.classList.contains("focus-mode") ? "focus" : "default");
  });
}

document.querySelectorAll(".interactive-status button").forEach((button) => {
  button.addEventListener("click", () => {
    const values = button.dataset.cycle.split("|");
    const target = button.querySelector("strong");
    const currentIndex = values.indexOf(target.textContent.trim());
    target.textContent = values[(currentIndex + 1) % values.length];
  });
});

document.querySelectorAll(".progress-card").forEach((card) => {
  const total = Number(card.dataset.total || 0);
  const milestones = card.querySelector(".milestones");
  const percent = card.querySelector(".progress-percent");

  const renderProgress = (done) => {
    card.dataset.done = String(done);
    milestones.innerHTML = "";
    for (let index = 1; index <= total; index += 1) {
      const point = document.createElement("button");
      point.type = "button";
      point.className = index <= done ? "done" : "";
      if (index === done + 1 && done < total) point.classList.add("current");
      point.setAttribute("aria-label", `设置为完成 ${index} / ${total}`);
      point.addEventListener("click", () => renderProgress(index));
      milestones.appendChild(point);
    }
    percent.textContent = `${Math.round((done / total) * 100)}%`;
  };

  renderProgress(Number(card.dataset.done || 0));
});

const workflow = document.querySelector("[data-workflow]");
if (workflow) {
  const workflowOutput = document.querySelector("[data-workflow-output]");
  workflow.querySelectorAll("button, a").forEach((item) => {
    item.addEventListener("click", () => {
      workflow.querySelectorAll("button, a").forEach((entry) => entry.classList.remove("active"));
      item.classList.add("active");
      if (workflowOutput && item.dataset.workflowDetail) workflowOutput.textContent = item.dataset.workflowDetail;
    });
  });
}

const assetCardHTML = (asset) => {
  const tags = normalizeTags(asset.tags).map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");
  const sourceNames = (asset.projects || []).map((id) => getProjectName(id)).join(" / ");
  return `<a class="asset-card" href="${assetUrl(asset.id)}" data-local-item data-asset-id="${escapeHTML(asset.id)}" data-tags="${escapeHTML(normalizeTags(asset.tags).join(" "))}" data-date="${escapeHTML(getAssetDate(asset))}" data-summary="${escapeHTML(getAssetSummary(asset))}">
    <div class="asset-meta"><span>${escapeHTML(getTypeName(asset.type))}</span><time>${escapeHTML(getAssetDate(asset))}</time></div>
    <h3>${escapeHTML(asset.title)}</h3>
    <p>${escapeHTML(getAssetSummary(asset))}</p>
    <div class="asset-tags">${tags}</div>
    <small>来源/关联：${escapeHTML(sourceNames || "未关联")}</small>
  </a>`;
};

const assetListItemHTML = (asset) => {
  const tags = normalizeTags(asset.tags).slice(0, 4).map((tag) => `<span class="pill">${escapeHTML(tag)}</span>`).join("");
  return `<a class="list-item" href="${assetUrl(asset.id)}" data-local-item data-date="${escapeHTML(getAssetDate(asset))}" data-tags="${escapeHTML(normalizeTags(asset.tags).join(" "))}" data-summary="${escapeHTML(getAssetSummary(asset))}">
    <time>${escapeHTML(getAssetDate(asset))}</time>
    <div>${tags}<h3>${escapeHTML(asset.title)}</h3><p>${escapeHTML(getAssetSummary(asset))}</p></div>
    <strong>查看详情</strong>
  </a>`;
};

const privateDetailsHTML = (asset) => {
  if (!asset.privateDetails) return "";
  const metrics = asset.privateDetails.metrics || {};
  const traffic = asset.privateDetails.traffic || {};
  const searchTerms = normalizeTags(asset.privateDetails.searchTerms || []);
  const needs = normalizeTags(asset.privateDetails.needs || []);
  const metricRows = Object.entries(metrics).map(([key, value]) => `<div><span>${escapeHTML(key)}</span><strong>${escapeHTML(value)}</strong></div>`).join("");
  const trafficRows = Object.entries(traffic).map(([key, value]) => `<div><span>${escapeHTML(key)}</span><strong>${escapeHTML(value)}</strong></div>`).join("");
  const searchList = searchTerms.map((item) => `<span>${escapeHTML(item)}</span>`).join("");
  const needList = needs.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
  return `<section class="private-data" data-private-data>
    <h2>隐藏数据</h2>
    <p>这部分保存原始播放、互动、流量来源、搜索词和用户需求。输入密码后显示，方便公开页面保留判断，详细数据单独查看。</p>
    <form class="password-panel" data-private-form>
      <label>查看密码<input type="password" autocomplete="current-password" placeholder="输入密码" /></label>
      <button type="submit">显示隐藏数据</button>
      <small data-private-message></small>
    </form>
    <div class="private-data-body" data-private-body hidden>
      <div class="private-grid">${metricRows}</div>
      <h3>流量来源</h3>
      <div class="private-grid compact">${trafficRows}</div>
      <h3>搜索词</h3>
      <div class="asset-tags">${searchList || "<span>暂无</span>"}</div>
      <h3>用户需求</h3>
      <ul>${needList || "<li>暂无</li>"}</ul>
    </div>
  </section>`;
};

const setupPrivateDataUnlock = (root = document) => {
  root.querySelectorAll("[data-private-data]").forEach((section) => {
    const form = section.querySelector("[data-private-form]");
    const body = section.querySelector("[data-private-body]");
    const message = section.querySelector("[data-private-message]");
    if (!form || !body) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input");
      if (input?.value === "520520") {
        body.hidden = false;
        form.hidden = true;
      } else if (message) {
        message.textContent = "密码不对，隐藏数据暂不显示。";
      }
    });
  });
};

const renderLibraryPage = () => {
  const target = document.querySelector("[data-library-list]");
  if (!target) return;
  const params = new URLSearchParams(location.search);
  const libraryId = params.get("id") || target.dataset.libraryList;
  const library = getProjectById(libraryId);
  const title = document.querySelector("[data-library-title]");
  const lead = document.querySelector("[data-library-lead]");
  const status = document.querySelector("[data-library-status]");
  const search = document.querySelector("[data-library-search]");
  const assets = getAllAssets().filter((asset) => (asset.projects || []).includes(libraryId));

  if (title) title.textContent = library?.title || "子库";
  if (lead) lead.textContent = library ? `${library.title}用于沉淀对应项目下的记录、SOP、规律、风险、案例和结论。` : "这个子库暂时没有配置说明。";
  if (status) status.textContent = assets.length ? `已更新 ${assets.length} 条` : "暂未更新";
  if (search) search.placeholder = `搜索${library?.title || "子库"}的日期、标签或概括`;
  target.innerHTML = assets.length ? assets.map(assetListItemHTML).join("") : `<div class="empty-library" data-local-item><h2>暂未更新</h2><p>这个库已经建好，后续新增内容会按日期、标签、概括和详情的格式展示在这里。</p></div>`;
};

const renderAssetDetail = () => {
  const target = document.querySelector("[data-asset-detail]");
  if (!target) return;
  const id = new URLSearchParams(location.search).get("id");
  const asset = getAllAssets().find((item) => item.id === id);
  if (!asset) {
    target.innerHTML = `<h1>没有找到这条内容</h1><p>可能是链接过期，或者内容还没有同步到网站。</p>`;
    return;
  }
  const sourceLinks = (asset.projects || []).map((projectId) => {
    const project = getProjectById(projectId);
    if (!project) return "";
    const href = (project.tags || []).includes("子库") || project.id === "life-rules" || project.id === "cognition-library" ? libraryUrl(project.id) : `${rootPrefix}${project.url}`;
    return `<a href="${href}">${escapeHTML(project.title)}</a>`;
  }).filter(Boolean).join(" / ");
  const tags = normalizeTags(asset.tags).map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");
  const sourceFiles = normalizeTags(asset.sourceFiles || []).map((file) => `<li>${escapeHTML(file)}</li>`).join("");
  target.innerHTML = `<div class="breadcrumb"><a href="${rootPrefix}knowledge.html">返回知识总库</a></div>
    <div class="article-shell asset-detail">
      <p class="eyebrow">${escapeHTML(getTypeName(asset.type))} / ${escapeHTML(getAssetDate(asset))}</p>
      <h1>${escapeHTML(asset.title)}</h1>
      <p class="lead">${escapeHTML(getAssetSummary(asset))}</p>
      <div class="asset-tags">${tags}</div>
      <h2>完整内容</h2>
      <p>${escapeHTML(asset.content || "").replace(/\n/g, "</p><p>")}</p>
      ${privateDetailsHTML(asset)}
      <h2>来源与关联库</h2>
      <p class="source-links">${sourceLinks || "暂未关联"}</p>
      ${sourceFiles ? `<h2>原始文件</h2><ul class="source-file-list">${sourceFiles}</ul>` : ""}
    </div>`;
  setupPrivateDataUnlock(target);
};

const renderDocumentLists = () => {
  document.querySelectorAll("[data-document-list]").forEach((target) => {
    const type = target.dataset.documentList;
    const assets = getAllAssets()
      .filter((asset) => asset.type === type)
      .sort((a, b) => `${getAssetDate(b)} ${b.title}`.localeCompare(`${getAssetDate(a)} ${a.title}`, "zh-Hans-CN"));
    target.innerHTML = assets.length ? assets.map(assetListItemHTML).join("") : `<p class="search-empty">暂时没有内容。</p>`;
  });
};

const setupLocalSearch = () => {
  document.querySelectorAll("[data-local-search]").forEach((searchBox) => {
    const input = searchBox.querySelector("input");
    const scopeSelector = searchBox.dataset.scope;
    const scope = scopeSelector ? document.querySelector(scopeSelector) : searchBox.parentElement;
    if (!input || !scope) return;

    const empty = document.createElement("p");
    empty.className = "search-empty local-search-empty";
    empty.textContent = "没有找到匹配记录，换个日期、标签或概括试试。";
    empty.hidden = true;
    scope.insertAdjacentElement("afterend", empty);

    const applyLocalSearch = () => {
      const query = input.value.trim().toLowerCase();
      const items = [...scope.querySelectorAll("[data-local-item], .list-item, .project-line, .timeline-row, .card, .asset-card")];
      let visibleCount = 0;
      items.forEach((item) => {
        const haystack = [
          item.textContent,
          item.dataset.tags,
          item.dataset.date,
          item.dataset.summary
        ].join(" ").toLowerCase();
        const visible = !query || haystack.includes(query);
        item.classList.toggle("search-hidden", !visible);
        if (visible) visibleCount += 1;
      });
      empty.hidden = visibleCount > 0;
    };

    input.addEventListener("input", applyLocalSearch);
    applyLocalSearch();
  });
};

const renderKnowledgeList = () => {
  const list = document.querySelector("[data-knowledge-list]");
  if (!list) return;
  const filters = document.querySelector("[data-asset-filters]");
  let activeType = "all";
  const render = () => {
    const assets = getAllAssets().filter((asset) => activeType === "all" || asset.type === activeType);
    list.innerHTML = assets.length ? assets.map(assetCardHTML).join("") : `<p class="search-empty">暂时没有内容。</p>`;
  };
  if (filters) {
    filters.innerHTML = [`<button class="active" type="button" data-type="all">全部</button>`, ...(defaultData.assetTypes || []).map((type) => `<button type="button" data-type="${type.id}">${type.name}</button>`)].join("");
    filters.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        activeType = button.dataset.type;
        filters.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        render();
      });
    });
  }
  render();
};

const renderProjectAssets = () => {
  document.querySelectorAll("[data-project-assets]").forEach((target) => {
    const projectId = target.dataset.projectAssets;
    const assets = getAllAssets().filter((asset) => (asset.projects || []).includes(projectId));
    target.innerHTML = assets.length ? assets.map(assetCardHTML).join("") : `<p class="search-empty">这个项目还没有关联知识资产。</p>`;
  });
};

const setupLibraryBadges = () => {
  document.querySelectorAll(".sub-library a[href*='library.html?id=']").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const match = href.match(/[?&]id=([^&]+)/);
    if (!match) return;
    const libraryId = decodeURIComponent(match[1]);
    const count = getAllAssets().filter((asset) => (asset.projects || []).includes(libraryId)).length;
    link.classList.toggle("has-content", count > 0);
    link.classList.toggle("is-empty", count === 0);
    let badge = link.querySelector(".library-count");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "library-count";
      link.appendChild(badge);
    }
    badge.textContent = count > 0 ? `${count}条` : "待更新";
    link.setAttribute("aria-label", `${link.childNodes[0]?.textContent?.trim() || "子库"}，${badge.textContent}`);
  });
};

const setupManager = () => {
  const form = document.querySelector("#assetForm");
  const list = document.querySelector("[data-manager-list]");
  if (!form || !list) return;
  const typeSelect = form.elements.type;
  const projectSelect = form.elements.projects;
  typeSelect.innerHTML = (defaultData.assetTypes || []).map((type) => `<option value="${type.id}">${type.name}</option>`).join("");
  projectSelect.innerHTML = (defaultData.projects || []).map((project) => `<option value="${project.id}">${project.title}</option>`).join("");

  const renderManagerList = () => {
    list.innerHTML = getAllAssets().map((asset) => `<button type="button" data-local-item data-edit-id="${asset.id}" data-date="${getAssetDate(asset)}" data-tags="${normalizeTags(asset.tags).join(" ")}" data-summary="${getAssetSummary(asset)}"><strong>${asset.title}</strong><span>${getAssetDate(asset)} · ${getTypeName(asset.type)} · ${asset.status || "未设置"}</span></button>`).join("");
    list.querySelectorAll("[data-edit-id]").forEach((button) => {
      button.addEventListener("click", () => {
        const asset = getAllAssets().find((item) => item.id === button.dataset.editId);
        if (!asset) return;
        form.elements.id.value = asset.id;
        form.elements.title.value = asset.title || "";
        form.elements.date.value = getAssetDate(asset);
        form.elements.summary.value = asset.summary || "";
        form.elements.content.value = asset.content || "";
        form.elements.type.value = asset.type || "rule";
        [...projectSelect.options].forEach((option) => { option.selected = (asset.projects || []).includes(option.value); });
        form.elements.tags.value = normalizeTags(asset.tags).join(", ");
        form.elements.status.value = asset.status || "";
      });
    });
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const id = form.elements.id.value || `asset-${Date.now()}`;
    const existing = getAllAssets().find((item) => item.id === id);
    const asset = {
      id,
      title: form.elements.title.value.trim(),
      date: form.elements.date.value || todayISO(),
      summary: form.elements.summary.value.trim(),
      content: form.elements.content.value.trim(),
      type: form.elements.type.value,
      projects: [...projectSelect.selectedOptions].map((option) => option.value),
      tags: normalizeTags(form.elements.tags.value),
      status: form.elements.status.value.trim() || "草稿",
      createdAt: existing?.createdAt || todayISO(),
      updatedAt: todayISO()
    };
    const next = getStoredAssets().filter((item) => item.id !== id);
    next.unshift(asset);
    saveStoredAssets(next);
    form.reset();
    form.elements.id.value = "";
    renderManagerList();
    renderKnowledgeList();
    renderProjectAssets();
    setupLibraryBadges();
  });

  document.querySelector("[data-reset-form]")?.addEventListener("click", () => {
    form.reset();
    form.elements.id.value = "";
  });

  document.querySelector("[data-delete-asset]")?.addEventListener("click", () => {
    const id = form.elements.id.value;
    if (!id) return;
    saveStoredAssets(getStoredAssets().filter((item) => item.id !== id));
    const deletedIds = getDeletedAssetIds();
    deletedIds.add(id);
    saveDeletedAssetIds(deletedIds);
    form.reset();
    renderManagerList();
    renderKnowledgeList();
    renderProjectAssets();
    setupLibraryBadges();
  });

  document.querySelector("[data-export-assets]")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(getAllAssets(), null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `growth-os-assets-${todayISO()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  document.querySelector("[data-import-assets]")?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    saveStoredAssets(JSON.parse(await file.text()));
    renderManagerList();
    renderKnowledgeList();
    renderProjectAssets();
    setupLibraryBadges();
  });

  renderManagerList();
};


const sortAssetsByDate = (assets) => [...assets].sort((a, b) => `${getAssetDate(b)} ${b.updatedAt || ""} ${b.title}`.localeCompare(`${getAssetDate(a)} ${a.updatedAt || ""} ${a.title}`, "zh-Hans-CN"));
const daysBetween = (date) => {
  const value = Date.parse(`${date}T00:00:00`);
  if (Number.isNaN(value)) return Infinity;
  const today = Date.parse(`${todayISO()}T00:00:00`);
  return Math.floor((today - value) / 86400000);
};

const workflowViews = {
  "data-record": {
    title: "数据记录",
    source: "成长档案数据库 / 健康与运营记录",
    allUrl: "../archive.html",
    match: (asset) => {
      const text = `${asset.title} ${asset.summary} ${asset.content} ${normalizeTags(asset.tags).join(" ")} ${(asset.projects || []).join(" ")}`;
      return /数据|记录|睡眠|眼部|健康|学习|工作|运营|预算|衣橱|状态|复盘|视频数据库|原始/.test(text);
    }
  },
  "project-progress": {
    title: "项目推进",
    source: "项目交接卡 / 项目库",
    allUrl: "../handoffs.html",
    match: (asset) => asset.type === "handoff" || /项目|推进|阶段|下一步|交接卡|里程碑|Workflow|网站更新/.test(`${asset.title} ${asset.summary} ${asset.content} ${normalizeTags(asset.tags).join(" ")}`)
  },
  "experiment-validation": {
    title: "实验验证",
    source: "实验数据库 / 风险与验证记录",
    allUrl: "../experiments.html",
    match: (asset) => {
      const text = `${asset.title} ${asset.summary} ${asset.content} ${normalizeTags(asset.tags).join(" ")} ${(asset.projects || []).join(" ")}`;
      return /实验|验证|测试|VPN|眼部|睡眠|低成本|风控|运营实验|experiment-thinking|health-rules/.test(text);
    }
  },
  "rule-summary": {
    title: "规律总结",
    source: "规律库 / 认知库 / 人生规律库",
    allUrl: "../knowledge.html",
    match: (asset) => asset.type === "rule" || /规律|方法|原则|判断|认知|底层|长期|系统思维|人生规律/.test(`${asset.title} ${asset.summary} ${asset.content} ${normalizeTags(asset.tags).join(" ")}`)
  },
  "content-archive": {
    title: "内容沉淀",
    source: "知识资产数据库",
    allUrl: "../knowledge.html",
    match: (asset) => ["sop", "case", "whitepaper", "handoff", "ai", "database", "risk"].includes(asset.type)
  },
  "public-output": {
    title: "对外输出",
    source: "网站项目 / 作品集 / GitHub 更新",
    allUrl: "../projects/ajian-growth-lab.html",
    match: (asset) => {
      const text = `${asset.title} ${asset.summary} ${asset.content} ${normalizeTags(asset.tags).join(" ")} ${(asset.projects || []).join(" ")}`;
      return /网站|GitHub|公众号|作品集|发布|对外|输出|Growth OS|Codex|site-update-workflow|growth-lab/.test(text);
    }
  }
};

const workflowItemHTML = (asset) => {
  const tags = normalizeTags(asset.tags).slice(0, 3).map((tag) => `<span>${escapeHTML(tag)}</span>`).join("");
  return `<a class="workflow-update-item" href="${assetUrl(asset.id)}" data-local-item data-date="${escapeHTML(getAssetDate(asset))}" data-tags="${escapeHTML(normalizeTags(asset.tags).join(" "))}" data-summary="${escapeHTML(getAssetSummary(asset))}">
    <time>${escapeHTML(getAssetDate(asset))}</time>
    <div><strong>${escapeHTML(asset.title)}</strong><p>${escapeHTML(getAssetSummary(asset))}</p><small>${escapeHTML(getTypeName(asset.type))}</small></div>
    <div class="workflow-mini-tags">${tags}</div>
  </a>`;
};

const getWorkflowAssets = (key) => sortAssetsByDate(getAllAssets().filter((asset) => workflowViews[key]?.match(asset)));

const renderWorkflowBadges = () => {
  document.querySelectorAll("[data-workflow-badge]").forEach((badge) => {
    const key = badge.dataset.workflowBadge;
    const assets = getWorkflowAssets(key);
    const todayCount = assets.filter((asset) => daysBetween(getAssetDate(asset)) === 0).length;
    const weekCount = assets.filter((asset) => daysBetween(getAssetDate(asset)) >= 0 && daysBetween(getAssetDate(asset)) <= 7).length;
    badge.classList.remove("is-today", "is-week", "is-empty");
    if (todayCount > 0) {
      badge.textContent = `今日更新 ${todayCount} 条`;
      badge.classList.add("is-today");
    } else if (weekCount > 0) {
      badge.textContent = `本周更新 ${weekCount} 条`;
      badge.classList.add("is-week");
    } else {
      badge.textContent = "最近暂无更新";
      badge.classList.add("is-empty");
    }
  });
};

const renderWorkflowPage = () => {
  const page = document.querySelector("[data-workflow-page]");
  const target = document.querySelector("[data-workflow-live]");
  if (!page || !target) return;
  const key = page.dataset.workflowPage;
  const view = workflowViews[key];
  const assets = getWorkflowAssets(key);
  const recent = assets.slice(0, 5);
  const weekAssets = assets.filter((asset) => daysBetween(getAssetDate(asset)) >= 0 && daysBetween(getAssetDate(asset)) <= 7).slice(0, 8);
  const relatedProjects = [...new Set(assets.flatMap((asset) => asset.projects || []))].map(getProjectById).filter(Boolean).slice(0, 8);
  const relatedHandoffs = sortAssetsByDate(getAllAssets().filter((asset) => asset.type === "handoff" && (key === "project-progress" || assets.some((item) => normalizeTags(item.tags).some((tag) => `${asset.title} ${asset.summary} ${asset.content}`.includes(tag)))))).slice(0, 4);
  const typeCounts = assets.reduce((map, asset) => {
    map[asset.type] = (map[asset.type] || 0) + 1;
    return map;
  }, {});
  const knowledgePills = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([type, count]) => `<span>${escapeHTML(getTypeName(type))} ${count} 条</span>`).join("");
  const todayCount = assets.filter((asset) => daysBetween(getAssetDate(asset)) === 0).length;
  const weekCount = assets.filter((asset) => daysBetween(getAssetDate(asset)) >= 0 && daysBetween(getAssetDate(asset)) <= 7).length;

  target.innerHTML = `<div class="workflow-summary-grid">
      <div><span>最近更新</span><strong>${recent.length ? getAssetDate(recent[0]) : "暂无"}</strong><p>${recent.length ? recent[0].title : "还没有匹配记录"}</p></div>
      <div><span>今日更新</span><strong>${todayCount}</strong><p>来自 ${escapeHTML(view.source)}</p></div>
      <div><span>最近7天</span><strong>${weekCount}</strong><p>短期动态自动读取</p></div>
    </div>
    <section class="workflow-section"><div class="section-heading compact"><div><p class="eyebrow">Recent Updates</p><h2>最近更新</h2></div><a href="${escapeHTML(view.allUrl)}">查看全部 →</a></div><div class="workflow-update-list">${recent.length ? recent.map(workflowItemHTML).join("") : `<p class="search-empty">最近暂无更新。</p>`}</div></section>
    <section class="workflow-section"><div class="section-heading compact"><div><p class="eyebrow">Last 7 Days</p><h2>最近7天更新</h2></div></div><div class="workflow-update-list compact-list">${weekAssets.length ? weekAssets.map(workflowItemHTML).join("") : `<p class="search-empty">最近 7 天没有匹配记录。</p>`}</div></section>
    <section class="workflow-section workflow-connection-grid">
      <div><h2>关联知识</h2><div class="workflow-pill-row">${knowledgePills || `<span>暂无关联知识</span>`}</div></div>
      <div><h2>关联项目</h2><div class="workflow-link-row">${relatedProjects.length ? relatedProjects.map((project) => `<a href="${escapeHTML((project.tags || []).includes("子库") ? libraryUrl(project.id) : `${rootPrefix}${project.url}`)}">${escapeHTML(project.title)}</a>`).join("") : `<span>暂无关联项目</span>`}</div></div>
      <div><h2>关联项目交接卡</h2><div class="workflow-link-row">${relatedHandoffs.length ? relatedHandoffs.map((asset) => `<a href="${assetUrl(asset.id)}">${escapeHTML(asset.title)}</a>`).join("") : `<a href="../handoffs.html">查看项目交接卡</a>`}</div></div>
    </section>`;
};

const searchInput = document.querySelector("#dashboardSearch");
const filterButtons = document.querySelectorAll("[data-filter]");
const searchableCards = document.querySelectorAll(".searchable-card");
let activeFilter = "全部";

const stageViews = {
  "growth-os": { title: "Growth OS 网站", projectId: "growth-lab", currentStage: "内容迁移与动态页优化", progress: "70%", groups: {
    done: { label: "已完成", summary: "已经搭好的基础模块和内容承载能力。这里先看完成过哪些模块，再进入对应库查看详情。", current: [
      { title: "后台", desc: "内容管理入口已经能新增、导入和导出知识资产。", url: "manager.html", match: ["内容管理", "后台"] },
      { title: "知识库", desc: "知识资产总库、子库和详情页已经形成基础结构。", url: "knowledge.html", match: ["知识资产", "知识库"] },
      { title: "项目交接卡", desc: "每日进度、问题和下一步行动已经按卡片形式沉淀。", url: "handoffs.html", match: ["项目交接卡", "交接卡"] },
      { title: "白皮书", desc: "阶段性总结已经独立成库，支持继续新增。", url: "whitepapers.html", match: ["白皮书", "阶段总结"] },
      { title: "子库详情", desc: "每个子库按日期、标签、概括和完整内容展示。", url: "projects.html", match: ["子库", "详情"] }
    ], previous: [
      { title: "阿简成长实验室网站", desc: "最初的网站项目，承载 Growth OS 的公开展示。", url: "projects/ajian-growth-lab.html", match: ["Growth OS", "网站"] },
      { title: "网站更新工作流", desc: "用 Codex 把交接卡、白皮书和知识资产发布到网站。", url: "library.html?id=site-update-workflow", match: ["网站更新", "Codex"] }
    ] },
    doing: { label: "当前进行", summary: "当前重点不是继续堆页面，而是让页面能读取数据库、能点进去、能追溯来源。", current: [
      { title: "Workflow 动态化", desc: "把六个 Workflow 页面改成最近动态中心。", url: "workflow/project-progress.html", match: ["Workflow", "动态"] },
      { title: "项目阶段看板", desc: "把长期项目用阶段、标签和库关联展示，而不是只看百分比。", url: "index.html#stage-overview", match: ["项目阶段", "阶段看板"] }
    ], previous: [
      { title: "后台", desc: "内容录入和导入能力为动态页面提供数据来源。", url: "manager.html", match: ["后台", "内容管理"] },
      { title: "知识资产系统", desc: "动态页最终读取的是同一份知识资产数据。", url: "library.html?id=knowledge-system", match: ["知识资产系统", "数据结构"] }
    ] },
    next: { label: "下一阶段", summary: "下一步让知识之间产生关系，从单条记录走向知识图谱、推荐和关系网络。", current: [
      { title: "知识图谱", desc: "把项目、标签、来源和内容互相连接。", url: "knowledge.html", match: ["知识图谱", "关系"] },
      { title: "AI 推荐", desc: "让 AI 根据阶段和标签提示下一步该看什么。", url: "library.html?id=ai-knowledge-factory", match: ["AI推荐", "AI知识工厂"] },
      { title: "关系网络", desc: "把项目、SOP、规律、案例和风险做成可追踪网络。", url: "library.html?id=knowledge-system", match: ["关系网络", "跨库关联"] }
    ], previous: [
      { title: "AI 知识工厂", desc: "未来推荐系统的知识生产基础。", url: "library.html?id=ai-knowledge-factory", match: ["AI知识工厂"] },
      { title: "系统思维", desc: "把网站从页面集合升级成可维护系统。", url: "library.html?id=system-thinking", match: ["系统思维"] }
    ] }
  } },
  "new-media": { title: "医美新媒体成长", projectId: "new-media-growth", currentStage: "方法沉淀期", progress: "60%", groups: {
    done: { label: "已完成", summary: "已经沉淀出视频样本、引流路径、评论动作和风控经验。", current: [
      { title: "视频样本", desc: "视频数据库与样本拆解，用来寻找内容规律。", url: "projects/video-benchmark.html", match: ["视频", "视频样本", "视频数据库"] },
      { title: "引流 SOP", desc: "从关注、评论、回关、私信到加 V 的转化路径。", url: "library.html?id=lead-sop", match: ["引流SOP", "引流"] },
      { title: "评论 SOP", desc: "评论引起注意、降低信任成本和等待回关。", url: "library.html?id=comment-sop", match: ["评论SOP", "评论"] },
      { title: "风控经验", desc: "账号私信、关注频率、蓝 V 承接和异常账号隔离。", url: "library.html?id=operation-risk-library", match: ["风控", "风险"] }
    ], previous: [
      { title: "运营 SOP 库", desc: "已沉淀的运营动作会继续归入 SOP 库。", url: "library.html?id=operation-sop-library", match: ["运营SOP"] },
      { title: "项目成果", desc: "引流、转化和执行结果会沉淀为项目成果。", url: "library.html?id=operation-results", match: ["项目成果", "运营案例"] }
    ] },
    doing: { label: "当前进行", summary: "当前重点是把账号从 0 到 1 和新人培训流程拆成可执行清单。", current: [
      { title: "账号冷启动", desc: "账号定位、基础资料、互动测试和初始数据观察。", url: "projects/account-cold-start.html", match: ["账号冷启动"] },
      { title: "新人培训", desc: "让新人按手册完成基础训练、执行和复盘。", url: "library.html?id=account-cold-start", match: ["新人培训"] },
      { title: "运营案例归档", desc: "把引流和转化过程记录成可复盘案例。", url: "library.html?id=operation-results", match: ["运营案例", "项目成果"] }
    ], previous: [
      { title: "引流转化流程", desc: "已有转化路径为冷启动提供基础动作。", url: "library.html?id=lead-sop", match: ["引流转化"] },
      { title: "评论触发模型", desc: "评论区反馈会影响冷启动内容方向。", url: "library.html?id=comment-sop", match: ["评论"] }
    ] },
    next: { label: "下一阶段", summary: "下一步把有效动作标准化，并持续用真实案例验证。", current: [
      { title: "流程标准化", desc: "把有效动作变成稳定 SOP。", url: "library.html?id=operation-sop-library", match: ["流程标准化", "SOP"] },
      { title: "案例库扩展", desc: "持续把成功、失败和异常情况录入案例库。", url: "library.html?id=operation-results", match: ["案例"] },
      { title: "转化路径验证", desc: "用样本验证不同引流路径的有效性。", url: "library.html?id=lead-sop", match: ["转化路径"] }
    ], previous: [
      { title: "视频规律库", desc: "内容规律会反向影响引流和转化。", url: "library.html?id=video-rules-library", match: ["视频规律"] },
      { title: "风险库", desc: "标准化之前先明确高风险动作。", url: "library.html?id=operation-risk-library", match: ["风险"] }
    ] }
  } },
  "account-cold-start": { title: "账号冷启动与新人培训", projectId: "account-cold-start", currentStage: "流程建立阶段", progress: "20%", groups: {
    done: { label: "已完成", summary: "已完成项目立项和最小阶段标记。", current: [
      { title: "项目立项", desc: "冷启动与培训已作为独立项目进入阶段看板。", url: "projects/account-cold-start.html", match: ["账号冷启动", "项目立项"] },
      { title: "基础方向", desc: "先做账号定位、资料搭建、互动和数据观察。", url: "library.html?id=account-cold-start", match: ["基础方向", "新人培训"] },
      { title: "20% 阶段标记", desc: "当前项目处于流程建立早期，不用追求一次性完成。", url: "projects/account-cold-start.html", match: ["20%"] }
    ], previous: [{ title: "医美新媒体成长", desc: "冷启动项目来自新媒体主线。", url: "projects/new-media-growth.html", match: ["医美新媒体"] }] },
    doing: { label: "当前进行", summary: "正在把冷启动动作和新人训练拆成可执行清单。", current: [
      { title: "冷启动 SOP", desc: "定位、资料、内容测试、评论互动和数据观察。", url: "library.html?id=account-cold-start", match: ["冷启动SOP"] },
      { title: "新人培训清单", desc: "让新人知道每天做什么、怎么复盘、怎么避免风险。", url: "library.html?id=account-cold-start", match: ["新人培训"] }
    ], previous: [{ title: "运营 SOP 库", desc: "培训清单要引用已有 SOP。", url: "library.html?id=operation-sop-library", match: ["运营SOP"] }] },
    next: { label: "下一阶段", summary: "让新人按手册训练、执行、反馈和复盘。", current: [
      { title: "新人执行手册", desc: "把培训内容变成可以直接执行的手册。", url: "library.html?id=account-cold-start", match: ["执行手册"] },
      { title: "训练任务", desc: "按天拆任务，跟踪完成情况。", url: "library.html?id=account-cold-start", match: ["训练任务"] },
      { title: "复盘模板", desc: "通过项目交接卡回收问题和下一步。", url: "handoffs.html", match: ["复盘", "项目交接卡"] }
    ], previous: [{ title: "项目交接卡", desc: "每天的执行问题进入交接卡。", url: "handoffs.html", match: ["交接卡"] }] }
  } },
  "ai-workflow": { title: "AI 工作流", projectId: "ai-workflow", currentStage: "工作流验证阶段", progress: "50%", groups: {
    done: { label: "已完成", summary: "已经验证过 AI 辅助识别、整理、生成和发布链路。", current: [
      { title: "OCR", desc: "把图片、文档和截图转成可整理文本。", url: "library.html?id=ocr-workflow", match: ["OCR"] },
      { title: "交接卡生成", desc: "把每日进度变成下一次对话起点。", url: "library.html?id=handoff-generator", match: ["交接卡生成"] },
      { title: "白皮书生成", desc: "把阶段思考整理成成长白皮书。", url: "library.html?id=whitepaper-generator", match: ["白皮书生成"] },
      { title: "网站更新链路", desc: "Codex 读取资料、更新页面并发布到 GitHub Pages。", url: "library.html?id=site-update-workflow", match: ["网站更新", "Codex"] }
    ], previous: [{ title: "AI 知识工厂", desc: "AI 工作流的长期生产规则。", url: "library.html?id=ai-knowledge-factory", match: ["AI知识工厂"] }] },
    doing: { label: "当前进行", summary: "当前重点是减少手动整理成本，让 AI 读取和归纳更稳定。", current: [
      { title: "识别准确率", desc: "减少 OCR、文档读取和归纳时的遗漏。", url: "library.html?id=ocr-workflow", match: ["识别准确率", "OCR"] },
      { title: "文件整理效率", desc: "批量读取文档，并按库归纳入站。", url: "library.html?id=ai-review-assets", match: ["文件整理", "AI复盘"] }
    ], previous: [{ title: "去平台依赖", desc: "平台只是载体，数据结构才是资产。", url: "library.html?id=knowledge-system", match: ["去平台依赖"] }] },
    next: { label: "下一阶段", summary: "把单次整理升级为可批量、可关联的半自动系统。", current: [
      { title: "半自动入库", desc: "先人工确认，再批量写入内容数据。", url: "manager.html", match: ["半自动入库"] },
      { title: "批量归纳", desc: "多文档读取后自动提炼 SOP、规律、案例。", url: "library.html?id=ai-knowledge-factory", match: ["批量归纳"] },
      { title: "跨库关联", desc: "同一条内容可关联多个项目和子库。", url: "library.html?id=knowledge-system", match: ["跨库关联"] }
    ], previous: [{ title: "系统思维", desc: "跨库关联的底层判断。", url: "library.html?id=system-thinking", match: ["系统思维"] }] }
  } },
  "video-benchmark": { title: "视频基准库", projectId: "video-benchmark", currentStage: "规律分析阶段", progress: "60%", groups: {
    done: { label: "已完成", summary: "已有视频样本和第一批可复用规律。", current: [
      { title: "70 条视频分析", desc: "视频数据库累计样本，用于观察内容表现。", url: "projects/video-benchmark.html", match: ["70", "视频分析"] },
      { title: "前 10 条规律总结", desc: "初步提炼出标题、画面、评论和任务评价规律。", url: "library.html?id=video-rules-library", match: ["视频规律", "前10条"] },
      { title: "样本结构沉淀", desc: "用统一字段记录样本，便于后续筛选。", url: "projects/video-benchmark.html", match: ["样本结构"] }
    ], previous: [{ title: "医美新媒体成长", desc: "视频库服务于运营主线。", url: "projects/new-media-growth.html", match: ["医美新媒体"] }] },
    doing: { label: "当前进行", summary: "继续补齐历史视频，并用后续样本验证已有判断。", current: [
      { title: "历史视频", desc: "继续录入历史视频样本。", url: "projects/video-benchmark.html", match: ["历史视频"] },
      { title: "规律验证", desc: "用新增样本验证已有视频规律。", url: "library.html?id=video-rules-library", match: ["规律验证"] }
    ], previous: [{ title: "评论 SOP", desc: "视频评论反馈会反向修正评论 SOP。", url: "library.html?id=comment-sop", match: ["评论"] }] },
    next: { label: "下一阶段", summary: "把视频样本转成可指导创作的模型。", current: [
      { title: "选题模型", desc: "从样本中提炼可复用选题。", url: "library.html?id=video-rules-library", match: ["选题模型"] },
      { title: "标题模型", desc: "总结能带来评论和停留的标题方式。", url: "library.html?id=video-rules-library", match: ["标题模型"] },
      { title: "评论触发模型", desc: "找到更容易让用户表达需求的内容结构。", url: "library.html?id=comment-sop", match: ["评论触发"] }
    ], previous: [{ title: "引流 SOP", desc: "视频模型最终要服务引流转化。", url: "library.html?id=lead-sop", match: ["引流"] }] }
  } }
};

const stageUrl = (project, stage) => `${rootPrefix}stage.html?project=${encodeURIComponent(project)}&stage=${encodeURIComponent(stage)}`;
const stageLabels = { done: "已完成", doing: "当前进行", next: "下一阶段" };
const tagMatchesAsset = (asset, tag) => {
  const text = `${asset.title || ""} ${asset.summary || ""} ${asset.content || ""} ${normalizeTags(asset.tags).join(" ")} ${(asset.projects || []).join(" ")}`;
  return (tag.match || [tag.title]).some((keyword) => text.includes(keyword));
};
const stageTagCardHTML = (tag, kind) => {
  const count = getAllAssets().filter((asset) => tagMatchesAsset(asset, tag)).length;
  return `<a class="stage-tag-card ${kind}" href="${escapeHTML(tag.url)}" data-local-item data-tags="${escapeHTML([tag.title, ...(tag.match || [])].join(" "))}" data-summary="${escapeHTML(tag.desc)}"><span>${kind === "current" ? "当前标签" : "之前沉淀"}${count ? ` · ${count}条` : " · 待补充"}</span><strong>${escapeHTML(tag.title)}</strong><p>${escapeHTML(tag.desc)}</p><em>进入具体库 →</em></a>`;
};
const renderStagePage = () => {
  const page = document.querySelector("[data-stage-page]");
  const target = document.querySelector("[data-stage-detail]");
  if (!page || !target) return;
  const params = new URLSearchParams(location.search);
  const projectKey = params.get("project") || "growth-os";
  const stageKey = params.get("stage") || "doing";
  const project = stageViews[projectKey] || stageViews["growth-os"];
  const group = project.groups[stageKey] || project.groups.doing;
  const title = document.querySelector("[data-stage-title]");
  const lead = document.querySelector("[data-stage-lead]");
  if (title) title.textContent = `${project.title} · ${group.label}`;
  if (lead) lead.textContent = group.summary;
  const allTags = [...(group.current || []), ...(group.previous || [])];
  const relatedAssets = sortAssetsByDate(getAllAssets().filter((asset) => {
    const projectMatch = [project.projectId, projectKey].some((id) => (asset.projects || []).includes(id));
    return projectMatch || allTags.some((tag) => tagMatchesAsset(asset, tag));
  })).slice(0, 6);
  const stageLinks = Object.keys(project.groups).map((key) => `<a class="${key === stageKey ? "active" : ""}" href="${stageUrl(projectKey, key)}">${stageLabels[key] || project.groups[key].label}</a>`).join("");
  target.innerHTML = `<section class="stage-meta-grid"><div><span>项目</span><strong>${escapeHTML(project.title)}</strong><p>长期项目入口</p></div><div><span>当前阶段</span><strong>${escapeHTML(project.currentStage)}</strong><p>阶段优先，不用一次性 100%</p></div><div><span>辅助进度</span><strong>${escapeHTML(project.progress)}</strong><p>只作为参考</p></div></section><nav class="stage-tab-row">${stageLinks}</nav><section class="workflow-section"><div class="section-heading"><div><p class="eyebrow">CURRENT TAGS</p><h2>当前阶段标签</h2></div><p>这些是这个阶段真正要看的标签，点击进入对应子库或详情页。</p></div><div class="stage-tag-grid">${(group.current || []).map((tag) => stageTagCardHTML(tag, "current")).join("")}</div></section><section class="workflow-section"><div class="section-heading"><div><p class="eyebrow">PAST / RELATED</p><h2>之前沉淀标签</h2></div><p>这里和当前阶段有关，但属于之前已经积累过的内容，方便区分新旧。</p></div><div class="stage-tag-grid">${(group.previous || []).map((tag) => stageTagCardHTML(tag, "previous")).join("") || `<p class="search-empty">暂无之前沉淀标签。</p>`}</div></section><section class="workflow-section"><div class="section-heading"><div><p class="eyebrow">CONNECTED ASSETS</p><h2>关联知识资产</h2></div><a href="knowledge.html">查看知识总库 →</a></div><div class="list stage-related-list">${relatedAssets.length ? relatedAssets.map(assetListItemHTML).join("") : `<p class="search-empty">暂时没有匹配到关联内容。</p>`}</div></section><section class="workflow-section stage-follow-links"><h2>继续查看</h2><div class="workflow-link-row"><a href="index.html#stage-overview">返回项目阶段总览</a><a href="projects.html">查看全部项目</a><a href="knowledge.html">查看知识资产</a></div></section>`;
};

const staticSearchItems = [
  { title: "医美新媒体成长", category: "项目", url: "projects/new-media-growth.html", desc: "视频数据库、引流SOP、评论SOP、风险库、新人培训、AI工作流和项目成果。" },
  { title: "AI工作流项目", category: "项目", url: "projects/ai-workflow.html", desc: "OCR工作流、视频数据库自动化、项目交接卡生成、白皮书生成和网站更新工作流。" },
  { title: "网站项目", category: "项目", url: "projects/ajian-growth-lab.html", desc: "Growth OS 网站核心项目，记录成长系统建设。" },
  { title: "人生规律库", category: "项目", url: "projects/life-rules.html", desc: "生命第一，有生命才有其他东西。健康和安全是成长前提。" },
  { title: "认知库", category: "项目", url: "projects/cognition-library.html", desc: "沉淀重复工作、系统思维、岗位价值和长期能力相关认知。" },
  { title: "视频数据库", category: "子库", url: "projects/video-benchmark.html", desc: "视频样本、内容数据和规律拆解。" },
  { title: "新人培训", category: "子库", url: "projects/account-cold-start.html", desc: "账号从 0 到 1、冷启动 SOP、新人培训和项目进度 20%。" },
  { title: "引流SOP", category: "子库", url: "library.html?id=lead-sop", desc: "私信频率、关注节奏、蓝V承接、评论动作和风控边界。" },
  { title: "评论SOP", category: "子库", url: "library.html?id=comment-sop", desc: "评论引起注意、降低信任成本、等待回关和话术迭代。" },
  { title: "数据记录", category: "文档说明", url: "workflow/data-record.html", desc: "记录睡眠、健康、运营样本、沟通结果和当天状态。" },
  { title: "项目进度", category: "文档说明", url: "workflow/project-progress.html", desc: "拆阶段、里程碑、完成情况和下一步行动。" },
  { title: "实验验证", category: "文档说明", url: "workflow/experiment-validation.html", desc: "用小实验验证 AI、运营、健康和学习想法。" },
  { title: "规律总结", category: "文档说明", url: "workflow/rule-summary.html", desc: "从重复问题里提炼规律，形成方法论。" },
  { title: "内容沉淀", category: "文档说明", url: "workflow/content-archive.html", desc: "沉淀白皮书、交接卡、SOP 和案例库。" },
  { title: "对外输出", category: "文档说明", url: "workflow/public-output.html", desc: "把成果更新到网站，形成可信成长记录。" },
  { title: "成长档案", category: "成长档案", url: "archive.html", desc: "重庆跑外卖、深圳运营、视频数据库、AI 工作流、Growth OS。" },
  { title: "实验库", category: "实验", url: "experiments.html", desc: "AI 实验、运营实验、健康实验、学习实验、生活实验。" },
  { title: "运营实验", category: "实验", url: "experiments/operation.html", desc: "评论沟通、引流路径、风控和沟通轮数优化。" },
  { title: "眼部实验总结", category: "实验", url: "experiments/health.html", desc: "12 点半前睡觉，晚上不要在无光情况下玩手机。" },
  { title: "VPN 稳定性实验", category: "实验", url: "experiments/vpn.html", desc: "VPN 稳定性影响谷歌商店下载、GPT 文件下载和整体工作流。" },
  { title: "从提升能力，到经营自己", category: "白皮书", url: "whitepapers/2026-07-22.html", desc: "时间边界、收入管理、职业形象和长期正循环。" },
  { title: "成长系统开始真正运转", category: "白皮书", url: "whitepapers/2026-07-20.html", desc: "复盘、交接卡、白皮书和网站更新串联起来。" },
  { title: "阿简成长实验室正式启动", category: "白皮书", url: "whitepapers/2026-07-17.html", desc: "从个人网站升级为长期维护的 Growth OS。" },
  { title: "重复工作的背后，是不断升级的思维", category: "白皮书", url: "whitepapers/2026-07-14.html", desc: "重复动作如果持续提出问题、验证假设、沉淀结论，就会变成实验和能力升级。" },
  { title: "项目交接卡_2026-07-22", category: "交接卡", url: "handoffs/2026-07-22.html", desc: "工作筛选标准、职业形象升级、预算管理和作品集主线。" },
  { title: "项目交接卡_2026-07-21", category: "交接卡", url: "handoffs/2026-07-21.html", desc: "首页仪表盘升级、项目进度说明和交互面板。" },
  { title: "项目交接卡_2026-07-17", category: "交接卡", url: "handoffs/2026-07-17.html", desc: "复盘、项目交接卡、成长白皮书、网站更新工作流。" },
  { title: "文档说明", category: "文档说明", url: "#docs", desc: "网站使用说明、导航说明、方法论体系和更新规则。" },
];

const siteSearchItems = [
  ...staticSearchItems,
  ...getAllAssets().map((asset) => ({
    title: asset.title,
    category: getTypeName(asset.type),
    url: assetUrl(asset.id),
    desc: `${asset.content} ${normalizeTags(asset.tags).join(" ")} ${(asset.projects || []).map(getProjectName).join(" ")}`
  }))
];

let searchResults;
if (searchInput) {
  searchResults = document.createElement("div");
  searchResults.className = "search-result-list";
  searchInput.insertAdjacentElement("afterend", searchResults);
}

const applySearch = () => {
  const query = (searchInput?.value || "").trim().toLowerCase();
  searchableCards.forEach((card) => {
    const text = card.textContent.toLowerCase();
    const category = card.dataset.category || "";
    const matchesQuery = !query || text.includes(query);
    const matchesFilter = activeFilter === "全部" || category === activeFilter;
    card.classList.toggle("search-hidden", !(matchesQuery && matchesFilter));
  });

  if (!searchResults) return;
  const results = siteSearchItems.filter((item) => {
    const haystack = `${item.title} ${item.category} ${item.desc}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesFilter = activeFilter === "全部" || item.category === activeFilter;
    return matchesQuery && matchesFilter;
  }).slice(0, 6);

  if (!query && activeFilter === "全部") {
    searchResults.innerHTML = "";
    return;
  }

  searchResults.innerHTML = results.length
    ? results.map((item) => `<a href="${escapeHTML(item.url)}" data-result-category="${escapeHTML(item.category)}"><strong>${escapeHTML(item.title)}</strong><span>${escapeHTML(item.category)} · ${escapeHTML(item.desc)}</span></a>`).join("")
    : `<p class="search-empty">没有找到匹配内容，换个关键词试试。</p>`;
};

if (searchInput) searchInput.addEventListener("input", applySearch);
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    applySearch();
  });
});

const docsModal = document.querySelector("[data-docs-modal]");
document.querySelectorAll("[data-open-docs]").forEach((button) => {
  button.addEventListener("click", () => {
    if (docsModal?.showModal) docsModal.showModal();
  });
});
document.querySelector("[data-close-docs]")?.addEventListener("click", () => docsModal?.close());

renderKnowledgeList();
renderProjectAssets();
renderLibraryPage();
renderAssetDetail();
renderDocumentLists();
renderWorkflowBadges();
renderWorkflowPage();
renderStagePage();
setupManager();
setupLibraryBadges();
setupLocalSearch();
