terraform {
  required_version = ">= 1.7"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
  }

  # ── Remote state — Azure Blob Storage ──────────────────────────────────────
  # Bootstrap: create this storage account manually ONCE before `terraform init`
  #   az group create -n rg-relaytrace-tfstate -l eastus
  #   az storage account create -n relaytracestate -g rg-relaytrace-tfstate --sku Standard_LRS
  #   az storage container create -n tfstate --account-name relaytracestate
  backend "azurerm" {
    resource_group_name  = "rg-relaytrace-tfstate"
    storage_account_name = "relaytracestate"
    container_name       = "tfstate"
    key                  = "relaytrace.terraform.tfstate"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = false
      recover_soft_deleted_key_vaults = true
    }
    resource_group {
      # Prevent accidental deletion of non-empty resource groups
      prevent_deletion_if_contains_resources = true
    }
  }
}
