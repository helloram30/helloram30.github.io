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
  "REST APIs",
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
];

const FEATURED_PROJECTS = [
  {
    repo: "GameTheoryArena",
    summary:
      "Interactive game-theory simulations focused on strategic decision making and reproducible outcomes.",
  },
  {
    repo: "WordGroup",
    summary: "Word-based application work emphasizing clean interaction flow and fast iteration cycles.",
  },
  {
    repo: "Agile-requirements-tool",
    summary:
      "Requirements engineering tool from SER515 with practical workflows for user stories and backlog structure.",
  },
  {
    repo: "Substance-Abuse-Tendencies",
    summary:
      "Computer vision and ML project exploring facial-feature-based risk pattern analysis for addiction tendencies.",
  },
  {
    repo: "A-Comparative-Analysis-of-Stock-Value-Prediction-Using-Deep-Learning-And-LSTM",
    summary:
      "Deep learning and LSTM comparative analysis for stock-value prediction across different modeling approaches.",
  },
  {
    repo: "wordle",
    summary: "Lightweight clone project centered on front-end logic, state management, and UX responsiveness.",
  },
];

const el = {
  name: document.querySelector("#name"),
  bio: document.querySelector("#bio"),
  location: document.querySelector("#location"),
  githubLink: document.querySelector("#github-link"),
  repoCount: document.querySelector("#repo-count"),
  followers: document.querySelector("#followers"),
  following: document.querySelector("#following"),
  projectsGrid: document.querySelector("#projects-grid"),
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
  el.name.textContent = user.name || user.login || "Portfolio";
  el.bio.textContent = user.bio || "Software engineer focused on practical, reliable systems.";
  el.location.textContent = user.location || "Location unavailable";
  el.githubLink.href = user.html_url || `https://github.com/${CONFIG.githubUser}`;
  el.repoCount.textContent = user.public_repos ?? "-";
  el.followers.textContent = user.followers ?? "-";
  el.following.textContent = user.following ?? "-";
}

function selectTopProjects(repos) {
  return repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => {
      const scoreA = a.stargazers_count * 3 + a.forks_count * 2 + (a.open_issues_count || 0);
      const scoreB = b.stargazers_count * 3 + b.forks_count * 2 + (b.open_issues_count || 0);
      if (scoreA !== scoreB) return scoreB - scoreA;
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime();
    })
    .slice(0, 6);
}

function getFeaturedProjects(repos) {
  const repoMap = new Map(repos.map((repo) => [repo.name, repo]));
  const curated = FEATURED_PROJECTS.map((item) => {
    const repo = repoMap.get(item.repo);
    if (!repo) return null;
    return { ...repo, customSummary: item.summary };
  }).filter(Boolean);

  if (curated.length >= 3) return curated;

  const fallback = selectTopProjects(repos).map((repo) => ({
    ...repo,
    customSummary: repo.description || "No description provided.",
  }));

  return fallback;
}

function renderProjects(repos) {
  const top = getFeaturedProjects(repos);

  if (!top.length) {
    el.projectsGrid.innerHTML = "<p>No public repositories found.</p>";
    return;
  }

  el.projectsGrid.innerHTML = top
    .map(
      (repo) => `
        <article class="project-card" role="listitem">
          <h3>${repo.name}</h3>
          <p>${repo.customSummary || repo.description || "No description provided."}</p>
          <div class="project-meta">
            <span>${repo.language || "Mixed"}</span>
            <span>★ ${repo.stargazers_count}</span>
          </div>
          <a href="${repo.html_url}" target="_blank" rel="noreferrer">View Repository</a>
        </article>
      `
    )
    .join("");
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

function detectSkills(text) {
  const lower = text.toLowerCase();
  const found = SKILL_KEYWORDS.filter((skill) => lower.includes(skill));
  const normalized = found.map((skill) => {
    if (skill === "node") return "Node.js";
    if (skill === "next.js") return "Next.js";
    if (skill === "rest") return "REST";
    return skill
      .split(" ")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  });

  return [...new Set(normalized)].slice(0, 12);
}

function detectHighlights(text) {
  const clean = text
    .replace(/\s+/g, " ")
    .replace(/[•·●]/g, " ")
    .trim();

  const sentenceCandidates = clean
    .split(/(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 50 && line.length < 180);

  return sentenceCandidates.slice(0, 5);
}

function renderResumeInsights(skills, highlights) {
  const finalSkills = skills.length ? skills : FALLBACK_SKILLS;
  const finalHighlights =
    highlights.length > 0
      ? highlights
      : [
          "Resume parsed successfully. Open the PDF for full professional experience details.",
          "This section updates whenever your local resume PDF is replaced with a newer version.",
        ];

  el.skillsList.innerHTML = finalSkills.map((skill) => `<li>${skill}</li>`).join("");
  el.resumeHighlights.innerHTML = finalHighlights.map((line) => `<li>${line}</li>`).join("");
}

async function init() {
  try {
    const { user, repos } = await fetchGithub();
    renderProfile(user);
    renderProjects(repos);
    renderContact(user);
  } catch {
    el.projectsGrid.innerHTML =
      "<p>Could not load GitHub data right now. Please check your connection and refresh.</p>";
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
      "Could not parse resume content automatically. The resume link still works.";
  }
}

init();
