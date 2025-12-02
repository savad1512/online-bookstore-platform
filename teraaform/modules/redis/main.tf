resource "aws_elasticache_subnet_group" "redis" {
  name       = "redis-subnet-group"
  subnet_ids = var.subnet_ids

  tags = merge(
    var.tags,
    {
      Name = "redis-subnet-group"
    }
  )
}

resource "aws_security_group" "redis_sg" {
  name        = "redis-sg"
  description = "Allow Redis access"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidrs
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(
    var.tags,
    {
      Name = "redis-sg"
    }
  )
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "my-redis"
  description                = "Redis single node"
  node_type                  = var.node_type
  num_cache_clusters         = 1  # Single node
  engine                     = "redis"
  engine_version             = var.engine_version
  automatic_failover_enabled = false  # Disabled for single node
  parameter_group_name       = "default.redis7"
  port                       = 6379
  subnet_group_name          = aws_elasticache_subnet_group.redis.name
  security_group_ids         = [aws_security_group.redis_sg.id]
  multi_az_enabled           = false  # Disabled for single node

  tags = merge(
    var.tags,
    {
      Name = "my-redis"
    }
  )
}