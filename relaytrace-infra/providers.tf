terraform {
  required_version = ">= 1.7"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  # ── Remote state — Azure Blob Storage ──────────────────────────────────────
  # The Terraform state lives in the same storage account as the application blobs.
  # Bootstrap process (first time or after full destroy):
  #   Step 1: Comment out this backend block → terraform init (local state)
  #   Step 2: terraform apply  (creates strelaytracedev with tfstate container)
  #   Step 3: Uncomment this block → terraform init -migrate-state
  #   Step 4: Delete old bootstrap RG: az group delete -n rg-relaytrace-tfstate -y
  #backend "azurerm" {
  # resource_group_name  = "rg-relaytrace-dev"
  # storage_account_name = "strelaytracedev"
  # container_name       = "tfstate"
  # key                  = "relaytrace/dev.tfstate"
  #}
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = false
      recover_soft_deleted_key_vaults = true
    }
    # resource_group.prevent_deletion_if_contains_resources was removed in
    # azurerm 4.0. Non-empty resource groups are now always protected from
    # accidental destruction by Terraform's dependency graph.
  }
}
