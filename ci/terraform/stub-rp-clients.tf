resource "tls_private_key" "stub_rp_client_private_key" {
  count = length(var.stub_rp_clients)

  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "random_string" "stub_rp_client_id" {
  count = length(var.stub_rp_clients)

  lower   = true
  upper   = true
  special = false
  numeric = true
  length  = 32
}


resource "aws_dynamodb_table_item" "stub_rp_client" {
  count = length(var.stub_rp_clients)

  table_name = var.use_integration_env_for_sign_in_journey ? "integration-client-registry" : "${var.environment}-client-registry"
  hash_key   = "ClientID"

  item = jsonencode({
    ClientID = {
      S = random_string.stub_rp_client_id[count.index].result
    }
    ClientName = {
      S = var.stub_rp_clients[count.index].client_name
    }
    Contacts = {
      L = [{
        S = "contact+${var.stub_rp_clients[count.index].client_name}@example.com"
      }]
    }
    PostLogoutRedirectUrls = {
      L = [for url in var.stub_rp_clients[count.index].logout_urls : {
        S = url
      }]
    }
    RedirectUrls = {
      L = [for url in var.stub_rp_clients[count.index].callback_urls : {
        S = url
      }]
    }
    Scopes = {
      L = [for scope in var.stub_rp_clients[count.index].scopes : {
        S = scope
      }]
    },
    Claims = {
      L = [
        {
          S = "https://vocab.account.gov.uk/v1/coreIdentityJWT"
        },
        {
          S = "https://vocab.account.gov.uk/v1/passport"
        },
        {
          S = "https://vocab.account.gov.uk/v1/address"
        },
        {
          S = "https://vocab.account.gov.uk/v1/drivingPermit"
        },
      ]
    }
    PublicKey = {
      S = replace(replace(
        replace(
        tls_private_key.stub_rp_client_private_key[count.index].public_key_pem, "-----BEGIN PUBLIC KEY-----", ""),
      "-----END PUBLIC KEY-----", ""), "\n", "")
    }
    ServiceType = {
      S = "MANDATORY"
    }
    SubjectType = {
      S = "pairwise"
    }
    CookieConsentShared = {
      N = "1"
    }
    ConsentRequired = {
      N = var.stub_rp_clients[count.index].consent_required
    }
    IdentityVerificationSupported = {
      N = var.stub_rp_clients[count.index].identity_verification_supported
    }
    ClientType = {
      S = var.stub_rp_clients[count.index].client_type
    }
    TestClient = {
      N = var.stub_rp_clients[count.index].test_client
    }
    SmokeTest = {
      N = var.stub_rp_clients[count.index].smoke_test
    }
    RateLimit = {
      N = "5"
    }
  })
}
