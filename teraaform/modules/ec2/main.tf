resource "aws_key_pair" "my-key-pair" {
  key_name   = var.key_name
  public_key = tls_private_key.rsa.public_key_openssh # Ensure this path points to your SSH public key
}

resource "tls_private_key" "rsa" {
  algorithm ="RSA"
  rsa_bits = 4096
}

resource "local_file" "my-key-pair" {
  content =  tls_private_key.rsa.private_key_pem
  filename = "my-key-pair.pem"
}


resource "aws_instance" "ec2_instance" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
   subnet_id             = var.subnet_id
  key_name               = aws_key_pair.my-key-pair.key_name
  vpc_security_group_ids = [var.security_group_id]

  tags = merge(var.tags, {
    Name = "my-ec2-instance"
  })
}