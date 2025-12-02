variable "eks_cluster_name" {
  type = string
  default = "my-eks-cluster"
}


variable "role_arn" {
  type = string
}

variable "tags" {
  type = map(string)
  default = {
    Project = "my-project"
  }
}

variable "node_group_role_arn" {
  type = string
}

variable "node_instance_type" {
  type    = list(string)
  default = ["t3.micro"]
}

variable "subnet_ids" {
  description = "List of subnet IDs for the EKS cluster"
  type        = list(string)
}

variable "cluster_security_group_id" {}
variable "node_security_group_id" {}