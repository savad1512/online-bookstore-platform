    # AWS Deployment Guide for Online Bookstore Platform

## Overview

This comprehensive guide covers deploying the entire online bookstore platform to AWS:

- **Backend**: 5 microservices (users, books, orders, payments, reviews) deployed to EKS via ECR
- **Frontend**: React application deployed to S3 with CloudFront distribution

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Part 1: Infrastructure Setup (Terraform)](#part-1-infrastructure-setup-terraform)
4. [Part 2: Backend Deployment - ECR Setup](#part-2-backend-deployment---ecr-setup)
5. [Part 3: Kubernetes Deployment](#part-3-kubernetes-deployment)
6. [Part 4: Frontend Deployment - S3 & CloudFront](#part-4-frontend-deployment---s3--cloudfront)
7. [Part 5: Configuration & Environment Variables](#part-5-configuration--environment-variables)
8. [Part 6: Verification & Troubleshooting](#part-6-verification--troubleshooting)

---

## Prerequisites

Before starting the deployment, ensure you have the following installed and configured:

- **AWS CLI** (v2.x) installed and configured with appropriate credentials
- **kubectl** installed and configured
- **Docker** installed and running
- **Terraform** (v1.0+) installed
- **AWS Account** with permissions for:
  - ECR (Elastic Container Registry)
  - EKS (Elastic Kubernetes Service)
  - S3
  - CloudFront
  - IAM
  - VPC
  - RDS
  - ElastiCache (Redis)

### Verify Prerequisites

```bash
# Check AWS CLI
aws --version
aws sts get-caller-identity

# Check kubectl
kubectl version --client

# Check Docker
docker --version

# Check Terraform
terraform version
```

---

## Architecture Overview

### Microservices Architecture

- **users-service**: Port 8001 - User authentication and management
- **books-service**: Port 8002 - Book catalog and inventory
- **orders-service**: Port 8003 - Order processing
- **payments-service**: Port 8004 - Payment processing
- **reviews-service**: Port 8005 - Book reviews and ratings

### Infrastructure Components

- **EKS Cluster**: Kubernetes cluster for running microservices
- **RDS PostgreSQL**: Database for each microservice
- **ElastiCache Redis**: Caching layer
- **VPC**: Virtual Private Cloud with public/private subnets
- **S3 Bucket**: Static website hosting for frontend
- **CloudFront**: CDN for frontend distribution

---

## Part 1: Infrastructure Setup (Terraform)

### 1.1 Configure Terraform Variables

Edit `teraaform/variables.tf` or create a `terraform.tfvars` file with your specific values:

```hcl
aws_region = "us-east-1"
vpc_cidr = "10.0.0.0/16"

# Database credentials (use strong passwords in production)
db_username = "dbadmin"
db_password = "your-secure-password-here"
db_name = "bookstore_db"

# EKS Configuration
eks_cluster_name = "bookstore-eks-cluster"
node_instance_type = ["t3.medium"]

# Tags
tags = {
  Project = "online-bookstore-platform"
  Environment = "production"
}
```

### 1.2 Deploy Infrastructure

```bash
cd teraaform

# Initialize Terraform
terraform init

# Review the execution plan
terraform plan

# Apply infrastructure changes
terraform apply

# Confirm with 'yes' when prompted
```

**Expected Output:**
- VPC with public and private subnets
- EKS cluster with node group
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- Security groups and IAM roles

### 1.3 Retrieve Infrastructure Outputs

```bash
# Get EKS cluster endpoint
terraform output eks_cluster_endpoint

# Get RDS endpoint
terraform output rds_endpoint

# Get EC2 public IP (if needed)
terraform output ec2_public_ip
```

### 1.4 Configure kubectl for EKS

```bash
# Update kubeconfig
aws eks update-kubeconfig --region us-east-1 --name my-eks-cluster

# Verify cluster access
kubectl get nodes

# Verify cluster info
kubectl cluster-info
```

---

## Part 2: Backend Deployment - ECR Setup

### 2.1 Create ECR Repositories

Create ECR repositories for all 5 microservices:

```bash
# Set your AWS account ID and region
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION="us-east-1"

# Create repositories
aws ecr create-repository --repository-name bookstore-users-service --region $AWS_REGION
aws ecr create-repository --repository-name bookstore-books-service --region $AWS_REGION
aws ecr create-repository --repository-name bookstore-orders-service --region $AWS_REGION
aws ecr create-repository --repository-name bookstore-payments-service --region $AWS_REGION
aws ecr create-repository --repository-name bookstore-reviews-service --region $AWS_REGION

# Verify repositories
aws ecr describe-repositories --region $AWS_REGION
```

### 2.2 Authenticate Docker with ECR

```bash
# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

### 2.3 Build and Push Docker Images

Create a script to build and push all services:

```bash
#!/bin/bash
# build-and-push.sh

set -e

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"
ECR_BASE="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

SERVICES=("users-service" "books-service" "orders-service" "payments-service" "reviews-service")
PORTS=(8001 8002 8003 8004 8005)

for i in "${!SERVICES[@]}"; do
    SERVICE=${SERVICES[$i]}
    PORT=${PORTS[$i]}
    REPO_NAME="bookstore-$SERVICE"
    IMAGE_URI="$ECR_BASE/$REPO_NAME:latest"
    
    echo "Building $SERVICE..."
    cd $SERVICE
    docker build -t $REPO_NAME:latest .
    docker tag $REPO_NAME:latest $IMAGE_URI
    
    echo "Pushing $SERVICE to ECR..."
    docker push $IMAGE_URI
    
    echo "Successfully pushed $IMAGE_URI"
    cd ..
done

echo "All images pushed successfully!"
```

Make it executable and run:

```bash
chmod +x build-and-push.sh
./build-and-push.sh
```

**Alternative: Manual Build and Push**

For each service individually:

```bash
# Example for users-service
cd users-service
docker build -t bookstore-users-service:latest .
docker tag bookstore-users-service:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bookstore-users-service:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bookstore-users-service:latest
cd ..
```

Repeat for: books-service, orders-service, payments-service, reviews-service

### 2.4 Verify Images in ECR

```bash
# List all images
aws ecr list-images --repository-name bookstore-users-service --region $AWS_REGION
aws ecr list-images --repository-name bookstore-books-service --region $AWS_REGION
aws ecr list-images --repository-name bookstore-orders-service --region $AWS_REGION
aws ecr list-images --repository-name bookstore-payments-service --region $AWS_REGION
aws ecr list-images --repository-name bookstore-reviews-service --region $AWS_REGION
```

---

## Part 3: Kubernetes Deployment

### 3.1 Create Namespace

```bash
kubectl create namespace bookstore
kubectl config set-context --current --namespace=bookstore
```

### 3.2 Create Secrets for Database and Redis

First, get your RDS endpoint from Terraform outputs:

```bash
RDS_ENDPOINT=$(terraform -chdir=teraaform output -raw rds_endpoint)
REDIS_ENDPOINT=$(terraform -chdir=teraaform output -raw redis_endpoint 2>/dev/null || echo "redis-service.bookstore.svc.cluster.local:6379")
```

Create secrets:

```bash
# Database credentials secret
kubectl create secret generic db-credentials \
  --from-literal=db-username=dbadmin \
  --from-literal=db-password=your-secure-password-here \
  --from-literal=db-host=$RDS_ENDPOINT \
  --from-literal=db-port=5432 \
  -n bookstore

# Redis secret
kubectl create secret generic redis-credentials \
  --from-literal=redis-host=$REDIS_ENDPOINT \
  --from-literal=redis-port=6379 \
  -n bookstore
```

### 3.3 Create ConfigMap for Shared Configuration

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: bookstore
data:
  USERS_SERVICE_URL: "http://users-service:8001"
  BOOKS_SERVICE_URL: "http://books-service:8002"
  ORDERS_SERVICE_URL: "http://orders-service:8003"
  PAYMENTS_SERVICE_URL: "http://payments-service:8004"
  REVIEWS_SERVICE_URL: "http://reviews-service:8005"
  CORS_ALLOW_ALL_ORIGINS: "true"
```

Apply it:

```bash
kubectl apply -f configmap.yaml
```

### 3.4 Kubernetes Manifests for Microservices

Create deployment manifests for each service. Here's a template for `users-service`:

```yaml
# users-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: users-service
  namespace: bookstore
  labels:
    app: users-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: users-service
  template:
    metadata:
      labels:
        app: users-service
    spec:
      containers:
      - name: users-service
        image: <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/bookstore-users-service:latest
        ports:
        - containerPort: 8001
        env:
        - name: DB_NAME
          value: "users_db"
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: db-username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: db-password
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: db-host
        - name: DB_PORT
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: db-port
        - name: CORS_ALLOW_ALL_ORIGINS
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: CORS_ALLOW_ALL_ORIGINS
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: users-service
  namespace: bookstore
spec:
  selector:
    app: users-service
  ports:
  - protocol: TCP
    port: 8001
    targetPort: 8001
  type: ClusterIP
```

Create similar manifests for other services. Here's a script to generate all manifests:

```bash
#!/bin/bash
# generate-k8s-manifests.sh

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION="us-east-1"

SERVICES=("users-service" "books-service" "orders-service" "payments-service" "reviews-service")
PORTS=(8001 8002 8003 8004 8005)
DB_NAMES=("users_db" "books_db" "orders_db" "payments_db" "reviews_db")

for i in "${!SERVICES[@]}"; do
    SERVICE=${SERVICES[$i]}
    PORT=${PORTS[$i]}
    DB_NAME=${DB_NAMES[$i]}
    
    cat > k8s/${SERVICE}-deployment.yaml <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $SERVICE
  namespace: bookstore
  labels:
    app: $SERVICE
spec:
  replicas: 2
  selector:
    matchLabels:
      app: $SERVICE
  template:
    metadata:
      labels:
        app: $SERVICE
    spec:
      containers:
      - name: $SERVICE
        image: $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bookstore-$SERVICE:latest
        ports:
        - containerPort: $PORT
        env:
        - name: DB_NAME
          value: "$DB_NAME"
        - name: DB_USER
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: db-username
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: db-password
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: db-host
        - name: DB_PORT
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: db-port
        - name: USERS_SERVICE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: USERS_SERVICE_URL
        - name: BOOKS_SERVICE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: BOOKS_SERVICE_URL
        - name: ORDERS_SERVICE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: ORDERS_SERVICE_URL
        - name: PAYMENTS_SERVICE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: PAYMENTS_SERVICE_URL
        - name: REVIEWS_SERVICE_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: REVIEWS_SERVICE_URL
        - name: CORS_ALLOW_ALL_ORIGINS
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: CORS_ALLOW_ALL_ORIGINS
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: $PORT
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: $PORT
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: $SERVICE
  namespace: bookstore
spec:
  selector:
    app: $SERVICE
  ports:
  - protocol: TCP
    port: $PORT
    targetPort: $PORT
  type: ClusterIP
EOF
done

echo "Kubernetes manifests generated in k8s/ directory"
```

### 3.5 Deploy Ingress Controller

Install AWS Load Balancer Controller for ingress:

```bash
# Add EKS Helm chart repository
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=my-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

### 3.6 Create Ingress for API Gateway

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  namespace: bookstore
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}, {"HTTPS": 443}]'
    alb.ingress.kubernetes.io/ssl-redirect: '443'
spec:
  ingressClassName: alb
  rules:
  - http:
      paths:
      - path: /users
        pathType: Prefix
        backend:
          service:
            name: users-service
            port:
              number: 8001
      - path: /books
        pathType: Prefix
        backend:
          service:
            name: books-service
            port:
              number: 8002
      - path: /orders
        pathType: Prefix
        backend:
          service:
            name: orders-service
            port:
              number: 8003
      - path: /payments
        pathType: Prefix
        backend:
          service:
            name: payments-service
            port:
              number: 8004
      - path: /reviews
        pathType: Prefix
        backend:
          service:
            name: reviews-service
            port:
              number: 8005
```

Apply ingress:

```bash
kubectl apply -f ingress.yaml
```

### 3.7 Deploy All Services

```bash
# Create k8s directory if it doesn't exist
mkdir -p k8s

# Apply all deployments
kubectl apply -f k8s/

# Check deployment status
kubectl get deployments -n bookstore
kubectl get pods -n bookstore
kubectl get services -n bookstore
kubectl get ingress -n bookstore
```

### 3.8 Get Ingress URL

```bash
# Get the ALB URL
kubectl get ingress api-ingress -n bookstore -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Export for later use
export API_URL=$(kubectl get ingress api-ingress -n bookstore -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "API URL: http://$API_URL"
```

---

## Part 4: Frontend Deployment - S3 & CloudFront

### 4.1 Create S3 Bucket

```bash
# Set bucket name (must be globally unique)
export BUCKET_NAME="bookstore-frontend-$(date +%s)"
export AWS_REGION="us-east-1"

# Create bucket
aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION

# Enable static website hosting
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html

# Set bucket policy for CloudFront access
cat > bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

# Block public access (CloudFront will access via OAI)
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
  "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

### 4.2 Create CloudFront Origin Access Identity (OAI)

```bash
# Create OAI
OAI_ID=$(aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
  CallerReference="bookstore-oai-$(date +%s)",Comment="Bookstore Frontend OAI" \
  --query 'CloudFrontOriginAccessIdentity.Id' --output text)

echo "OAI ID: $OAI_ID"
echo "OAI ARN: origin-access-identity/cloudfront/$OAI_ID"

# Update bucket policy to allow OAI
cat > bucket-policy-oai.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::$(aws sts get-caller-identity --query Account --output text):distribution/*"
        }
      }
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy-oai.json
```

### 4.3 Create CloudFront Distribution

```bash
# Create distribution config
cat > cloudfront-config.json <<EOF
{
  "CallerReference": "bookstore-dist-$(date +%s)",
  "Comment": "Bookstore Frontend Distribution",
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$BUCKET_NAME",
        "DomainName": "$BUCKET_NAME.s3.$AWS_REGION.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": "origin-access-identity/cloudfront/$OAI_ID"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$BUCKET_NAME",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 7,
      "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "Compress": true,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100"
}
EOF

# Create distribution
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json \
  --query 'Distribution.Id' --output text)

echo "Distribution ID: $DISTRIBUTION_ID"
echo "Distribution Domain: $(aws cloudfront get-distribution --id $DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)"

# Save for later use
export CLOUDFRONT_DISTRIBUTION_ID=$DISTRIBUTION_ID
```

### 4.4 Build Frontend with Production Environment Variables

Create `.env.production` file in the frontend directory:

```bash
cd frontend

# Get API URL from ingress
API_URL=$(kubectl get ingress api-ingress -n bookstore -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Create production environment file
cat > .env.production <<EOF
REACT_APP_USERS_SERVICE_URL=https://$API_URL/users
REACT_APP_BOOKS_SERVICE_URL=https://$API_URL/books
REACT_APP_ORDERS_SERVICE_URL=https://$API_URL/orders
REACT_APP_PAYMENTS_SERVICE_URL=https://$API_URL/payments
REACT_APP_REVIEWS_SERVICE_URL=https://$API_URL/reviews
EOF

# Install dependencies (if not already done)
npm install

# Build for production
npm run build

# Verify build
ls -la build/
```

### 4.5 Deploy Frontend to S3

```bash
# Sync build files to S3
aws s3 sync build/ s3://$BUCKET_NAME --delete

# Set cache control for static assets
aws s3 cp s3://$BUCKET_NAME/static/ s3://$BUCKET_NAME/static/ \
  --recursive \
  --cache-control "public, max-age=31536000, immutable"

# Verify deployment
aws s3 ls s3://$BUCKET_NAME --recursive
```

### 4.6 Invalidate CloudFront Cache

```bash
# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --paths "/*"

# Get CloudFront URL
CLOUDFRONT_URL=$(aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)
echo "Frontend URL: https://$CLOUDFRONT_URL"
```

---

## Part 5: Configuration & Environment Variables

### 5.1 Backend Environment Variables

Each microservice requires the following environment variables:

#### Database Configuration
- `DB_NAME`: Database name (users_db, books_db, orders_db, payments_db, reviews_db)
- `DB_USER`: Database username (from RDS)
- `DB_PASSWORD`: Database password (from RDS)
- `DB_HOST`: RDS endpoint (from Terraform output)
- `DB_PORT`: Database port (default: 5432)

#### Service URLs (for inter-service communication)
- `USERS_SERVICE_URL`: http://users-service:8001
- `BOOKS_SERVICE_URL`: http://books-service:8002
- `ORDERS_SERVICE_URL`: http://orders-service:8003
- `PAYMENTS_SERVICE_URL`: http://payments-service:8004
- `REVIEWS_SERVICE_URL`: http://reviews-service:8005

#### CORS Configuration
- `CORS_ALLOW_ALL_ORIGINS`: true (for production)

### 5.2 Frontend Environment Variables

The React frontend requires these environment variables (set in `.env.production`):

```env
REACT_APP_USERS_SERVICE_URL=https://your-api-alb-url/users
REACT_APP_BOOKS_SERVICE_URL=https://your-api-alb-url/books
REACT_APP_ORDERS_SERVICE_URL=https://your-api-alb-url/orders
REACT_APP_PAYMENTS_SERVICE_URL=https://your-api-alb-url/payments
REACT_APP_REVIEWS_SERVICE_URL=https://your-api-alb-url/reviews
```

Replace `your-api-alb-url` with your actual ALB URL from the ingress.

### 5.3 Update Frontend After Deployment

If you need to update the frontend with new API URLs:

```bash
cd frontend

# Update .env.production with new URLs
# Rebuild
npm run build

# Redeploy to S3
aws s3 sync build/ s3://$BUCKET_NAME --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --paths "/*"
```

---

## Part 6: Verification & Troubleshooting

### 6.1 Verify Backend Deployment

```bash
# Check all pods are running
kubectl get pods -n bookstore

# Check pod logs
kubectl logs -n bookstore deployment/users-service
kubectl logs -n bookstore deployment/books-service
kubectl logs -n bookstore deployment/orders-service
kubectl logs -n bookstore deployment/payments-service
kubectl logs -n bookstore deployment/reviews-service

# Check services
kubectl get svc -n bookstore

# Check ingress
kubectl get ingress -n bookstore
kubectl describe ingress api-ingress -n bookstore

# Test API endpoints
API_URL=$(kubectl get ingress api-ingress -n bookstore -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
curl http://$API_URL/books/
curl http://$API_URL/users/
```

### 6.2 Verify Frontend Deployment

```bash
# Check S3 bucket contents
aws s3 ls s3://$BUCKET_NAME --recursive

# Check CloudFront distribution status
aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --query 'Distribution.Status'

# Get CloudFront URL
CLOUDFRONT_URL=$(aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --query 'Distribution.DomainName' --output text)
echo "Frontend: https://$CLOUDFRONT_URL"

# Test frontend
curl -I https://$CLOUDFRONT_URL
```

### 6.3 Common Issues and Solutions

#### Issue: Pods are not starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n bookstore

# Check events
kubectl get events -n bookstore --sort-by='.lastTimestamp'

# Common causes:
# - Image pull errors: Check ECR permissions
# - Resource limits: Check node capacity
# - Database connection: Verify RDS security groups
```

#### Issue: Cannot pull images from ECR

```bash
# Verify ECR login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Check EKS node group IAM role has ECR permissions
# Should have: AmazonEC2ContainerRegistryReadOnly policy
```

#### Issue: Database connection errors

```bash
# Verify RDS endpoint
terraform -chdir=teraaform output rds_endpoint

# Check RDS security group allows traffic from EKS nodes
# Check database credentials in secrets
kubectl get secret db-credentials -n bookstore -o yaml
```

#### Issue: Ingress not creating ALB

```bash
# Check AWS Load Balancer Controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# Verify IAM role has required permissions
# Check ingress annotations
kubectl describe ingress api-ingress -n bookstore
```

#### Issue: CloudFront showing old content

```bash
# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --paths "/*"

# Wait for invalidation to complete (usually 5-15 minutes)
aws cloudfront get-invalidation \
  --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
  --id <invalidation-id>
```

#### Issue: CORS errors in browser

```bash
# Verify CORS_ALLOW_ALL_ORIGINS is set to "true" in ConfigMap
kubectl get configmap app-config -n bookstore -o yaml

# Check frontend is using correct API URLs
# Verify CloudFront and ALB URLs match in frontend .env.production
```

### 6.4 Scaling Services

```bash
# Scale a service manually
kubectl scale deployment users-service --replicas=3 -n bookstore

# Create HorizontalPodAutoscaler
cat > hpa.yaml <<EOF
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: users-service-hpa
  namespace: bookstore
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: users-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
EOF

kubectl apply -f hpa.yaml
```

### 6.5 Monitoring and Logs

```bash
# View logs for a specific pod
kubectl logs -f <pod-name> -n bookstore

# View logs for all pods in a deployment
kubectl logs -f deployment/users-service -n bookstore

# Get resource usage
kubectl top pods -n bookstore
kubectl top nodes
```

### 6.6 Cleanup (if needed)

```bash
# Delete Kubernetes resources
kubectl delete namespace bookstore

# Delete ECR images (optional)
aws ecr batch-delete-image \
  --repository-name bookstore-users-service \
  --image-ids imageTag=latest \
  --region us-east-1

# Delete CloudFront distribution
aws cloudfront delete-distribution \
  --id $CLOUDFRONT_DISTRIBUTION_ID \
  --if-match <etag>

# Delete S3 bucket
aws s3 rm s3://$BUCKET_NAME --recursive
aws s3 rb s3://$BUCKET_NAME

# Destroy Terraform infrastructure
cd teraaform
terraform destroy
```

---

## Summary

After completing this guide, you should have:

1. ✅ EKS cluster running with 5 microservices
2. ✅ ECR repositories with Docker images
3. ✅ Kubernetes deployments, services, and ingress configured
4. ✅ S3 bucket with frontend static files
5. ✅ CloudFront distribution serving the frontend
6. ✅ All services accessible via API gateway (ALB)
7. ✅ Frontend accessible via CloudFront URL

### Quick Reference Commands

```bash
# Get API URL
kubectl get ingress api-ingress -n bookstore -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Get CloudFront URL
aws cloudfront get-distribution --id $CLOUDFRONT_DISTRIBUTION_ID --query 'Distribution.DomainName' --output text

# View all pods
kubectl get pods -n bookstore

# View all services
kubectl get svc -n bookstore

# Check deployment status
kubectl get deployments -n bookstore
```

---

## Additional Resources

- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)

---

**Note**: Remember to:
- Use strong passwords for production databases
- Enable HTTPS for production (configure SSL certificates)
- Set up proper monitoring and alerting
- Configure backup strategies for RDS
- Review and tighten security groups
- Enable CloudFront access logs
- Set up CI/CD pipelines for automated deployments
