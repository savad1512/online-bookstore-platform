# VPC
variable "aws_region" {
  default = "us-east-1"
}

variable "vpc_cidr" {
  default = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" { 
  type = list(string)
  default = ["10.0.3.0/24", "10.0.4.0/24"] 
}

variable "availability_zones" {
  type = list(string)
  default = ["us-east-1a", "us-east-1b", "us-east-1c", "us-east-1d"]
}

# Global tags
variable "tags" {
  type = map(string)
  default = {
    Project = "my-project"
  }
}

# EC2
variable "ami_id" {
  type = string
  default = "ami-084568db4383264d4"
}

variable "instance_type" {
  type = string
  default = "t3.medium"
}

variable "key_name" {
  type = string
  default = "my-app-key"
}



# RDS
variable "db_username" {
  type = string
  default = "dbadmin"
}

variable "db_password" {
  type = string
  default = "mysql12345"
}

variable "db_name" {
  type = string
  default = "my-db"
}

variable "db_instance_class" {
  type = string
  default = "db.t3.micro"
}

# EKS

variable "eks_cluster_name" {
  type = string
  default = "my-eks-cluster"
}

variable "node_instance_type" {
  type    = list(string)
  default = ["t3.medium"]
}


# Note: subnet_ids and role ARNs come from outputs of other modules (vpc & iam),
# so we don’t need to define them here.


# IAM
# No specific variables unless you want to pass role names explicitly — right now it's just using `tags`

#REDIS
variable "engine_version" {
  description = "Redis engine version"
  type        = string
  default     = "7.0" # ✅ must be a valid version like "7.0", "7.1", not "7.x"
}