output "eks_cluster_name" {
  value = module.eks.eks_cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.eks_cluster_endpoint
}

output "ec2_public_ip" {
  value = module.ec2.ec2_public_ip
}

output "rds_endpoint" {
  value = module.rds.rds_endpoint
}

output "aws_load_balancer_controller_role_arn" {
  value = module.iam.aws_load_balancer_controller_role_arn
}

output "app_pods_role_arn" {
  value = module.iam.app_pods_role_arn
}

output "redis_endpoint" {
  value = module.redis.redis_endpoint
}

output "vpc_id" {
  value = module.vpc.vpc_id
}