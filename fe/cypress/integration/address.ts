describe('Manual address entry flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.server();
    cy.route({
      method: 'post',
      url: '*',
      status: 404,
      response: {},
    });
  });

  it('Displays results when the user enters an address in WI', () => {
    cy.get('#__next')
      .find('#address-input')
      .type('15889 W 3rd St, Hayward, WI 54843')
      .closest('.MuiBox-root')
      .contains('15889')
      .first()
      .click();

    cy.get('#__next').get('[data-result]');
  });

  it('Displays results when the user enters an address in MI', () => {
    cy.get('#__next')
      .find('#address-input')
      .type('29759 Robert Drive, Livonia, MI')
      .closest('.MuiBox-root')
      .contains('29759')
      .first()
      .click();

    cy.get('#__next').get('[data-result]');
  });

  it('Displays results when the user enters an address in PA', () => {
    cy.get('#__next')
      .find('#address-input')
      .type('1002 E Luzerne St, Philadelphia, PA')
      .closest('.MuiBox-root')
      .contains('1002')
      .first()
      .click();

    cy.get('#__next').get('[data-result]');
  });

  it('Displays results when the user enters an address in CO', () => {
    cy.get('#__next')
      .find('#address-input')
      .type('1220 Davis St Estes Park')
      .closest('.MuiBox-root')
      .contains('1220')
      .first()
      .click();

    cy.get('#__next').get('[data-result]');
  });

  it('Displays results when the user enters an address in FL', () => {
    cy.get('#__next')
      .find('#address-input')
      .type('13824 Northwest 155th Avenue, Alachua, FL')
      .closest('.MuiBox-root')
      .contains('13824')
      .first()
      .click();

    cy.get('#__next').get('[data-result]');
  });

  it('Displays results when the user enters an address in NC', () => {
    cy.get('#__next')
      .find('#address-input')
      .type('2679 Reynolds Dr, Winston-Salem, NC')
      .closest('.MuiBox-root')
      .contains('2679')
      .first()
      .click();

    cy.get('#__next').get('[data-result]');
  });

  it('Displays results when the user enters an address in WA', () => {
    cy.get('#__next')
      .find('#address-input')
      .type('4325 Whitman Avenue North, Seattle, WA')
      .closest('.MuiBox-root')
      .contains('4325')
      .first()
      .click();

    cy.get('#__next').get('[data-result]');
  });

  it('Displays an error when the API fails to return data', () => {
    cy.route({
      method: 'get',
      url: '/all-states*',
      status: 503,
      response: {},
    });
    cy.get('#__next')
      .find('#address-input')
      .type('29759 Robert Drive, Livonia, MI')
      .closest('.MuiBox-root')
      .contains('29759')
      .first()
      .click();

    cy.get('#__next').contains('Failed to fetch data.');
  });
});
