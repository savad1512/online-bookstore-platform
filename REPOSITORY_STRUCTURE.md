# Repository Structure

This document describes the structure of the online-bookstore-platform repository.

## 📂 Complete Directory Structure

```
online-bookstore-platform/
│
├── frontend/                          # React Frontend Application
│   ├── src/
│   │   ├── components/               # React components
│   │   │   └── Layout/               # Layout components (Navbar, Footer)
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API service layer
│   │   ├── utils/                    # Utility functions
│   │   ├── App.js                    # Main app component
│   │   └── index.js                  # Entry point
│   ├── public/                       # Static files
│   ├── package.json                  # Node.js dependencies
│   ├── .env.example                  # Environment variables example
│   ├── README.md                     # Frontend documentation
│   └── AWS_DEPLOYMENT.md             # AWS deployment guide
│
├── users-service/                     # Users Microservice (Django)
│   ├── accounts/                     # Django app
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── users_service/                 # Django project settings
│   │   ├── settings.py
│   │   └── urls.py
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── books-service/                     # Books Microservice (Django)
│   ├── books/                        # Django app
│   ├── books_service/                # Django project settings
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── orders-service/                    # Orders Microservice (Django)
│   ├── orders/                       # Django app
│   ├── orders_service/               # Django project settings
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── payments-service/                  # Payments Microservice (Django)
│   ├── payments/                     # Django app
│   ├── payments_service/             # Django project settings
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── reviews-service/                   # Reviews Microservice (Django)
│   ├── reviews/                      # Django app
│   ├── reviews_service/              # Django project settings
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml                # Docker Compose for local development
│
├── README.md                          # Main project documentation
├── API_ENDPOINTS.md                   # API endpoints reference
├── GITHUB_SETUP.md                   # GitHub repository setup guide
├── QUICK_GITHUB_SETUP.md             # Quick setup guide
├── FRONTEND_SUMMARY.md                # Frontend implementation summary
├── REPOSITORY_STRUCTURE.md           # This file
└── .gitignore                         # Git ignore rules
```

## 🎯 Why This Structure?

### Monorepo Approach

This is a **monorepo** (monolithic repository) containing:
- **Backend**: 5 independent Django microservices
- **Frontend**: 1 React application

### Benefits

1. **Single Source of Truth**: All code in one place
2. **Easy Collaboration**: Developers can see the full stack
3. **Atomic Commits**: Changes across services can be committed together
4. **Simplified CI/CD**: One repository to configure
5. **Version Synchronization**: Easier to track related changes

### Folder Organization

#### Frontend (`frontend/`)
- Self-contained React application
- Has its own `package.json` and dependencies
- Can be developed/deployed independently

#### Backend Services (`*-service/`)
- Each service is independent
- Own database, dependencies, and Dockerfile
- Can be deployed separately to EKS

#### Root Level
- Shared configuration (`docker-compose.yml`)
- Documentation files
- CI/CD configuration (when added)

## 📋 File Naming Conventions

### Services
- Use kebab-case: `users-service`, `books-service`
- Clear, descriptive names

### Python/Django
- Follow Django conventions
- `models.py`, `views.py`, `serializers.py`

### React
- PascalCase for components: `BookCard.js`
- camelCase for utilities: `auth.js`, `cart.js`

## 🔒 What Gets Ignored (.gitignore)

### Python Files
- `__pycache__/`
- `*.pyc`
- Virtual environments (`venv/`, `env/`)

### Node.js Files
- `node_modules/`
- `frontend/build/`
- Log files

### Environment Files
- `.env`
- `.env.local`
- But keep `.env.example`

### IDE Files
- `.vscode/`
- `.idea/`
- OS files (`.DS_Store`, `Thumbs.db`)

## 🚀 Deployment Strategy

### Frontend
- **Location**: `frontend/`
- **Deployment**: AWS S3 + CloudFront
- **Build**: `npm run build` creates `frontend/build/`

### Backend Services
- **Location**: `*-service/` directories
- **Deployment**: ECR (Docker images) → EKS (Kubernetes)
- **Build**: Docker builds each service independently

### Future CI/CD
- **Frontend**: GitHub Actions (automated S3 deployment)
- **Backend**: Jenkins pipeline (builds Docker images, pushes to ECR)
- **ArgoCD**: Syncs ECR images to EKS cluster

## 📝 Best Practices

### 1. Keep Services Separate
✅ Each microservice in its own directory
❌ Don't mix services together

### 2. Documentation
✅ Keep docs at root level for visibility
✅ Service-specific docs in service directories

### 3. Environment Variables
✅ Always include `.env.example` files
❌ Never commit `.env` files with secrets

### 4. Commits
✅ Commit related changes together
✅ Use descriptive commit messages
✅ Separate commits for frontend vs backend when unrelated

### 5. Branching
- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes

## 🔄 Common Workflows

### Working on Frontend
```bash
cd frontend
npm install
npm start
# Make changes
git add frontend/
git commit -m "Update frontend UI"
git push origin main
```

### Working on Backend Service
```bash
cd users-service
# Make changes
git add users-service/
git commit -m "Update users service"
git push origin main
```

### Working on Multiple Components
```bash
# Make changes to multiple services/frontend
git add .
git commit -m "Update multiple components"
git push origin main
```

## ✅ Repository Checklist

Before pushing, ensure:
- [x] All services are in separate directories
- [x] Frontend is in `frontend/` directory
- [x] `.gitignore` is configured correctly
- [x] No sensitive data in code
- [x] Documentation is up to date
- [x] README.md explains the project
- [x] Each service has its `requirements.txt`/`package.json`

---

**This structure supports both independent development and integrated deployment!** 🎉

