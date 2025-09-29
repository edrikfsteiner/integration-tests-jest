import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Teste endpoint /countries', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://api-c5t9.onrender.com';

  p.request.setDefaultTimeout(10000);

  beforeAll(() => {
    p.reporter.add(rep);
  });

  afterAll(() => {
    p.reporter.end();
  });

  describe('Países', () => {
    const countryName = 'País de Teste';
    const updatedCountryName = 'República de Teste';

    it('Deve criar país', async () => {
      await p
        .spec()
        .post(`${baseUrl}/countries`)
        .withJson({
          name: countryName
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          name: countryName
        })
        .stores('CountryId', 'id');
    });

    it('Deve retornar todos os países', async () => {
      await p
        .spec()
        .get(`${baseUrl}/countries`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array'
        });
    });

    it('Deve retornar país por id', async () => {
      await p
        .spec()
        .get(`${baseUrl}/countries/$S{CountryId}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: '$S{CountryId}',
          name: countryName
        });
    });

    it('Deve atualizar país', async () => {
      await p
        .spec()
        .put(`${baseUrl}/countries`)
        .withJson({
          id: '$S{CountryId}',
          name: updatedCountryName
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: '$S{CountryId}',
          name: updatedCountryName
        });
    });

    it('Deve excluir país', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/countries/$S{CountryId}`)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('Country deleted');
    });
  });
});
