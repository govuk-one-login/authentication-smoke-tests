const text = {
    login: "Create a GOV.UK One Login or sign in",
    enterEmail: "Enter your email address to sign in to your GOV.UK One Login",
    password: "Enter your password",
    passwordError: "problem",
    passwordWrongTooManyTimes: "You entered the wrong password too many times",
    problemText: "There is a problem"
}

const urls = {
    signIn: "sign-in-or-create",
    email: "enter-email",
    password: "enter-password"
}

const selectors = {
    signInButton: "#main-content #sign-in-button",
    submitFormButton: "#main-content > .govuk-grid-row > .govuk-grid-column-two-thirds > form > .govuk-button",
    passwordInput: ".govuk-grid-row #password",
    otpCodeInput: ".govuk-grid-row #code"
}

module.exports = { text, urls, selectors }