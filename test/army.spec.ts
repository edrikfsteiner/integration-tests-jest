import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Army API Test', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://api-c5t9.onrender.com';

  p.request.setDefaultTimeout(10000);

  beforeAll(() => {
    p.reporter.add(rep);

    return p
      .spec()
      .post(`${baseUrl}/countries`)
      .withJson({
        name: 'País de Teste para Exércitos'
      })
      .expectStatus(StatusCodes.OK)
      .stores('CountryId', 'id');
  });

  afterAll(() => {
    p.reporter.end();
  });

  describe('Armies', () => {
    const armyName = 'Exército de Teste';
    const updatedArmyName = 'Exército de Teste Atualizado';

    it('should create a new army', async () => {
      await p
        .spec()
        .post(`${baseUrl}/armies`)
        .withJson({
          name: armyName,
          country: {
            id: '$S{CountryId}'
          },
          divisions: []
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          name: armyName
        })
        .stores('ArmyId', 'id');
    });
  });
});
