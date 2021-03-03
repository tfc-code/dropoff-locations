describe('Miscellaneous user flow behavior', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.server();
    cy.route('/all-states*').as('getLocations');
    cy.route({
      method: 'post',
      url: '*',
      status: 404,
      response: {},
    });
  });

  it('Displays address in url query params when manually inputted', () => {
    cy.get('#__next')
      .find('#address-input')
      .type('29759 Robert Drive, Livonia, MI')
      .closest('.MuiBox-root')
      .contains('29759')
      .first()
      .click();

    cy.url().should(
      'contain',
      '?streetAddress=29759+Robert+Drive&city=Livonia&state=MI&zipcode=48150',
    );

    cy.wait('@getLocations');
    cy.get('#__next').get('[data-result]');
  });

  it('Clicking the header should clear data and query', () => {
    cy.get('#__next')
      .find('#address-input')
      .type('29759 Robert Drive, Livonia, MI')
      .closest('.MuiBox-root')
      .contains('29759')
      .first()
      .click();

    cy.wait('@getLocations');

    cy.get('#__next').get('[alt="Ballot Dropoff Logo"]').click();

    cy.get('#__next').get('[data-result]').should('not.exist');
    cy.url().should('equal', `${Cypress.config().baseUrl}/`);
  });

  it('The user should be able to edit their address', () => {
    cy.get('#__next')
      .find('#address-input')
      .type('29759 Robert Drive, Livonia, MI')
      .closest('.MuiBox-root')
      .contains('29759')
      .first()
      .click();

    cy.wait('@getLocations');

    cy.get('#__next').get('[data-result]');

    cy.get('#__next')
      .find('#address-input')
      .clear()
      .type('13824 Northwest 155th Avenue, Alachua, FL')
      .closest('.MuiBox-root')
      .contains('13824')
      .first()
      .click();

    cy.wait('@getLocations');

    cy.get('#__next').get('[data-result]');
  });

  it('The user should be able to select address using arrow keys', () => {
    cy.get('#__next')
      .find('#address-input')
      .type('29759 Robert Drive, Livonia, MI')
      .closest('.MuiBox-root')
      .contains('29759');

    // down arrow! Input text should change depending on the
    // selected address
    cy.get('#address-input')
      .type('{downarrow}')
      .should('have.value', '29759 Robert Drive, Livonia, Michigan, USA');

    cy.get('#address-input')
      .type('{downarrow}')
      .should('have.value', '29759 Robert Avenue, Livonia, Michigan, USA');

    // should be no more suggestions, so the input box should default
    // back to last typed input
    cy.get('#address-input')
      .type('{downarrow}')
      .should('have.value', '29759 Robert Drive, Livonia, MI');

    cy.get('#__next').get('.selected').should('not.exist');

    // up arrow, navigate us back to the first element
    cy.get('#address-input')
      .type('{uparrow}')
      .should('have.value', '29759 Robert Avenue, Livonia, Michigan, USA')
      .type('{uparrow}')
      .type('{enter}');

    cy.wait('@getLocations');

    cy.get('#address-input').should(
      'have.value',
      '29759 Robert Drive, Livonia, MI, 48150 (Wayne County)',
    );
  });

  it('The user should be able to use the browser back/forward button to navigate', () => {
    cy.get('#__next')
      .find('#address-input')
      .type('29759 Robert Drive, Livonia, MI')
      .closest('.MuiBox-root')
      .contains('29759')
      .first()
      .click();

    cy.wait('@getLocations');

    cy.get('#__next').get('[data-result]');

    cy.get('#__next').get('[alt="Ballot Dropoff Logo"]').click();

    cy.get('#__next').get('[data-result]').should('not.exist');
    cy.url().should('equal', `${Cypress.config().baseUrl}/`);

    cy.go('back');

    cy.url().should(
      'contain',
      '?streetAddress=29759+Robert+Drive&city=Livonia&state=MI&zipcode=48150',
    );

    cy.wait('@getLocations');
    cy.get('#__next').get('[data-result]');
  });
});

describe('i18n', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.server();
    cy.route('/all-states*').as('getLocations');
    cy.route({
      method: 'post',
      url: '*',
      status: 404,
      response: {},
    });
  });

  it('App defaults to English', () => {
    cy.get('#__next').contains('Find nearby ballot dropoff locations');
    cy.get('html').should('have.attr', 'lang', 'en-US');
  });

  it('The user should be able to view a page in Spanish', () => {
    cy.visit('/es-US');
    cy.get('#__next').contains('Encuentre las ubicaciones para entregar su boleta');
    cy.get('html').should('have.attr', 'lang', 'es-US');
  });

  it.skip('The user should be able to toggle a page between languages', () => {
    cy.get('#__next').contains('Find nearby ballot dropoff locations');

    cy.get('#__next').contains('ES').click();
    cy.get('#__next').contains('Encuentre las ubicaciones para entregar su boleta');
    cy.get('html').should('have.attr', 'lang', 'es-US');

    cy.get('#__next').contains('EN').click();
    cy.get('#__next').contains('Find nearby ballot dropoff locations');
    cy.get('html').should('have.attr', 'lang', 'en-US');
  });

  it.skip('The address should be preserved when toggling between languages', () => {
    cy.get('#__next')
      .find('#address-input')
      .type('29759 Robert Drive, Livonia, MI')
      .closest('.MuiBox-root')
      .contains('29759')
      .first()
      .click();

    cy.wait('@getLocations');

    cy.get('#__next').contains('ES').click();

    cy.url().should(
      'contain',
      '/es-US?city=Livonia&county=Wayne&latitude=42.3632442&longitude=-83.33737819999999&state=MI&streetAddress=29759%20Robert%20Drive&zipcode=48150',
    );

    cy.get('#address-input').should(
      'have.value',
      '29759 Robert Drive, Livonia, MI, 48150 (Wayne County)',
    );

    cy.wait('@getLocations');

    cy.get('#__next').contains('EN').click();

    cy.url().should(
      'contain',
      '/en-US?city=Livonia&county=Wayne&latitude=42.3632442&longitude=-83.33737819999999&state=MI&streetAddress=29759%20Robert%20Drive&zipcode=48150',
    );
  });
});
