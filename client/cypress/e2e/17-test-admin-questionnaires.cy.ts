describe("admin add, configure and delete questionnaires", () => {
  const add_questionnaires = async (questionnaire_name:string) => {
    cy.get(".show-add-questionnaire-btn").click();
    cy.get("input[name='new_questionnaire.name']").type(questionnaire_name);
    cy.get("#add-questionnaire-btn").click();
    cy.contains(questionnaire_name).should("be.visible");
  };

  const add_question = async (question_type:string, question_id:number) => {
    cy.get(".show-add-question-btn").first().click();
    cy.get("input[name='new_field.label']").first().type(question_type);
    cy.get("select[name='new_field.type']").first().select(question_id);
    cy.get("#add-field-btn").first().click();

    if (["Checkbox", "Selection box"].indexOf(question_type) === 0) {
      cy.waitForLoader();
      cy.get('.fieldBox').should('be.visible', { timeout: 10000 }).contains('span', question_type).click();

      for (let i = 0; i < 3; i++) {
        cy.get('button[name="addOption"]').click();
        cy.get("input[name='option.label']").eq(i).type("option");
      }

      cy.get('button[name="delOption"]').eq(2).click();
      cy.get('button[name="save_field"]').filter(':visible').first().click();
    }
  };

  const add_step = async (step_label:string) => {
    cy.get("button[name='new_step']").click();
    cy.get("input[name='new_step.label']").type(step_label);
    cy.get("#add-step-btn").click();
    cy.contains(step_label).should("be.visible");
  };

  it("should add and configure questionnaires", () => {
    cy.login_admin();
    cy.visit("/#/admin/questionnaires");

    add_questionnaires("Questionnaire 1");
    add_questionnaires("Questionnaire 2");

    cy.contains("Questionnaire 1").click();

    add_step("Step 1");
    add_step("Step 2");
    add_step("Step 3");

    const fieldTypes = Cypress.env("field_types");
    cy.contains("Step 2").should('be.visible', { timeout: 10000 }).click();

    fieldTypes.forEach((questionType: string, index: number) => {
        cy.waitForLoader();
        add_question(questionType, index);
    });

    cy.contains("Step 2").click();

    cy.get('button[name="delStep"]').eq(2).click();
    cy.get("#modal-action-ok").click();

    cy.contains("Questionnaire 1").click();

    cy.get('button[name="deleteQuestionnaire"]').each(($button) => {
      cy.wrap($button).click();
      cy.get("#modal-action-ok").click();
    });


    cy.get('[data-cy="question_templates"]').click();

    fieldTypes.forEach((questionType:string, index: number) => {
      add_question(questionType, index);
    });

    cy.logout();
  });
});
