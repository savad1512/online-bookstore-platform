variable "ami_id" {
  type = string
  default = "ami-084568db4383264d4"
}

variable "instance_type" {
  type = string
  default = "t3.micro"  # Free Tier eligible (t2.micro no longer eligible)
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
  type = string
  default = "my-app-key"  # Must match root variables.tf
}