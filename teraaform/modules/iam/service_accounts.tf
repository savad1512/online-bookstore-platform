# IAM Roles for Service Accounts (IRSA) for Kubernetes workloads

# Data source for current AWS account ID
data "aws_caller_identity" "current" {}

# Data source to get EKS cluster OIDC issuer URL
# Only read if we're creating service accounts
# Note: This will fail if cluster doesn't exist, so set create_service_accounts=false initially
data "aws_eks_cluster" "eks_cluster" {
  count = var.create_service_accounts ? 1 : 0
  name  = var.eks_cluster_name
  
  # This ensures we wait for the cluster to be created
  # However, data sources don't support depends_on, so we rely on
  # create_service_accounts being false during initial EKS creation
}

# Get TLS certificate for OIDC provider
data "tls_certificate" "eks" {
  count = var.create_service_accounts && var.create_oidc_provider ? 1 : 0
  url   = var.create_service_accounts ? data.aws_eks_cluster.eks_cluster[0].identity[0].oidc[0].issuer : ""
}

# Extract OIDC issuer URL without https://
locals {
  oidc_issuer = var.create_service_accounts ? replace(data.aws_eks_cluster.eks_cluster[0].identity[0].oidc[0].issuer, "https://", "") : ""
}

# Create OIDC provider for EKS cluster (if not exists)
resource "aws_iam_openid_connect_provider" "eks_oidc" {
  count = var.create_service_accounts && var.create_oidc_provider ? 1 : 0
  
  url = data.aws_eks_cluster.eks_cluster[0].identity[0].oidc[0].issuer

  client_id_list = ["sts.amazonaws.com"]

  thumbprint_list = [
    data.tls_certificate.eks[0].certificates[0].sha1_fingerprint
  ]

  tags = merge(
    var.tags,
    {
      Name = "${var.eks_cluster_name}-oidc-provider"
    }
  )
}

# Use existing OIDC provider ARN or create new one
locals {
  oidc_provider_arn = var.create_service_accounts ? (
    var.create_oidc_provider ? aws_iam_openid_connect_provider.eks_oidc[0].arn : "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/${local.oidc_issuer}"
  ) : ""
}

# IAM Role for AWS Load Balancer Controller
resource "aws_iam_role" "aws_load_balancer_controller" {
  count = var.create_service_accounts ? 1 : 0
  name  = "AmazonEKSLoadBalancerControllerRole-${var.eks_cluster_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = local.oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${local.oidc_issuer}:sub" = "system:serviceaccount:kube-system:aws-load-balancer-controller"
            "${local.oidc_issuer}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })

  tags = merge(
    var.tags,
    {
      Name = "AmazonEKSLoadBalancerControllerRole"
    }
  )
}

# Attach AWS managed policy for Load Balancer Controller
resource "aws_iam_role_policy_attachment" "aws_load_balancer_controller" {
  count      = var.create_service_accounts ? 1 : 0
  role       = aws_iam_role.aws_load_balancer_controller[0].name
  policy_arn = "arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess"
}

# IAM Role for Application Pods (for accessing AWS services)
resource "aws_iam_role" "app_pods_role" {
  count = var.create_service_accounts ? 1 : 0
  name  = "EKSAppPodsRole-${var.eks_cluster_name}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = local.oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${local.oidc_issuer}:sub" = "system:serviceaccount:bookstore:app-service-account"
            "${local.oidc_issuer}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })

  tags = merge(
    var.tags,
    {
      Name = "EKSAppPodsRole"
    }
  )
}

# Custom policy for application pods to access AWS services
resource "aws_iam_role_policy" "app_pods_policy" {
  count = var.create_service_accounts ? 1 : 0
  name  = "EKSAppPodsPolicy-${var.eks_cluster_name}"
  role  = aws_iam_role.app_pods_role[0].id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:*:${data.aws_caller_identity.current.account_id}:log-group:/aws/eks/${var.eks_cluster_name}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = [
          "arn:aws:secretsmanager:*:${data.aws_caller_identity.current.account_id}:secret:bookstore/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          "arn:aws:s3:::bookstore-*",
          "arn:aws:s3:::bookstore-*/*"
        ]
      }
    ]
  })
}
