variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Prefix used in resource names and tags."
  type        = string
  default     = "clinicflow"
}

variable "environment" {
  description = "Environment name, part of resource names."
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "Address range of the VPC; subnets are carved out of it."
  type        = string
  default     = "10.30.0.0/16"
}

variable "az_count" {
  description = "Number of availability zones, each gets one public and one private subnet."
  type        = number
  default     = 2

  validation {
    condition     = var.az_count >= 2
    error_message = "EKS needs subnets in at least two availability zones."
  }
}

variable "kubernetes_version" {
  description = "EKS Kubernetes version."
  type        = string
  default     = "1.35"
}

variable "node_instance_type" {
  description = "EC2 instance type of the worker nodes."
  type        = string
  default     = "t3.small"
}

variable "node_count" {
  description = "Desired, minimum and maximum size of the worker node group."
  type = object({
    desired = number
    min     = number
    max     = number
  })
  default = {
    desired = 1
    min     = 1
    max     = 2
  }
}
