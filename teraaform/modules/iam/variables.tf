variable "tags" {
  type = map(string)
}

variable "eks_cluster_name" {
  type        = string
  description = "Name of the EKS cluster"
  default     = "my-eks-cluster"
}

variable "create_oidc_provider" {
  type        = bool
  description = "Whether to create OIDC provider for EKS cluster"
  default     = true
}

variable "create_service_accounts" {
  type        = bool
  description = "Whether to create IAM roles for service accounts (requires EKS cluster to exist)"
  default     = false
}

variable "eks_cluster_arn" {
  type        = string
  description = "ARN of the EKS cluster (required if create_service_accounts is true)"
  default     = ""
}