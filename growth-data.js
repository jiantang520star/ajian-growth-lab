window.GROWTH_OS_DATA = {
  assetTypes: [
    { id: "database", name: "数据库" },
    { id: "sop", name: "SOP" },
    { id: "rule", name: "规律" },
    { id: "risk", name: "风险" },
    { id: "case", name: "案例" },
    { id: "script", name: "话术" },
    { id: "ai", name: "AI知识" }
  ],
  projects: [
    { id: "growth-lab", title: "阿简成长实验室", url: "projects/ajian-growth-lab.html", status: "进行中", tags: ["Growth OS", "网站"] },
    { id: "video-benchmark", title: "视频基准库", url: "projects/video-benchmark.html", status: "进行中", tags: ["数据", "视频"] },
    { id: "new-media-growth", title: "新媒体运营成长项目", url: "projects/new-media-growth.html", status: "进行中", tags: ["运营", "转化"] },
    { id: "ai-workflow", title: "AI工作流", url: "projects/ai-workflow.html", status: "进行中", tags: ["AI", "自动化"] },
    { id: "account-cold-start", title: "账号冷启动与新人培训", url: "projects/account-cold-start.html", status: "20%", tags: ["冷启动", "培训"] },
    { id: "life-rules", title: "人生规律库", url: "projects/life-rules.html", status: "长期沉淀", tags: ["规律", "判断系统"] }
  ],
  assets: [
    {
      id: "rule-life-first",
      title: "生命第一",
      type: "rule",
      content: "有生命才有其他的东西。健康、安全和基本生存状态，是成长、收入、项目、机会、关系和长期规划的前提。",
      projects: ["life-rules", "new-media-growth"],
      tags: ["生命", "健康", "底层原则"],
      status: "已沉淀",
      createdAt: "2026-07-22",
      updatedAt: "2026-07-22"
    },
    {
      id: "sop-account-cold-start",
      title: "账号冷启动 SOP 雏形",
      type: "sop",
      content: "账号从 0 到 1 需要先完成定位、基础资料、内容测试、评论互动和初始数据观察，再把有效动作整理成新人可执行清单。",
      projects: ["account-cold-start", "new-media-growth"],
      tags: ["账号冷启动", "SOP", "新人培训"],
      status: "草稿",
      createdAt: "2026-07-22",
      updatedAt: "2026-07-22"
    },
    {
      id: "case-operation-544",
      title: "运营案例 544+ 持续沉淀",
      type: "case",
      content: "把引流、评论沟通、转化反馈和风控问题作为长期案例库沉淀，后续用于总结可复用运营规律。",
      projects: ["new-media-growth"],
      tags: ["运营案例", "引流", "转化"],
      status: "持续更新",
      createdAt: "2026-07-22",
      updatedAt: "2026-07-22"
    },
    {
      id: "risk-vpn-stability",
      title: "VPN 稳定性影响工具链",
      type: "risk",
      content: "VPN 稳定性不只影响谷歌商店下载，也会影响 GPT 生成文件下载、资料访问和 AI 工作流连续性。",
      projects: ["ai-workflow", "growth-lab"],
      tags: ["VPN", "稳定性", "下载"],
      status: "已记录",
      createdAt: "2026-07-22",
      updatedAt: "2026-07-22"
    },
    {
      id: "rule-eye-rest",
      title: "眼部恢复规则",
      type: "rule",
      content: "每天尽量凌晨 12 点半前睡觉，晚上不要在无光情况下玩手机，减少第二天眼睛疲劳和精力下滑。",
      projects: ["life-rules"],
      tags: ["眼睛", "睡眠", "健康"],
      status: "已沉淀",
      createdAt: "2026-07-22",
      updatedAt: "2026-07-22"
    },
    {
      id: "ai-codex-site-flow",
      title: "Codex 更新网站工作流",
      type: "ai",
      content: "每天复盘后生成项目交接卡和成长白皮书，再由 Codex 更新网站，形成“记录-沉淀-发布”的连续协作流程。",
      projects: ["growth-lab", "ai-workflow"],
      tags: ["Codex", "网站更新", "AI协作"],
      status: "运行中",
      createdAt: "2026-07-20",
      updatedAt: "2026-07-22"
    }
  ]
};
