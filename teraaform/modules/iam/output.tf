output "eks_cluster_role_arn" {
  value = aws_iam_role.eks_cluster_role.arn
}

output "eks_node_role_arn" {
  value = aws_iam_role.eks_node_role.arn
}

output "aws_load_balancer_controller_role_arn" {
  value = var.create_service_accounts ? aws_iam_role.aws_load_balancer_controller[0].arn : ""
}

output "app_pods_role_arn" {
  value = var.create_service_accounts ? aws_iam_role.app_pods_role[0].arn : ""
}