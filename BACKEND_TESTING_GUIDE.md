# Backend Testing Guide - Ubuntu EC2 (No RDS)

## 🎯 Goal
Test all 5 backend microservices on EC2 before deploying frontend.

## ✅ Prerequisites
- ✅ EC2 Ubuntu instance created
- ✅ Source code cloned to EC2
- ✅ Security groups configured (ports 8001-8005)

---

## 📋 Step-by-Step Backend Setup

### Step 1: Connect to EC2

**From your local machine:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### Step 2: Run Setup Script

**On EC2:**
```bash
# Navigate to project
cd ~/microservice

# Run setup script
chmod +x EC2_SETUP_UBUNTU.sh
./EC2_SETUP_UBUNTU.sh
```

**After script completes:**
```bash
# Activate docker group (choose one)
newgrp docker
# OR log out and back in: exit, then ssh again
```

### Step 3: Verify Docker

```bash
# Should work without sudo
docker --version
docker-compose --version
docker ps
```

If "permission denied", run `newgrp docker` or log out/in.

### Step 4: Configure Security Groups (AWS Console)

**Go to AWS Console → EC2 → Security Groups:**

1. Select your EC2's security group
2. Click **Edit Inbound Rules**
3. Add these rules:

| Type | Port | Source | Description |
|------|------|--------|-------------|
| Custom TCP | 8001 | 0.0.0.0/0 | Users Service |
| Custom TCP | 8002 | 0.0.0.0/0 | Books Service |
| Custom TCP | 8003 | 0.0.0.0/0 | Orders Service |
| Custom TCP | 8004 | 0.0.0.0/0 | Payments Service |
| Custom TCP | 8005 | 0.0.0.0/0 | Reviews Service |

4. **Save rules**

### Step 5: Start Backend Services

**On EC2:**
```bash
cd ~/microservice

# Start all services (includes 5 PostgreSQL databases + 5 services)
docker-compose up --build -d
```

**First time:** Takes 5-10 minutes (building images, pulling PostgreSQL)

**Check status:**
```bash
# See all running containers
docker-compose ps

# You should see 10 containers:
# - 5 databases: users_db, books_db, orders_db, payments_db, reviews_db
# - 5 services: users-service, books-service, orders-service, payments-service, reviews-service
```

### Step 6: Enable CORS for Testing

```bash
# Allow all origins for testing
export CORS_ALLOW_ALL_ORIGINS=True
docker-compose restart
```

### Step 7: Get Your EC2 IP

```bash
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

**Save this IP** - you'll need it for testing.

---

## 🧪 Testing Backend Services

### Test 1: Check Services Are Running

**On EC2 (local test):**
```bash
# Test each service locally
curl http://localhost:8001
curl http://localhost:8002
curl http://localhost:8003
curl http://localhost:8004
curl http://localhost:8005
```

**Expected:** Should return HTML or JSON response (even if it's an error page).

### Test 2: Test API Endpoints

**Replace `YOUR-EC2-IP` with your actual EC2 IP:**

**From your local machine:**
```bash
# Test Users Service
curl http://YOUR-EC2-IP:8001
curl http://YOUR-EC2-IP:8001/api/users/

# Test Books Service
curl http://YOUR-EC2-IP:8002
curl http://YOUR-EC2-IP:8002/api/books/
curl http://YOUR-EC2-IP:8002/api/categories/

# Test Orders Service
curl http://YOUR-EC2-IP:8003
curl http://YOUR-EC2-IP:8003/api/orders/

# Test Payments Service
curl http://YOUR-EC2-IP:8004
curl http://YOUR-EC2-IP:8004/api/payments/

# Test Reviews Service
curl http://YOUR-EC2-IP:8005
curl http://YOUR-EC2-IP:8005/api/reviews/
```

**Expected:** JSON responses or API endpoints.

### Test 3: Test User Registration

```bash
# Register a test user
curl -X POST http://YOUR-EC2-IP:8001/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "password2": "testpass123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

**Expected:** Success message or user data in JSON.

### Test 4: Test Creating a Book

```bash
# Create a test book
curl -X POST http://YOUR-EC2-IP:8002/api/books/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Book",
    "author": "Test Author",
    "price": "19.99",
    "stock": 50,
    "description": "A test book"
  }'
```

**Expected:** Book data in JSON or success message.

### Test 5: View Logs

**On EC2:**
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f users-service
docker-compose logs -f books-service
```

**Check for:**
- ✅ "Starting development server"
- ✅ "Migrations applied"
- ❌ Any error messages

---

## ✅ Backend Testing Checklist

- [ ] Docker and Docker Compose installed
- [ ] Security groups configured (ports 8001-8005)
- [ ] All 10 containers running (`docker-compose ps`)
- [ ] Services accessible locally (`curl http://localhost:8001`)
- [ ] Services accessible externally (`curl http://EC2-IP:8001`)
- [ ] API endpoints responding
- [ ] No errors in logs (`docker-compose logs`)
- [ ] User registration works
- [ ] Book creation works

---

## 🔧 Useful Commands

### On EC2:

```bash
# Check running containers
docker-compose ps

# View logs (all services)
docker-compose logs -f

# View logs (specific service)
docker-compose logs -f users-service
docker-compose logs -f books-service

# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart users-service

# Stop all services
docker-compose down

# Stop and remove everything (including databases)
docker-compose down -v

# Rebuild and restart
docker-compose up --build -d

# Get EC2 IP
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

---

## 🆘 Troubleshooting

### Issue: "Permission denied" when running docker commands

**Solution:**
```bash
newgrp docker
# OR log out and back in
```

### Issue: Containers not starting

**Check:**
```bash
# View logs for errors
docker-compose logs

# Check Docker is running
sudo systemctl status docker

# Restart Docker
sudo systemctl restart docker
```

### Issue: Can't access services from outside

**Check:**
1. Security groups allow ports 8001-8005
2. Services are running: `docker-compose ps`
3. Test locally first: `curl http://localhost:8001`
4. Check EC2 firewall rules (usually fine by default)

### Issue: Database connection errors

**Check:**
```bash
# Check database containers are running
docker ps | grep db

# Check database logs
docker-compose logs users_db

# Restart databases
docker-compose restart users_db books_db orders_db payments_db reviews_db
```

### Issue: CORS errors (if testing with browser)

**Solution:**
```bash
export CORS_ALLOW_ALL_ORIGINS=True
docker-compose restart
```

---

## 📝 What's Next?

Once all backend tests pass:
1. ✅ All services responding
2. ✅ API endpoints working
3. ✅ No errors in logs
4. ✅ Can create users/books

**Then tell me, and I'll guide you through frontend deployment to S3 + CloudFront!** 🚀

---

**Start with Step 1 above. Good luck!**

