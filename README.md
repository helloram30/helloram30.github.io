# Ram Portfolio

Minimalist portfolio website with automatic sync from:
- GitHub profile and repositories (live via GitHub API)
- Local resume PDF (`Ramchander Venugopal - Resume.pdf`) parsed in the browser
- Curated featured projects mapped to your GitHub repo names in `app.js`

## Run locally

Because browsers block local module/file fetch behavior for this project, run with a small local server:

```bash
python3 -m http.server 8080
```

Then open:

`http://localhost:8080`

## Update flow

- Update GitHub profile/projects: reflected on refresh.
- Replace resume PDF file with newer content but same filename: reflected on refresh.
- If your GitHub username changes, update `CONFIG.githubUser` in `app.js`.
- Update contact links in `CONFIG.contact` (`app.js`) if your email or LinkedIn URL changes.
