import { createTestIntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk";

import { IntegrationExecutionContext } from "@jupiterone/jupiter-managed-integration-sdk/integration";
import mockHackeroneClient from "../test/helpers/mockHackeroneClient";
import { HACKERONE_CLIENT_404_ERROR } from "./constants";
import synchronize from "./synchronize";

jest.mock("hackerone-client", () => {
  return jest.fn().mockImplementation(() => mockHackeroneClient);
});

describe("synchronize", () => {
  let executionContext: IntegrationExecutionContext;
  let persisterOperations: any;

  beforeEach(() => {
    persisterOperations = {
      created: 1,
      deleted: 0,
      updated: 0,
    };
    executionContext = createTestIntegrationExecutionContext();

    executionContext.instance.config = {
      hackeroneApiKey: "api-key",
      hackeroneApiKeyName: "api-key-name",
      hackeroneProgramHandle: "some-handle",
    };

    jest
      .spyOn(executionContext.clients.getClients().graph, "findEntities")
      .mockResolvedValue([]);

    jest
      .spyOn(executionContext.clients.getClients().graph, "findRelationships")
      .mockResolvedValue([]);

    jest
      .spyOn(
        executionContext.clients.getClients().persister,
        "publishPersisterOperations",
      )
      .mockResolvedValue(persisterOperations);
  });

  test("compiles and runs", async () => {
    const result = await synchronize(executionContext);
    expect(result).toEqual(persisterOperations);
  });

  test("throws on error", async () => {
    mockHackeroneClient.queryReports.mockRejectedValue(
      new Error("Not a 404 error"),
    );

    await expect(synchronize(executionContext)).rejects.toThrow(
      /Not a 404 error/,
    );
  });

  test("throws on 404s with a special message", async () => {
    mockHackeroneClient.queryReports.mockRejectedValue(
      new Error(HACKERONE_CLIENT_404_ERROR),
    );

    await expect(synchronize(executionContext)).rejects.toThrow(
      /No reports found using that program \*handle\* /,
    );
  });
});
