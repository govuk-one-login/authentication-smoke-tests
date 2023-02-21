stub_rp_clients = [
  {
    client_name = "di-auth-smoketest-microclient-integration"
    callback_urls = [
      "http://localhost:3032/callback",
      "http://localhost:3031/callback",
    ]
    logout_urls = [
      "http://localhost:3032/signed-out",
      "http://localhost:3031/signed-out",
    ]
    test_client                     = "1"
    smoke_test                      = "1"
    consent_required                = "0"
    identity_verification_supported = "1"
    client_type                     = "web"
    scopes = [
      "openid",
      "email",
      "phone",
    ]
  },
]
