import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Teste endpoint /provinces', () => {
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
        name: 'País de Teste para Províncias'
      })
      .expectStatus(StatusCodes.OK)
      .stores('CountryId', 'id');
  });

  afterAll(() => {
    p.reporter.end();
  });

  describe('Províncias', () => {
    const provinceName = 'Província de Teste';
    const updatedProvinceName = 'Capital de Teste';

    it('Deve criar província', async () => {
      await p
        .spec()
        .post(`${baseUrl}/provinces`)
        .withJson({
          name: provinceName,
          population: 50000,
          country: {
            id: '$S{CountryId}'
          },
          buildings: []
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          name: provinceName
        })
        .stores('ProvinceId', 'id');
    });

    it('Deve retornar todas as províncias', async () => {
      await p
        .spec()
        .get(`${baseUrl}/provinces`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array'
        });
    });

    it('Deve retornar província por id', async () => {
      await p
        .spec()
        .get(`${baseUrl}/provinces/$S{ProvinceId}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: '$S{ProvinceId}',
          name: provinceName
        });
    });

    it('Deve atualizar província', async () => {
      await p
        .spec()
        .put(`${baseUrl}/provinces`)
        .withJson({
          id: '$S{ProvinceId}',
          name: updatedProvinceName,
          population: 75000,
          country: {
            id: '$S{CountryId}'
          }
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: '$S{ProvinceId}',
          name: updatedProvinceName
        });
    });

    it('Deve excluir província', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/provinces/$S{ProvinceId}`)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('Province deleted');
    });
  });
});
