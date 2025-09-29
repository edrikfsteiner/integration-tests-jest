import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Teste endpoint /divisions', () => {
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
        name: 'País para Exércitos de Teste'
      })
      .expectStatus(StatusCodes.OK)
      .stores('CountryId', 'id')
      .returns(ctx => {
        return p
          .spec()
          .post(`${baseUrl}/armies`)
          .withJson({
            name: 'Exército para Divisões de Teste',
            country: {
              id: ctx.res.body.id
            }
          })
          .expectStatus(StatusCodes.OK)
          .stores('ArmyId', 'id');
      });
  });

  afterAll(() => {
    p.reporter.end();
  });

  describe('Divisões', () => {
    const divisionType = 'INFANTRY';
    const updatedDivisionType = 'CAVALRY';

    it('Deve criar divisão', async () => {
      await p
        .spec()
        .post(`${baseUrl}/divisions`)
        .withJson({
          type: divisionType,
          level: 1,
          organization: 20.0,
          damage: 2.0,
          defense: 0.2,
          army: {
            id: '$S{ArmyId}'
          }
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          type: divisionType,
          level: 1
        })
        .stores('DivisionId', 'id');
    });

    it('Deve retornar todas as divisões', async () => {
      await p
        .spec()
        .get(`${baseUrl}/divisions`)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema({
          type: 'array'
        });
    });

    it('Deve retornar divisão por id', async () => {
      await p
        .spec()
        .get(`${baseUrl}/divisions/$S{DivisionId}`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: '$S{DivisionId}',
          type: divisionType
        });
    });

    it('Deve atualizar divisão', async () => {
      await p
        .spec()
        .put(`${baseUrl}/divisions`)
        .withJson({
          id: '$S{DivisionId}',
          type: updatedDivisionType,
          level: 5,
          organization: 30.0,
          damage: 4.0,
          defense: 0.2,
          army: {
            id: '$S{ArmyId}'
          }
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          id: '$S{DivisionId}',
          type: updatedDivisionType,
          level: 5
        });
    });

    it('Deve excluir divisão', async () => {
      await p
        .spec()
        .delete(`${baseUrl}/divisions/$S{DivisionId}`)
        .expectStatus(StatusCodes.OK)
        .expectBodyContains('Division deleted');
    });
  });
});
