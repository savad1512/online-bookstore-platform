# 🚀 Quick GitHub Repository Setup

## Step-by-Step Guide

### 1️⃣ Create Repository on GitHub

1. Go to https://github.com
2. Click **"+"** → **"New repository"**
3. Fill in:
   - **Name**: `online-bookstore-platform`
   - **Description**: "Django Microservices + React Frontend"
   - **Visibility**: Choose Public or Private
   - **❌ DO NOT** check any boxes (README, .gitignore, license)
4. Click **"Create repository"**
5. **Copy the repository URL** (you'll need it in step 3)

### 2️⃣ Setup Local Repository

Open PowerShell in your project directory:

```powershell
# Navigate to project (if not already there)
cd C:\Users\MUHAMMED SAVAD\Desktop\microservice

# Initialize git (if not already done)
git init

# Check current status
git status
```

### 3️⃣ Connect to GitHub

```powershell
# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/online-bookstore-platform.git

# Verify it's added
git remote -v
```

### 4️⃣ Prepare Files

```powershell
# See what will be committed
git status

# Add all files (respects .gitignore)
git add .
```

### 5️⃣ Create First Commit

```powershell
git commit -m "Initial commit: Online Bookstore Platform"
```

### 6️⃣ Push to GitHub

```powershell
# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** If asked for credentials:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)

### 7️⃣ Create Personal Access Token (if needed)

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token
3. Select `repo` scope
4. Copy token and use it as password

## ✅ Verify

1. Go to your GitHub repository
2. You should see all your folders:
   - `frontend/`
   - `users-service/`
   - `books-service/`
   - `orders-service/`
   - `payments-service/`
   - `reviews-service/`
   - `docker-compose.yml`
   - `README.md`

## 📝 Repository Structure on GitHub

```
online-bookstore-platform/
├── frontend/
├── users-service/
├── books-service/
├── orders-service/
├── payments-service/
├── reviews-service/
├── docker-compose.yml
├── README.md
└── .gitignore
```

## 🔄 Daily Workflow

```powershell
# 1. Check what changed
git status

# 2. Add changes
git add .

# 3. Commit
git commit -m "Description of changes"

# 4. Push to GitHub
git push origin main
```

## 🎯 That's It!

Your repository is now on GitHub and ready for collaboration.

**Future:** When you're ready, you can set up:
- GitHub Actions for frontend deployment
- Jenkins + ArgoCD for backend deployment
- Branch protection rules
- Pull request templates

---

**Need help?** Check `GITHUB_SETUP.md` for detailed instructions.

