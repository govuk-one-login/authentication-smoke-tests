const selectors = {
  signInButton: "#main-content #sign-in-button",
  createAccountButton: "#main-content #create-account-link",
  submitFormButton:
    "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button",
  passwordInput: ".govuk-grid-row #password",
  confirmPasswordInput: ".govuk-grid-row #confirm-password",
  emailInput: ".govuk-grid-row #email",
  otpCodeInput: ".govuk-grid-row #code",
  smsMfaRadio: ".govuk-grid-row #mfaOptions",
  phoneNumberInput: ".govuk-grid-row #phoneNumber",
  detailsCorrect: ".govuk-grid-row #up-to-date",
};

module.exports = { selectors };
