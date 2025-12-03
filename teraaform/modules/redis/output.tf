output "redis_endpoint" {
  description = "Redis endpoint address"
  # For single-node clusters, use primary_endpoint_address
  # For cluster mode, use configuration_endpoint_address
  value = try(
    aws_elasticache_replication_group.redis.configuration_endpoint_address,
    aws_elasticache_replication_group.redis.primary_endpoint_address
  )
}

output "redis_port" {
  description = "Redis port"
  value       = aws_elasticache_replication_group.redis.port
}

output "redis_replication_group_id" {
  description = "Redis replication group ID"
  value       = aws_elasticache_replication_group.redis.id
}

