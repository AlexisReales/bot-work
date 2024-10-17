import request from "supertest";

const appUrl = 'http://localhost:3000';

describe('GET /clients', () => {
  it('should return all clients', async () => {
    return request(appUrl)
      .get('/clients')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.statusCode).toBe(200);
        // expect(response.body).toEqual(
        //   expect.arrayContaining([
        //     expect.objectContaining({
        //         userId: expect.any(String),
        //         name: expect.any(String),
        //         wppNumber: expect.any(String),
        //     }),
        //   ])
        // );
      });
  });
});