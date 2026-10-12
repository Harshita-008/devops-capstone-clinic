# Credentials come from the AWS CLI profile or environment, never from these files.
provider "aws" {
  region = var.aws_region

  # Every resource gets these tags, which makes the lab easy to find in the console and in billing.
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
