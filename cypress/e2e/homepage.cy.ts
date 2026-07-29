describe('Homepage', () => {
  it('displays the hero heading', () => {
    cy.visit('/');
    cy.contains('StellarAid').should('be.visible');
  });
});
