import HackeroneClient from 'hackerone-client';
import {
  IntegrationProviderAPIError,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';
import { retry } from '@lifeomic/attempt';
import { Report } from './types';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;
export const HACKERONE_CLIENT_404_ERROR = 'StatusCodeError: 404'; // TODO/HACK: Underlying library not re-throwing status codes correctly so this instead does a substring match to detect if a 404 (e.g., no direct access to err.errors[])

export class APIClient {
  private hackeroneClient;
  constructor(readonly config: IntegrationConfig) {
    this.hackeroneClient = new HackeroneClient(
      config.hackeroneApiKey,
      config.hackeroneApiKeyName,
    );
  }

  public async verifyAuthentication(): Promise<void> {
    try {
      await this.hackeroneClient.verifyAccess();
    } catch (err) {
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint: 'https://api.hackerone.com/v1/user/{keyName}',
        status: err.status,
        statusText: err.statusText,
      });
    }
  }

  public async iterateReports(
    programHandle: string,
    iteratee: ResourceIteratee<Report>,
  ): Promise<void> {
    const attemptFunc = async () => {
      try {
        const reports = (await this.hackeroneClient.queryReports(
          programHandle,
        )) as Report[][];
        for (const reportCollection of reports) {
          for (const report of reportCollection) {
            await iteratee(report);
          }
        }
      } catch (err) {
        let errMsg: string = err.message;
        if (errMsg.includes(HACKERONE_CLIENT_404_ERROR)) {
          errMsg =
            'No reports found using that program *handle* (the program handle is different than the program display name --> verify this value from either the H1 program URL or Edit Page screen)';
        }

        throw new IntegrationProviderAPIError({
          endpoint: `https://api.hackerone.com/v1/reports?filter[program][]=${programHandle}`,
          message: errMsg,
          status: 500,
          statusText: 'UNKNOWN',
          fatal: true,
        });
      }
    };

    await retry(attemptFunc, {
      maxAttempts: 3,
      delay: 30_000,
      timeout: 180_000,
      factor: 2, //exponential backoff factor. with 30 sec start and 3 attempts, longest wait is 2 min
    });
  }
}

let apiClient: APIClient;
export function createAPIClient(config: IntegrationConfig): APIClient {
  if (!apiClient) {
    apiClient = new APIClient(config);
  }
  return apiClient;
}
