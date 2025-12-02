# Kubernetes Manifests for Online Bookstore Platform

This directory contains Kubernetes manifests for deploying the backend microservices to an EKS cluster.

## Files Overview

- `namespace.yaml` - Creates the `bookstore` namespace
- `configmap.yaml` - Shared configuration for all services
- `ingress.yaml` - AWS ALB Ingress for external access to all services
- `users-service-deployment.yaml` - Deployment and Service for users-service (port 8001)
- `books-service-deployment.yaml` - Deployment and Service for books-service (port 8002)
- `orders-service-deployment.yaml` - Deployment and Service for orders-service (port 8003)
- `payments-service-deployment.yaml` - Deployment and Service for payments-service (port 8004)
- `reviews-service-deployment.yaml` - Deployment and Service for reviews-service (port 8005)

## Prerequisites

Before applying these manifests, ensure you have:

1. **Kubernetes cluster** (EKS) configured and accessible via `kubectl`
2. **AWS Load Balancer Controller** installed in your EKS cluster (see Step 0 below)
3. **Secrets created**:
   - `db-credentials` - Database credentials (db-username, db-password, db-host, db-port)
   - `redis-credentials` - Redis credentials (redis-host, redis-port)
   - `app-secrets` - Application secrets (secret-key-users, secret-key-books, secret-key-orders, secret-key-payments, secret-key-reviews)
4. **Docker images** pushed to ECR repositories
5. **Image placeholders updated** - Replace `<AWS_ACCOUNT_ID>` and `<AWS_REGION>` in deployment files

## Setup Instructions

### 0. Install AWS Load Balancer Controller

The Ingress resource requires the AWS Load Balancer Controller to be installed:

```bash
# Add EKS Helm chart repository
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install AWS Load Balancer Controller
# Replace 'my-eks-cluster' with your actual EKS cluster name
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=my-eks-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# Verify installation
kubectl get deployment aws-load-balancer-controller -n kube-system
```

**Note**: Make sure you have created the IAM service account for the AWS Load Balancer Controller with proper permissions. See AWS documentation for details.

### 1. Create Secrets

```bash
# Get RDS endpoint from Terraform
RDS_ENDPOINT=$(terraform -chdir=../teraaform output -raw rds_endpoint)
REDIS_ENDPOINT=$(terraform -chdir=../teraaform output -raw redis_endpoint 2>/dev/null || echo "redis-service.bookstore.svc.cluster.local:6379")

# Create namespace first
kubectl apply -f namespace.yaml

# Create database credentials secret
kubectl create secret generic db-credentials \
  --from-literal=db-username=dbadmin \
  --from-literal=db-password=your-secure-password-here \
  --from-literal=db-host=$RDS_ENDPOINT \
  --from-literal=db-port=5432 \
  -n bookstore

# Create Redis credentials secret
kubectl create secret generic redis-credentials \
  --from-literal=redis-host=$REDIS_ENDPOINT \
  --from-literal=redis-port=6379 \
  -n bookstore

# Create application secrets (generate secure keys for production)
kubectl create secret generic app-secrets \
  --from-literal=secret-key-users=$(openssl rand -hex 32) \
  --from-literal=secret-key-books=$(openssl rand -hex 32) \
  --from-literal=secret-key-orders=$(openssl rand -hex 32) \
  --from-literal=secret-key-payments=$(openssl rand -hex 32) \
  --from-literal=secret-key-reviews=$(openssl rand -hex 32) \
  -n bookstore
```

### 2. Update Image References

Before applying deployments, update the image references in each deployment file:

```bash
# Get your AWS account ID and region
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION="us-east-1"

# Replace placeholders in all deployment files
sed -i "s/<AWS_ACCOUNT_ID>/$AWS_ACCOUNT_ID/g" *-deployment.yaml
sed -i "s/<AWS_REGION>/$AWS_REGION/g" *-deployment.yaml
```

### 3. Apply Manifests

```bash
# Apply in order
kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f users-service-deployment.yaml
kubectl apply -f books-service-deployment.yaml
kubectl apply -f orders-service-deployment.yaml
kubectl apply -f payments-service-deployment.yaml
kubectl apply -f reviews-service-deployment.yaml
kubectl apply -f ingress.yaml

# Or apply all at once
kubectl apply -f .
```

### 4. Get ALB Ingress URL

After applying the ingress, wait a few minutes for AWS to provision the ALB, then get the URL:

```bash
# Get the ALB URL
kubectl get ingress api-ingress -n bookstore -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Export for later use
export API_URL=$(kubectl get ingress api-ingress -n bookstore -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "API URL: http://$API_URL"

# Check ingress status
kubectl get ingress -n bookstore
kubectl describe ingress api-ingress -n bookstore
```

The ALB will route traffic as follows:
- `http://<ALB_URL>/users/*` → users-service:8001
- `http://<ALB_URL>/books/*` → books-service:8002
- `http://<ALB_URL>/orders/*` → orders-service:8003
- `http://<ALB_URL>/payments/*` → payments-service:8004
- `http://<ALB_URL>/reviews/*` → reviews-service:8005

### 5. Verify Deployment

```bash
# Check namespace
kubectl get ns bookstore

# Check deployments
kubectl get deployments -n bookstore

# Check pods
kubectl get pods -n bookstore

# Check services
kubectl get services -n bookstore

# View logs for a specific service
kubectl logs -f deployment/users-service -n bookstore
```

## Configuration Details

### Environment Variables

Each service uses:
- **Database**: Separate database per service (users_db, books_db, orders_db, payments_db, reviews_db)
- **Redis**: Shared Redis instance for caching
- **Service URLs**: Inter-service communication via ConfigMap
- **Secrets**: Unique SECRET_KEY per service

### Resource Limits

Each service is configured with:
- **Requests**: 256Mi memory, 250m CPU
- **Limits**: 512Mi memory, 500m CPU
- **Replicas**: 2 (for high availability)

### Health Checks

- **Liveness Probe**: Checks `/health` endpoint every 10 seconds (starts after 30s)
- **Readiness Probe**: Checks `/health` endpoint every 5 seconds (starts after 10s)

## Troubleshooting

### Check pod status
```bash
kubectl describe pod <pod-name> -n bookstore
```

### View pod logs
```bash
kubectl logs <pod-name> -n bookstore
```

### Check service endpoints
```bash
kubectl get endpoints -n bookstore
```

### Check ingress status
```bash
kubectl get ingress -n bookstore
kubectl describe ingress api-ingress -n bookstore
```

### Test service connectivity (internal)
```bash
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- curl http://users-service:8001/health
```

### Test ALB connectivity (external)
```bash
# Get ALB URL first
ALB_URL=$(kubectl get ingress api-ingress -n bookstore -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Test each service via ALB
curl http://$ALB_URL/users/health
curl http://$ALB_URL/books/health
curl http://$ALB_URL/orders/health
curl http://$ALB_URL/payments/health
curl http://$ALB_URL/reviews/health
```

## Notes

- Ensure your EKS nodes have proper IAM roles to pull images from ECR
- Database security groups must allow traffic from EKS nodes
- Redis security groups must allow traffic from EKS nodes
- Health check endpoints (`/health`) must be implemented in each service
- The ALB Ingress will create an internet-facing Application Load Balancer
- For HTTPS, configure SSL certificates using AWS Certificate Manager (ACM) and update ingress annotations
- ALB provisioning may take 2-5 minutes after applying the ingress manifest

