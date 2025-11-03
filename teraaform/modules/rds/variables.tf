variable "db_subnet_ids" {
  type = list(string)
}

variable "db_username" {
  type = string
  default = "dbadmin"

}

variable "db_password" {
  type = string
  default = "password"

}

variable "db_instance_class" {
  type = string
  default = "db.t3.micro"

}

variable "db_name" {
  type = string
  default = "my-db"

}

variable "vpc_security_group_ids" {
  type = list(string)
}

variable "tags" {
  type = map(string)
  default = {
    Project = "my-project"
  }
}