import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Teste endpoint /buildings', () => {
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
        name: 'País para Províncias de Teste'
      })
      .expectStatus(StatusCodes.OK)
      .stores('CountryId', 'id')
      .returns(ctx => {
        return p
          .spec()
          .post(`${baseUrl}/provinces`)
          .withJson({
            name: 'Província de Teste para Construções',
            country: {
              id: ctx.res.body.id
            }
          })
          .expectStatus(StatusCodes.OK)
          .stores('ProvinceId', 'id');
      });
  });

  afterAll(() => {
    p.reporter.end();
  });

  describe('Construções', () => {
    const buildingName = 'Serraria de Teste';
    const updatedBuildingName = 'Serraria Atualizada';

    it('Deve criar construção', async () => {
      await p
        .spec()
        .post(`${baseUrl}/buildings`)
        .withJson({
          name: buildingName,
          level: 1,
          resourceGrowth: 50.0,
          province: {
            id: '$S{ProvinceId}'
          }
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          name: buildingName,
          level: 1
        })
        .stores('BuildingId', 'id');
    });

    it('Deve retornar todas as construções', async () => {
      await p
        .spec()
        .get(`${baseUrl}/buildings`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array'
        });
    });

    it('Deve retornar construção por id', async () => {
      await p
        .spec()
        .get(`${baseUrl}/buildings/$S{BuildingId}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: '$S{BuildingId}',
          name: buildingName
        });
    });

    it('Deve atualizar construção', async () => {
      await p
        .spec()
        .put(`${baseUrl}/buildings`)
        .withJson({
          id: '$S{BuildingId}',
          name: updatedBuildingName,
          level: 5,
          province: {
            id: '$S{ProvinceId}'
          }
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: '$S{BuildingId}',
          name: updatedBuildingName,
          level: 5
        });
    });

    it('Deve excluir construção', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/buildings/$S{BuildingId}`)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('Building deleted');
    });
  });
});
