resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "rds-subnet-group"
  subnet_ids = var.db_subnet_ids
  tags = merge(
    var.tags,
    {
      Name = "rds-subnet-group"
    }
  )
}

resource "aws_db_instance" "rds" {
  identifier              = "bookstore-rds"
  allocated_storage       = 20
  engine                  = "postgres"
  engine_version          = "15"
  instance_class          = var.db_instance_class
  username                = var.db_username
  password                = var.db_password
  db_name                 = "postgres"  # Default database
  db_subnet_group_name    = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids  = var.vpc_security_group_ids
  skip_final_snapshot     = true
  publicly_accessible     = true

  tags = merge(
    var.tags,
    {
      Name = "bookstore-rds"
    }
  )
}

# Create multiple databases within the RDS instance using null_resource
resource "null_resource" "create_databases" {
  depends_on = [aws_db_instance.rds]

  provisioner "local-exec" {
    command = <<-EOT
      # Wait for RDS to be fully available
      echo "Waiting for RDS instance to be ready..."
      sleep 30
      
      # Create databases for each microservice
      # Use address (hostname) and port separately for psql
      PGPASSWORD="${var.db_password}" psql -h ${aws_db_instance.rds.address} -p ${aws_db_instance.rds.port} -U ${var.db_username} -d postgres -c "CREATE DATABASE users_db;" 2>&1 | grep -v "already exists" || true
      PGPASSWORD="${var.db_password}" psql -h ${aws_db_instance.rds.address} -p ${aws_db_instance.rds.port} -U ${var.db_username} -d postgres -c "CREATE DATABASE books_db;" 2>&1 | grep -v "already exists" || true
      PGPASSWORD="${var.db_password}" psql -h ${aws_db_instance.rds.address} -p ${aws_db_instance.rds.port} -U ${var.db_username} -d postgres -c "CREATE DATABASE orders_db;" 2>&1 | grep -v "already exists" || true
      PGPASSWORD="${var.db_password}" psql -h ${aws_db_instance.rds.address} -p ${aws_db_instance.rds.port} -U ${var.db_username} -d postgres -c "CREATE DATABASE payments_db;" 2>&1 | grep -v "already exists" || true
      PGPASSWORD="${var.db_password}" psql -h ${aws_db_instance.rds.address} -p ${aws_db_instance.rds.port} -U ${var.db_username} -d postgres -c "CREATE DATABASE reviews_db;" 2>&1 | grep -v "already exists" || true
      
      echo "All databases created successfully!"
    EOT
  }

  # Re-run if RDS address or port changes
  triggers = {
    rds_address = aws_db_instance.rds.address
    rds_port    = aws_db_instance.rds.port
  }
}