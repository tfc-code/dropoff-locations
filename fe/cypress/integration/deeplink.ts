describe('Deeplinked address flow', () => {
  it('Displays results when the user visits the page with a full address', () => {
    cy.server();
    cy.route({
      method: 'post',
      url: '*',
      status: 404,
      response: {},
    });
    cy.visit('/?streetAddress=29759%20Robert%20Dr&city=Livonia&state=MI&zipcode=48150');
    cy.get('#__next').get('[data-result]');
  });
});
