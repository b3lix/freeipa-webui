import { When, Then, Given } from "@badeball/cypress-cucumber-preprocessor";

Given("I am on login page", () => {
  cy.visit("/");
});

Given(
  "an administrator account named {word} exists",
  (admin_account_exists) => {
    console.log("Admin exists, SUCCESS");
    //   TODO: implement
  }
);

Given("I am logged in as {word}", (loginName) => {});

When("I logout", () => {});

When("I open the side menu", () => {
  cy.get('[id="nav-toggle"]').then(($ele) => {
    if ($ele.attr("aria-expanded") === "false") {
      $ele.click();
    }
  });
});

When("I close the side menu", () => {
  cy.get('[id="nav-toggle"]').then(($ele) => {
    if ($ele.attr("aria-expanded") === "true") {
      $ele.click();
    }
  });
});
When("I click on {} tab", (tabText) => {
  cy.get("nav a").contains(tabText).click();
});

When("I click on {} button", function (buttonText) {
  cy.get("button").contains(buttonText).click();
});

When("in a dialog I click on {} button", function (buttonText) {
  cy.get("[role=dialog] button").contains(buttonText).click();
});

When("I type in the field {} text {}", (fieldName, content) => {
  cy.get("[role=dialog] label")
    .contains(fieldName)
    .parent()
    .then(($label) => {
      cy.get("[name=modal-form-" + $label.attr("for") + "]").type(content);
    });
});
