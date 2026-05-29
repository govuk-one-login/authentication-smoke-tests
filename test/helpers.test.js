const { expect } = require("chai");
const sinon = require("sinon");

const {
  validateTitle,
  validateNoText,
  validateUrlContains,
  setStandardViewportSize,
} = require("../src/helpers");

describe("helpers", () => {
  describe("validateTitle", () => {
    it("should not throw when title contains expected text", async () => {
      const page = { evaluate: sinon.stub().resolves() };
      await validateTitle("My Title", page);
      expect(page.evaluate).to.have.been.calledWith(
        sinon.match.func,
        "My Title"
      );
    });

    it("should pass expectedTitle to page.evaluate", async () => {
      const page = { evaluate: sinon.stub().resolves() };
      await validateTitle("Expected", page);
      expect(page.evaluate.firstCall.args[1]).to.equal("Expected");
    });
  });

  describe("validateNoText", () => {
    it("should pass notExpectedText to page.evaluate", async () => {
      const page = { evaluate: sinon.stub().resolves() };
      await validateNoText("There is a problem", page);
      expect(page.evaluate.firstCall.args[1]).to.equal("There is a problem");
    });
  });

  describe("validateUrlContains", () => {
    it("should not throw when url contains expected slug", async () => {
      const page = {
        url: sinon.stub().returns("https://example.com/enter-email"),
      };
      await validateUrlContains("enter-email", page);
    });

    it("should throw when url does not contain expected slug", async () => {
      const page = {
        url: sinon.stub().returns("https://example.com/other"),
      };
      try {
        await validateUrlContains("enter-email", page);
        expect.fail("should have thrown");
      } catch (err) {
        expect(err.message).to.contain("does not contain 'enter-email'");
      }
    });
  });

  describe("setStandardViewportSize", () => {
    it("should set viewport to 1864x1096", async () => {
      const page = { setViewport: sinon.stub().resolves() };
      await setStandardViewportSize(page);
      expect(page.setViewport).to.have.been.calledWith({
        width: 1864,
        height: 1096,
      });
    });
  });
});
