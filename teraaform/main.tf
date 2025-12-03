module "vpc" {
  source               = "./modules/vpc"
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
  tags                 = var.tags
}

module "iam" {
  source            = "./modules/iam"
  tags              = var.tags
  eks_cluster_name  = var.eks_cluster_name
  create_service_accounts = true  # Will be set to true after EKS is created
}

module "eks" {
  source               = "./modules/eks"
  eks_cluster_name     = "my-eks-cluster"
  subnet_ids           = module.vpc.private_subnet_ids
  role_arn             = module.iam.eks_cluster_role_arn
  node_group_role_arn  = module.iam.eks_node_role_arn
  node_instance_type   = var.node_instance_type
  tags                 = var.tags
  cluster_security_group_id = module.vpc.eks_cluster_sg_id  # Pass cluster SG ID
  node_security_group_id    = module.vpc.eks_node_sg_id     # Pass node SG ID
}


module "ec2" {
  source            = "./modules/ec2"
  ami_id            = var.ami_id
  instance_type     = var.instance_type
  subnet_id         = module.vpc.public_subnet_ids[0]
  security_group_id = module.vpc.security_group_id
  key_name          = var.key_name

  tags              = var.tags
}


module "rds" {
  source                 = "./modules/rds"
  db_subnet_ids          = module.vpc.public_subnet_ids
  db_username            = var.db_username
  db_password            = var.db_password
  db_name                = var.db_name
  db_instance_class      = var.db_instance_class
  vpc_security_group_ids = [module.vpc.security_group_id]
  tags                   = var.tags
}


module "redis" {
  source         = "./modules/redis"
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  tags           = var.tags
  allowed_cidrs  = ["10.0.0.0/16"] # Or restrict to your app's CIDR range
}