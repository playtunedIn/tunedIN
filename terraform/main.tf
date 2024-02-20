resource "aws_ssm_parameter" "foo" {
  name  = "foo"
  type  = "String"
  value = "barr"
}

# Define variables
variable "ecr_repository_name" {
  description = "Name of the ECR repository"
  type        = string
  default     = "tunedin-image-repository"
}

variable "docker_compose_file" {
  description = "Path to the Docker Compose file"
  type        = string
  default     = "../docker-compose.yml"
}

# # Create ECR repository
# resource "aws_ecr_repository" "my_ecr_repo" {
#   name = var.ecr_repository_name
# }

# Authenticate Docker to the ECR registry
data "aws_ecr_authorization_token" "ecr_auth" {}

# Parse ECR registry URL from the authorization token
locals {
  ecr_registry_url = jsondecode(base64decode(data.aws_ecr_authorization_token.ecr_auth.authorization_token)).proxy_endpoint
}

# Build and push Docker image to ECR
resource "null_resource" "build_and_push_image" {
  triggers = {
    docker_compose_file = filesha256(var.docker_compose_file)
  }

  provisioner "local-exec" {
    command = <<-EOT
      # Build Docker image using Docker Compose
      docker-compose -f ${var.docker_compose_file} build

      # Authenticate Docker to the ECR registry
      aws --region ${var.region} ecr get-login-password --region ${var.region} | docker login --username AWS --password-stdin ${local.ecr_registry_url}

      # Tag Docker image
      docker tag ${aws_ecr_repository.my_ecr_repo.repository_url}:latest ${local.ecr_registry_url}/${aws_ecr_repository.my_ecr_repo.repository_name}:latest

      # Push Docker image to ECR
      docker push ${local.ecr_registry_url}/${aws_ecr_repository.my_ecr_repo.repository_name}:latest
    EOT
  }
}

# Output ECR repository URL
output "ecr_repository_url" {
  value = aws_ecr_repository.my_ecr_repo.repository_url
}