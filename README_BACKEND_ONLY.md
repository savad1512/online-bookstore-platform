# Backend Testing - Quick Start

## 📋 For Backend Testing Only

**Use this file:** **[BACKEND_TESTING_GUIDE.md](./BACKEND_TESTING_GUIDE.md)**

It contains everything you need to:
- Set up Docker on EC2 (Ubuntu)
- Start all backend services
- Test all 5 microservices
- Verify everything works

## 🚀 Quick Commands

```bash
# On EC2
cd ~/microservice
chmod +x EC2_SETUP_UBUNTU.sh
./EC2_SETUP_UBUNTU.sh
newgrp docker

# Start services
docker-compose up --build -d

# Test
curl http://localhost:8001
curl http://YOUR-EC2-IP:8001
```

## 📚 Files You Need

- **BACKEND_TESTING_GUIDE.md** - Complete backend testing guide
- **EC2_SETUP_UBUNTU.sh** - Setup script for Ubuntu EC2
- **docker-compose.yml** - Starts databases + services (no RDS needed)

## 📝 After Backend Testing

Once backend is working, let me know and I'll guide you through frontend deployment!

---

**Start here:** [BACKEND_TESTING_GUIDE.md](./BACKEND_TESTING_GUIDE.md)

