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
const getProjectName = (id) => (defaultData.projects || []).find((item) => item.id === id)?.title || id;
const todayISO = () => new Date().toISOString().slice(0, 10);
const normalizeTags = (value) => Array.isArray(value) ? value : String(value || "").split(/[,，]/).map((item) => item.trim()).filter(Boolean);
const getAssetDate = (asset) => asset.date || asset.updatedAt || asset.createdAt || "";
const getAssetSummary = (asset) => asset.summary || asset.content || "";

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
  workflow.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      workflow.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      if (workflowOutput) workflowOutput.textContent = button.dataset.workflowDetail || "";
    });
  });
}

const assetCardHTML = (asset) => {
  const tags = normalizeTags(asset.tags).map((tag) => `<span>${tag}</span>`).join("");
  const projects = (asset.projects || []).map((id) => getProjectName(id)).join(" / ");
  return `<article class="asset-card" data-local-item data-asset-id="${asset.id}" data-tags="${normalizeTags(asset.tags).join(" ")}" data-date="${getAssetDate(asset)}" data-summary="${getAssetSummary(asset)}">
    <div class="asset-meta"><span>${getTypeName(asset.type)}</span><time>${getAssetDate(asset)}</time></div>
    <h3>${asset.title}</h3>
    <p>${getAssetSummary(asset)}</p>
    <div class="asset-tags">${tags}</div>
    <small>关联项目：${projects || "未关联"}</small>
  </article>`;
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
  });

  renderManagerList();
};

const searchInput = document.querySelector("#dashboardSearch");
const filterButtons = document.querySelectorAll("[data-filter]");
const searchableCards = document.querySelectorAll(".searchable-card");
let activeFilter = "全部";
const staticSearchItems = [
  { title: "医美新媒体成长", category: "项目", url: "projects/new-media-growth.html", desc: "视频数据库、引流SOP、评论SOP、风险库、新人培训、AI工作流和项目成果。" },
  { title: "AI工作流项目", category: "项目", url: "projects/ai-workflow.html", desc: "OCR工作流、视频数据库自动化、项目交接卡生成、白皮书生成和网站更新工作流。" },
  { title: "网站项目", category: "项目", url: "projects/ajian-growth-lab.html", desc: "Growth OS 网站核心项目，记录成长系统建设。" },
  { title: "人生规律库", category: "项目", url: "projects/life-rules.html", desc: "生命第一，有生命才有其他东西。健康和安全是成长前提。" },
  { title: "视频数据库", category: "子库", url: "projects/video-benchmark.html", desc: "视频样本、内容数据和规律拆解。" },
  { title: "新人培训", category: "子库", url: "projects/account-cold-start.html", desc: "账号从 0 到 1、冷启动 SOP、新人培训和项目进度 20%。" },
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
    url: "knowledge.html",
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
    ? results.map((item) => `<a href="${item.url}" data-result-category="${item.category}"><strong>${item.title}</strong><span>${item.category} · ${item.desc}</span></a>`).join("")
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
setupManager();
setupLocalSearch();
