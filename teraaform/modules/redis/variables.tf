variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "node_type" {
  type    = string
  default = "cache.t3.micro"
}

variable "cluster_size" {
  type    = number
  default = 2
}

variable "engine_version" {
  type    = string
  default = "7.0"
}

variable "tags" {
  type = map(string)
  default = {}
}

variable "allowed_cidrs" {
  type    = list(string)
  default = ["10.0.0.0/16"]
}