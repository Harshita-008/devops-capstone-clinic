module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "21.29.0"

  name               = "${local.name}-eks"
  kubernetes_version = var.kubernetes_version

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Public endpoint so kubectl works from a laptop; the Terraform user becomes admin.
  endpoint_public_access                   = true
  enable_cluster_creator_admin_permissions = true

  # Lab cluster: no KMS key or log group, so nothing keeps billing after destroy.
  create_kms_key              = false
  encryption_config           = null
  create_cloudwatch_log_group = false
  enabled_log_types           = []

  addons = {
    vpc-cni    = { before_compute = true }
    kube-proxy = {}
    coredns    = {}
  }

  eks_managed_node_groups = {
    default = {
      instance_types = [var.node_instance_type]
      desired_size   = var.node_count.desired
      min_size       = var.node_count.min
      max_size       = var.node_count.max
    }
  }
}
