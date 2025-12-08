# Deploying to Railway

This file describes the minimal steps to deploy the chat app to Railway (https://railway.app).

Prerequisites
- Git installed and repo pushed to GitHub.
- Railway account (sign up at https://railway.app).

1) Verify local start
```powershell
cd 'c:\Users\Talon\OneDrive\Desktop\network_&_Data\Chat Project\main'
npm install
npm start
```
Open `http://localhost:3000` (or the port Railway assigns) to confirm the app runs locally.

2) Push to GitHub
- Initialize git (if not already):
```powershell
git init
git add .
git commit -m "Initial commit: chat app ready for Railway"
# create a GitHub repo and add remote, then:
git push -u origin main
```

3) Create a new Railway project
- Sign in to Railway and choose "Deploy from GitHub".
- Connect your GitHub account and select the repository and branch.

4) Railway config
- Railway auto-detects Node.js projects. If prompted:
  - Build command: `npm install`
  - Start command: `npm start`
- Railway sets `PORT` automatically; your app reads `process.env.PORT`.

5) Environment & domain
- Web service will get a public `https://` URL from Railway after deploy.
- To use a custom domain, add it in Railway's dashboard and update DNS records with your DNS provider.

6) Tips for production
- Consider switching `io` CORS origin from `"*"` to a restricted origin (your domain).
- Add input sanitization to prevent XSS in messages.
- For scaling across multiple instances, use a Redis adapter for `socket.io`.

7) Optional: Docker
- If you prefer deploying via Docker, add a `Dockerfile` and configure Railway to build from Docker.

That's it — Railway will redeploy on each push to the connected branch. If you want, I can push these changes and help connect the repo to Railway or prepare a `Dockerfile`/`Procfile`.
