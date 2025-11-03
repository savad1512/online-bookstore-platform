variable "ami_id" {
  type = string
  default = "ami-084568db4383264d4"
}

variable "instance_type" {
  type = string
  default = "t3.medium"
}

variable "subnet_id" {
  type = string
}

variable "security_group_id" {
  type = string
}


variable "tags" {
  type = map(string)
  default = {
    Project = "my-project"
  }
}

variable "key_name" {
  default = "my-key-pair"
}