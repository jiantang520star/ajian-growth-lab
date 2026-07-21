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
  workflow.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      workflow.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });
}

const searchInput = document.querySelector("#dashboardSearch");
const filterButtons = document.querySelectorAll("[data-filter]");
const searchableCards = document.querySelectorAll(".searchable-card");
let activeFilter = "全部";

const applySearch = () => {
  const query = (searchInput?.value || "").trim().toLowerCase();
  searchableCards.forEach((card) => {
    const text = card.textContent.toLowerCase();
    const category = card.dataset.category || "";
    const matchesQuery = !query || text.includes(query);
    const matchesFilter = activeFilter === "全部" || category === activeFilter;
    card.classList.toggle("search-hidden", !(matchesQuery && matchesFilter));
  });
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
