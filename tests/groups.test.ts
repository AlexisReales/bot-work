import request from "supertest";

const appUrl = 'http://localhost:3000';

const clientId = "";
const wppNumberId = ""; // example: "556181669221@c.us" 
let groupId = "";
const newGroup = {
	"title": "Testando (remover)",
	"participants": [wppNumberId]
};

describe('GET /groups/:clientId', () => {
  it('should return all groups for clientId', async () => {
    return request(appUrl)
      .get(`/groups/${clientId}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .then((response) => {
        expect(response.statusCode).toBe(200);
      });
  });
});

describe("POST /groups/:clientId", () => {
  it("should create a group for clientId", async () => {
    return request(appUrl)
    .post(`/groups/${clientId}`)
    .send(newGroup)
    .expect(200)
    .then((response) => {
        groupId = response.body["id"]["_serialized"];
    });
  });
});

describe("DELETE /groups/:clientId/:remoteId", () => {
  it("should delete a group for clientId", async () => {
    return request(appUrl)
    .delete(`/groups/${clientId}/${groupId}`)
    .expect(200)
  });
});
