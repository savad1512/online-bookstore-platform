output "eks_cluster_endpoint" {
  value = module.eks.eks_cluster_endpoint
}

output "ec2_public_ip" {
  value = module.ec2.ec2_public_ip
}

output "rds_endpoint" {
  value = module.rds.rds_endpoint
}