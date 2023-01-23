import HackeroneClient from 'hackerone-client';
import {
  IntegrationProviderAPIError,
  IntegrationProviderAuthenticationError,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';
import { retry } from '@lifeomic/attempt';
import {
  HackerOneOrganization,
  HackerOneProgram,
  HackerOneStructuredScope,
  Report,
} from './types';
import fetch, { Response } from 'node-fetch';

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;
export const HACKERONE_CLIENT_404_ERROR = 'StatusCodeError: 404'; // TODO/HACK: Underlying library not re-throwing status codes correctly so this instead does a substring match to detect if a 404 (e.g., no direct access to err.errors[])

export class APIClient {
  private baseUrl = 'https://api.hackerone.com/v1/';
  private hackeroneClient;
  private limit = 50;

  constructor(readonly config: IntegrationConfig) {
    this.hackeroneClient = new HackeroneClient(
      config.hackeroneApiKey,
      config.hackeroneApiKeyName,
    );
  }

  private withBaseUrl = (path: string) => `${this.baseUrl}${path}`;

  // To query endpoints not supported in hackerone-client
  private async request(uri: string): Promise<Response> {
    try {
      const result = await retry(
        async () => {
          const response = await fetch(uri, {
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${this.config.hackeroneApiKeyName}:${this.config.hackeroneApiKey}`,
              ).toString('base64')}`,
            },
          });
          if (!response.ok) {
            throw new IntegrationProviderAPIError({
              endpoint: uri,
              status: response.status,
              statusText: response.statusText,
            });
          }
          return response;
        },
        {
          delay: 1000,
          factor: 2,
          maxAttempts: 10,
          handleError: (err, context) => {
            const rateLimitType = err.response.headers.get('X-RateLimit-Type');
            // only retry on 429 && per second limit
            if (!(err.status === 429 && rateLimitType === 'QPS')) {
              context.abort();
            }
          },
        },
      );
      return result;
    } catch (error) {
      throw new IntegrationProviderAPIError({
        endpoint: uri,
        status: error.status,
        statusText: error.statusText,
      });
    }
  }

  private async paginatedRequest<T>(
    uri: string,
    iteratee: ResourceIteratee<T>,
  ): Promise<void> {
    try {
      let current = `${uri}?page[number]=1&page[size]=${this.limit}`;
      let response: Response;
      do {
        response = await this.request(current);

        const { data, links } = await response.json();
        current = links?.last !== links?.self ? links?.next : '';

        for (const resource of data) await iteratee(resource);
      } while (current);
    } catch (err) {
      throw new IntegrationProviderAPIError({
        cause: new Error(err.message),
        endpoint: uri,
        status: err.statusCode,
        statusText: err.message,
      });
    }
  }

  public async verifyAuthentication(): Promise<void> {
    try {
      await this.hackeroneClient.getPrograms();
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

  // API key is for a single organization only. Pagination is
  // unnecessary but is implemented due to endpoint design.
  public async fetchOrganization(
    iteratee: ResourceIteratee<HackerOneOrganization>,
  ): Promise<void> {
    const url = this.withBaseUrl('me/organizations');
    await this.paginatedRequest(url, iteratee);
  }

  public async iteratePrograms(
    iteratee: ResourceIteratee<HackerOneProgram>,
  ): Promise<void> {
    const programs = await this.hackeroneClient.getPrograms();
    const { data } = JSON.parse(programs);

    for (const program of data) {
      await iteratee(program);
    }
  }

  public async iterateProgramAsset(
    programId: string,
    iteratee: ResourceIteratee<HackerOneStructuredScope>,
  ): Promise<void> {
    const url = this.withBaseUrl(`programs/${programId}/structured_scopes`);
    await this.paginatedRequest(url, iteratee);
  }
}

let apiClient: APIClient;
export function createAPIClient(config: IntegrationConfig): APIClient {
  if (!apiClient) {
    apiClient = new APIClient(config);
  }
  return apiClient;
}
