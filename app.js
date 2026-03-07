const CONFIG = {
  githubUser: "helloram30",
  resumePdfPath: "Ramchander Venugopal - Resume.pdf",
  contact: {
    email: "helloram30@gmail.com",
    linkedin: "https://www.linkedin.com/in/helloram30",
  },
};

const FALLBACK_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "SQL",
  "AWS",
  "Docker",
  "Git",
  "Machine Learning",
];

const SKILL_KEYWORDS = [
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node",
  "express",
  "python",
  "java",
  "c++",
  "sql",
  "mongodb",
  "postgresql",
  "aws",
  "azure",
  "docker",
  "kubernetes",
  "git",
  "graphql",
  "rest",
  "machine learning",
  "tensorflow",
  "pytorch",
  "scikit",
  "lstm",
];

const FEATURED_PROJECTS = [
  {
    repo: "GameTheoryArena",
    summary:
      "Interactive game-theory simulations focused on strategy testing and reproducible outcomes.",
  },
  {
    repo: "WordGroup",
    summary: "Word-centric product work with emphasis on UX clarity and iterative development.",
  },
  {
    repo: "Agile-requirements-tool",
    summary:
      "Requirements engineering tool from SER515, built to structure user stories and backlog planning.",
  },
  {
    repo: "Substance-Abuse-Tendencies",
    summary:
      "Applied ML and computer vision project analyzing facial-feature patterns for risk classification.",
  },
  {
    repo: "A-Comparative-Analysis-of-Stock-Value-Prediction-Using-Deep-Learning-And-LSTM",
    summary: "Deep-learning comparison project for stock-value prediction, including LSTM models.",
  },
  {
    repo: "wordle",
    summary: "Frontend game project centered on state management and responsive interaction design.",
  },
];

const el = {
  brandName: document.querySelector("#brand-name"),
  bioText: document.querySelector("#bio-text"),
  location: document.querySelector("#location"),
  githubLink: document.querySelector("#github-link"),
  repoCount: document.querySelector("#repo-count"),
  followers: document.querySelector("#followers"),
  following: document.querySelector("#following"),
  focusArea: document.querySelector("#focus-area"),
  projectsList: document.querySelector("#projects-list"),
  selectedProjectName: document.querySelector("#selected-project-name"),
  selectedProjectDescription: document.querySelector("#selected-project-description"),
  selectedProjectMeta: document.querySelector("#selected-project-meta"),
  selectedProjectLink: document.querySelector("#selected-project-link"),
  skillsList: document.querySelector("#skills-list"),
  resumeHighlights: document.querySelector("#resume-highlights"),
  resumeStatus: document.querySelector("#resume-status"),
  contactEmail: document.querySelector("#contact-email"),
  contactGithub: document.querySelector("#contact-github"),
  contactLinkedin: document.querySelector("#contact-linkedin"),
  year: document.querySelector("#year"),
};

el.year.textContent = String(new Date().getFullYear());

async function fetchGithub() {
  const [userResponse, reposResponse] = await Promise.all([
    fetch(`https://api.github.com/users/${CONFIG.githubUser}`),
    fetch(`https://api.github.com/users/${CONFIG.githubUser}/repos?per_page=100&sort=updated`),
  ]);

  if (!userResponse.ok || !reposResponse.ok) {
    throw new Error("Unable to load GitHub data.");
  }

  const user = await userResponse.json();
  const repos = await reposResponse.json();
  return { user, repos };
}

function renderProfile(user) {
  const nameValue = user.name || user.login || "ram";
  const shellName = nameValue.toLowerCase().replace(/\s+/g, "");

  el.brandName.textContent = `guest@${shellName}.dev`;
  el.bioText.textContent =
    user.bio ||
    "Software engineer focused on dependable systems, practical product execution, and measurable outcomes.";
  el.location.textContent = user.location || "Location unavailable";
  el.githubLink.href = user.html_url || `https://github.com/${CONFIG.githubUser}`;
  el.repoCount.textContent = user.public_repos ?? "-";
  el.followers.textContent = user.followers ?? "-";
  el.following.textContent = user.following ?? "-";
}

function daysSince(dateValue) {
  const now = Date.now();
  const then = new Date(dateValue).getTime();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function projectScore(repo) {
  // Score projects with recency + usage signals to avoid stale featured picks.
  const stars = repo.stargazers_count || 0;
  const forks = repo.forks_count || 0;
  const watchers = repo.watchers_count || 0;
  const issues = repo.open_issues_count || 0;
  const recencyBoost = Math.max(0, 40 - daysSince(repo.pushed_at));
  return stars * 4 + forks * 3 + watchers * 2 + issues + recencyBoost;
}

function selectTopProjects(repos) {
  return repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => projectScore(b) - projectScore(a))
    .slice(0, 8);
}

function getFeaturedProjects(repos) {
  const repoMap = new Map(repos.map((repo) => [repo.name, repo]));

  const curated = FEATURED_PROJECTS.map((item) => {
    const repo = repoMap.get(item.repo);
    if (!repo) return null;
    return { ...repo, customSummary: item.summary };
  }).filter(Boolean);

  if (curated.length >= 4) return curated;

  return selectTopProjects(repos).map((repo) => ({
    ...repo,
    customSummary: repo.description || "No description provided.",
  }));
}

function formatProjectDate(isoDate) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

function inferFocusArea(repos) {
  const languageCount = new Map();
  repos.forEach((repo) => {
    if (!repo.language) return;
    languageCount.set(repo.language, (languageCount.get(repo.language) || 0) + 1);
  });

  const top = [...languageCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([language]) => language.toLowerCase());

  el.focusArea.textContent = top.length ? top.join(" + ") : "web + ml";
}

function renderSelectedProject(repo) {
  if (!repo) return;

  el.selectedProjectName.textContent = repo.name;
  el.selectedProjectDescription.textContent =
    repo.customSummary || repo.description || "No description provided.";

  const metaItems = [
    `language: ${repo.language || "mixed"}`,
    `stars: ${repo.stargazers_count || 0}`,
    `forks: ${repo.forks_count || 0}`,
    `updated: ${formatProjectDate(repo.pushed_at)}`,
  ];

  el.selectedProjectMeta.innerHTML = metaItems.map((item) => `<li>${item}</li>`).join("");
  el.selectedProjectLink.href = repo.html_url;
}

function setActiveProject(repoName) {
  const items = el.projectsList.querySelectorAll(".project-item");
  items.forEach((item) => {
    if (item.dataset.repo === repoName) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

function renderProjects(repos) {
  const featured = getFeaturedProjects(repos);

  if (!featured.length) {
    el.projectsList.innerHTML = "<li class=\"project-item\"><div class=\"project-trigger\">No public repositories found.</div></li>";
    return;
  }

  el.projectsList.innerHTML = featured
    .map(
      (repo) => `
        <li class="project-item" data-repo="${repo.name}" role="listitem">
          <button type="button" class="project-trigger" aria-label="Select ${repo.name}">
            <div class="project-main">
              <span class="project-name">${repo.name}</span>
              <span class="project-lang">${(repo.language || "mixed").toLowerCase()}</span>
            </div>
            <p class="project-desc">${repo.customSummary || repo.description || "No description provided."}</p>
          </button>
        </li>
      `
    )
    .join("");

  const first = featured[0];
  renderSelectedProject(first);
  setActiveProject(first.name);

  featured.forEach((repo) => {
    const item = el.projectsList.querySelector(`[data-repo="${repo.name}"]`);
    const trigger = item?.querySelector(".project-trigger");
    if (!item || !trigger) return;

    const activate = () => {
      renderSelectedProject(repo);
      setActiveProject(repo.name);
    };

    trigger.addEventListener("mouseenter", activate);
    trigger.addEventListener("focus", activate);
    trigger.addEventListener("click", activate);
  });
}

function renderContact(user) {
  const githubUrl = user.html_url || `https://github.com/${CONFIG.githubUser}`;

  el.contactEmail.href = `mailto:${CONFIG.contact.email}`;
  el.contactEmail.querySelector("strong").textContent = CONFIG.contact.email;

  el.contactGithub.href = githubUrl;
  el.contactGithub.querySelector("strong").textContent = githubUrl.replace("https://", "");

  el.contactLinkedin.href = CONFIG.contact.linkedin;
  el.contactLinkedin.querySelector("strong").textContent = CONFIG.contact.linkedin.replace(
    "https://",
    ""
  );
}

async function extractTextFromPdf(url) {
  const pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs");

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";

  const loadingTask = pdfjsLib.getDocument(url);
  const pdf = await loadingTask.promise;
  const pages = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item) => item.str).join(" ");
    pages.push(text);
  }

  return pages.join("\n");
}

function normalizeSkill(skill) {
  if (skill === "node") return "Node.js";
  if (skill === "next.js") return "Next.js";
  if (skill === "rest") return "REST";
  if (skill === "scikit") return "Scikit-Learn";
  if (skill === "lstm") return "LSTM";

  return skill
    .split(" ")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function detectSkills(text) {
  const lower = text.toLowerCase();
  const found = SKILL_KEYWORDS.filter((skill) => lower.includes(skill));
  const normalized = found.map(normalizeSkill);
  return [...new Set(normalized)].slice(0, 14);
}

function detectHighlights(text) {
  const clean = text.replace(/\s+/g, " ").replace(/[•·●]/g, " ").trim();

  const sentenceCandidates = clean
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 52 && line.length < 190);

  if (sentenceCandidates.length) {
    return sentenceCandidates.slice(0, 5);
  }

  return clean
    .split(/\s{2,}|\|/)
    .map((line) => line.trim())
    .filter((line) => line.length > 40 && line.length < 180)
    .slice(0, 5);
}

function renderResumeInsights(skills, highlights) {
  const finalSkills = skills.length ? skills : FALLBACK_SKILLS;
  const finalHighlights =
    highlights.length > 0
      ? highlights
      : [
          "Resume parsed successfully. Open the PDF for full professional experience details.",
          "This section updates automatically whenever your local resume PDF changes.",
        ];

  el.skillsList.innerHTML = finalSkills.map((skill) => `<li>${skill}</li>`).join("");
  el.resumeHighlights.innerHTML = finalHighlights.map((line) => `<li>${line}</li>`).join("");
}

async function init() {
  try {
    const { user, repos } = await fetchGithub();
    renderProfile(user);
    renderProjects(repos);
    inferFocusArea(repos);
    renderContact(user);
  } catch {
    el.projectsList.innerHTML =
      "<li class=\"project-item\"><div class=\"project-trigger\">Could not load GitHub data. Check your connection and refresh.</div></li>";
  }

  try {
    const resumeText = await extractTextFromPdf(CONFIG.resumePdfPath);
    const skills = detectSkills(resumeText);
    const highlights = detectHighlights(resumeText);
    renderResumeInsights(skills, highlights);
    el.resumeStatus.textContent = "Resume synced from local PDF.";
  } catch {
    renderResumeInsights([], []);
    el.resumeStatus.textContent =
      "Could not parse resume automatically. Resume PDF link remains available.";
  }
}

init();
