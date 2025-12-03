# GitHub Actions CI/CD Setup

## Backend CI/CD Workflow

The `backend-ci-cd.yml` workflow automatically builds Docker images for all microservices and pushes them to AWS ECR whenever code is pushed to the repository.

### Prerequisites

1. **ECR Repositories**: Ensure the following ECR repositories exist in your AWS account:
   - `bookstore-users-service`
   - `bookstore-books-service`
   - `bookstore-orders-service`
   - `bookstore-payments-service`
   - `bookstore-reviews-service`

2. **GitHub Secrets**: Configure the following secrets in your GitHub repository:
   - `AWS_ACCESS_KEY_ID`: AWS access key ID with ECR push permissions
   - `AWS_SECRET_ACCESS_KEY`: AWS secret access key

### Setting Up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:
   - Name: `AWS_ACCESS_KEY_ID`, Value: Your AWS access key ID
   - Name: `AWS_SECRET_ACCESS_KEY`, Value: Your AWS secret access key

### AWS IAM Permissions Required

The AWS credentials need the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

### Workflow Behavior

- **Triggers**: 
  - On push to any branch (when files in microservice directories change)
  - Paths monitored:
    - `users-service/**`
    - `books-service/**`
    - `orders-service/**`
    - `payments-service/**`
    - `reviews-service/**`
    - `.github/workflows/backend-ci-cd.yml`

- **Actions**:
  - Builds Docker images for all 5 microservices
  - Tags images with:
    - Commit SHA: `{ECR_REGISTRY}/{REPOSITORY}:{GITHUB_SHA}`
    - Latest: `{ECR_REGISTRY}/{REPOSITORY}:latest`
  - Pushes images to ECR

### Image Tags

Each image is tagged with:
- **Commit SHA**: Unique tag for each commit (e.g., `abc123def456...`)
- **Latest**: Always points to the most recent build

### Verifying the Workflow

1. Push code to any branch
2. Go to **Actions** tab in GitHub
3. Check the workflow run status
4. Verify images in ECR:
   ```bash
   aws ecr list-images --repository-name bookstore-users-service --region us-east-1
   ```

### Troubleshooting

- **Authentication errors**: Verify GitHub secrets are correctly set
- **ECR repository not found**: Create the repositories first (see AWS_DEPLOYMENT.md)
- **Permission denied**: Ensure IAM user has required ECR permissions
- **Build failures**: Check Dockerfile syntax and dependencies

