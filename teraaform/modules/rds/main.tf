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
  identifier              = var.db_name
  allocated_storage       = 20
  engine                  = "postgres"
  engine_version          = "15"
  instance_class          = var.db_instance_class
  username                = var.db_username
  password                = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids  = var.vpc_security_group_ids
  skip_final_snapshot     = true
  publicly_accessible     = true

  tags = merge(
    var.tags,
    {
      Name = "my-db"
    }
  )
}