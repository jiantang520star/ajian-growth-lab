const year = document.querySelector("#year");
const topButton = document.querySelector(".top-button");

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

const searchInput = document.querySelector("#dashboardSearch");
const filterButtons = document.querySelectorAll("[data-filter]");
const searchableCards = document.querySelectorAll(".searchable-card");
let activeFilter = "全部";
const siteSearchItems = [
  { title: "阿简成长实验室", category: "项目", url: "projects/ajian-growth-lab.html", desc: "Growth OS 网站核心项目，记录成长系统建设。" },
  { title: "视频基准库", category: "项目", url: "projects/video-benchmark.html", desc: "视频样本、内容数据和规律拆解。" },
  { title: "新媒体运营成长项目", category: "项目", url: "projects/new-media-growth.html", desc: "引流、用户沟通、风控、转化和运营复盘。" },
  { title: "账号冷启动与新人培训", category: "项目", url: "projects/account-cold-start.html", desc: "账号从 0 到 1、冷启动 SOP、新人培训和项目进度 20%。" },
  { title: "AI 工作流", category: "项目", url: "projects/ai-workflow.html", desc: "ChatGPT、Codex、数据工具和自动化效率。" },
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
