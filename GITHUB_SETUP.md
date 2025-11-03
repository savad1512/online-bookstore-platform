# GitHub Repository Setup Guide

Complete guide for setting up a single GitHub repository for both frontend (React) and backend (Django microservices).

## 📋 Table of Contents

1. [Repository Structure](#repository-structure)
2. [Initial Setup](#initial-setup)
3. [Git Configuration](#git-configuration)
4. [Branching Strategy](#branching-strategy)
5. [.gitignore Setup](#gitignore-setup)
6. [GitHub Repository Creation](#github-repository-creation)
7. [First Push](#first-push)
8. [Best Practices](#best-practices)

## 🏗️ Repository Structure

Your repository should have this structure:

```
online-bookstore-platform/
├── frontend/                 # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env.example
│   └── ...
├── users-service/           # Django Users microservice
│   ├── accounts/
│   ├── users_service/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── ...
├── books-service/           # Django Books microservice
│   ├── books/
│   ├── books_service/
│   ├── manage.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── ...
├── orders-service/           # Django Orders microservice
├── payments-service/        # Django Payments microservice
├── reviews-service/          # Django Reviews microservice
├── docker-compose.yml        # Local development setup
├── .gitignore               # Root .gitignore
├── README.md                # Main project README
└── LICENSE                   # (Optional) License file
```

## 🚀 Initial Setup

### Step 1: Verify Current Structure

Make sure you're in your project root directory:

```bash
# Windows PowerShell
cd C:\Users\MUHAMMED SAVAD\Desktop\microservice

# List directory structure
ls
```

You should see:
- `frontend/`
- `users-service/`
- `books-service/`
- `orders-service/`
- `payments-service/`
- `reviews-service/`
- `docker-compose.yml`

### Step 2: Initialize Git Repository

```bash
# Initialize git repository (if not already done)
git init

# Check git status
git status
```

### Step 3: Configure Git User (if not set)

```bash
# Set your Git username and email (if not already configured)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Or set globally
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 📝 .gitignore Setup

Ensure your root `.gitignore` includes:

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
ENV/
build/
*.egg-info/
*.log
db.sqlite3
db.sqlite3-journal

# Django
local_settings.py
/staticfiles/
/media/

# Node.js / React
node_modules/
frontend/build/
frontend/.env.local
frontend/.env.development.local
frontend/.env.test.local
frontend/.env.production.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Docker (if you want to ignore some Docker files)
# Uncomment if needed
# *.pid
# *.seed
```

Your current `.gitignore` should already have most of these.

## 🌿 Branching Strategy

### Recommended Branch Structure

```
main (or master)          # Production-ready code
├── develop              # Development branch
├── feature/*            # Feature branches
├── bugfix/*             # Bug fix branches
└── hotfix/*             # Hotfix branches
```

### Initial Branch Setup

```bash
# Create and switch to develop branch
git checkout -b develop

# Or keep everything on main (simpler for now)
# You can create develop branch later
```

## 🔗 GitHub Repository Creation

### Option 1: Create Repository via GitHub Web Interface

1. **Go to GitHub**
   - Navigate to https://github.com
   - Sign in to your account

2. **Create New Repository**
   - Click the "+" icon in top right
   - Select "New repository"

3. **Repository Settings**
   - **Repository name**: `online-bookstore-platform` (or your preferred name)
   - **Description**: "Online Bookstore Platform - Django Microservices + React Frontend"
   - **Visibility**: 
     - Public (visible to everyone)
     - Private (only you/collaborators can see)
   - **DO NOT** check:
     - ❌ Add a README file (you already have one)
     - ❌ Add .gitignore (you already have one)
     - ❌ Choose a license (optional, add later if needed)
   - Click **"Create repository"**

4. **Copy Repository URL**
   - After creation, GitHub will show you the repository URL
   - It will look like: `https://github.com/yourusername/online-bookstore-platform.git`
   - Or SSH: `git@github.com:yourusername/online-bookstore-platform.git`

### Option 2: Create Repository via GitHub CLI (if installed)

```bash
# Install GitHub CLI first if needed
# Then create repository
gh repo create online-bookstore-platform --public --description "Online Bookstore Platform - Django Microservices + React Frontend"
```

## 📤 First Push to GitHub

### Step 1: Add Remote Repository

```bash
# Replace with your actual repository URL
git remote add origin https://github.com/yourusername/online-bookstore-platform.git

# Or if using SSH
# git remote add origin git@github.com:yourusername/online-bookstore-platform.git

# Verify remote is added
git remote -v
```

### Step 2: Stage All Files

```bash
# Check what will be added
git status

# Add all files (except those in .gitignore)
git add .

# Or add specific directories if you want more control
# git add frontend/
# git add users-service/
# git add books-service/
# git add orders-service/
# git add payments-service/
# git add reviews-service/
# git add docker-compose.yml
# git add README.md
# git add .gitignore
```

### Step 3: Create Initial Commit

```bash
# Create your first commit
git commit -m "Initial commit: Online Bookstore Platform

- Added 5 Django microservices (Users, Books, Orders, Payments, Reviews)
- Added React frontend application
- Added Docker Compose for local development
- Added documentation and setup guides"

# Or a simpler message
git commit -m "Initial commit"
```

### Step 4: Push to GitHub

```bash
# Push to main branch
git branch -M main  # Rename current branch to 'main' if needed
git push -u origin main

# If you get authentication error, you may need to:
# 1. Use Personal Access Token instead of password
# 2. Or set up SSH keys
```

### Step 5: Verify on GitHub

1. Go to your repository on GitHub
2. Refresh the page
3. You should see all your files and folders
4. Check that:
   - ✅ All service directories are present
   - ✅ Frontend directory is present
   - ✅ README.md is visible
   - ✅ .gitignore is working (no node_modules, __pycache__, etc.)

## 🔄 Common Git Commands

### Daily Workflow

```bash
# Check status
git status

# Add changes
git add .
# Or add specific file
git add frontend/src/components/BookCard.js

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# View commit history
git log --oneline

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main
git checkout develop
```

### Working with Multiple Directories

```bash
# Commit changes in specific service
git add users-service/
git commit -m "Update users service"

# Commit frontend changes separately
git add frontend/
git commit -m "Update frontend UI"

# Or commit everything at once
git add .
git commit -m "Update multiple services"
```

## 📋 Pre-Push Checklist

Before pushing to GitHub, verify:

- [ ] `.gitignore` is configured correctly
- [ ] No sensitive data (passwords, API keys) in code
- [ ] No large files (use Git LFS if needed)
- [ ] Environment files are in `.gitignore`
- [ ] `node_modules` and `__pycache__` are excluded
- [ ] README.md is updated
- [ ] All services have their required files

## 🔐 GitHub Authentication

### Option 1: Personal Access Token (Recommended)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Select scopes: `repo` (full control)
4. Copy token
5. Use token as password when pushing

### Option 2: SSH Keys

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your.email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH and GPG keys → New SSH key
```

## 📁 Repository Organization Tips

### 1. Keep Services Separate

Each microservice should be in its own directory:
```
✅ Good:
├── users-service/
├── books-service/

❌ Bad:
├── services/users/
├── services/books/
```

### 2. Documentation Location

```
✅ Good:
├── README.md (root - main documentation)
├── frontend/README.md (frontend-specific)
├── frontend/AWS_DEPLOYMENT.md (frontend deployment)

❌ Bad:
├── docs/README.md (buried documentation)
```

### 3. Environment Files

```
✅ Keep in .gitignore:
- .env
- .env.local
- .env.production

✅ Keep examples:
- .env.example
- frontend/.env.example
```

## 🎯 Next Steps After Setup

Once your repository is set up, you can:

1. **Set up branch protection** (Settings → Branches)
2. **Add collaborators** (Settings → Collaborators)
3. **Enable GitHub Actions** (for future CI/CD)
4. **Add issue templates** (for bug reports, features)
5. **Create pull request templates**
6. **Set up webhooks** (for deployment triggers)

## ❓ Troubleshooting

### Issue: "Authentication failed"

**Solution:**
- Use Personal Access Token instead of password
- Or set up SSH keys

### Issue: "Repository not found"

**Solution:**
- Check repository name spelling
- Verify you have access to the repository
- Check remote URL: `git remote -v`

### Issue: "Large file warning"

**Solution:**
- Check `.gitignore` includes `node_modules/` and `__pycache__/`
- Use `git rm --cached <file>` to remove tracked large files
- Consider Git LFS for large binary files

### Issue: "Push rejected"

**Solution:**
```bash
# Pull latest changes first
git pull origin main --rebase

# Then push again
git push origin main
```

## 📚 Additional Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com/)
- [Git Branching Strategy](https://www.atlassian.com/git/tutorials/comparing-workflows)

---

## ✅ Quick Setup Commands (Copy-Paste)

```bash
# 1. Navigate to project
cd C:\Users\MUHAMMED SAVAD\Desktop\microservice

# 2. Initialize git (if not done)
git init

# 3. Add remote (replace with your repo URL)
git remote add origin https://github.com/yourusername/online-bookstore-platform.git

# 4. Stage all files
git add .

# 5. Commit
git commit -m "Initial commit: Online Bookstore Platform"

# 6. Push to GitHub
git branch -M main
git push -u origin main
```

---

**🎉 Your repository is now ready for collaborative development!**

