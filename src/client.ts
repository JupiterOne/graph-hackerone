import axios, { AxiosInstance } from 'axios';

import { IntegrationProviderAuthenticationError } from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from './config';
import { AcmeUser, AcmeGroup, Report, QueryResult } from './types';
// import * as http from "http";

export type ResourceIteratee<T> = (each: T) => Promise<void> | void;

/**
 * An APIClient maintains authentication state and provides an interface to
 * third party data APIs.
 *
 * It is recommended that integrations wrap provider data APIs to provide a
 * place to handle error responses and implement common patterns for iterating
 * resources.
 */
export class APIClient {
  private readonly hostname: string = 'https://api.hackerone.com:443/v1/';
  private readonly axiosInstance: AxiosInstance;

  constructor(readonly config: IntegrationConfig) {
    this.axiosInstance = axios.create({
      baseURL: this.hostname,
      auth: {
        username: this.config.hackeroneApiKeyName,
        password: this.config.hackeroneApiKey,
      },
      headers: { 'X-Custom-Header': 'foobar' },
    });
  }

  public async verifyAuthentication(): Promise<void> {
    // TODO make the most light-weight request possible to validate
    // authentication works with the provided credentials, throw an err if
    // authentication fails
    return Promise.resolve();

    // const request = new Promise<void>((resolve, reject) => {
    //   http.get(
    //     {
    //       hostname: 'localhost',
    //       port: 443,
    //       path: '/api/v1/some/endpoint?limit=1',
    //       agent: false,
    //       timeout: 10,
    //     },
    //     (res) => {
    //       if (res.statusCode !== 200) {
    //         reject(new Error('Provider authentication failed'));
    //       } else {
    //         resolve();
    //       }
    //     },
    //   );
    // });
    //
    // try {
    //   await request;
    // } catch (err) {
    //   throw new IntegrationProviderAuthenticationError({
    //     cause: err,
    //     endpoint: 'https://localhost/api/v1/some/endpoint?limit=1',
    //     status: err.status,
    //     statusText: err.statusText,
    //   });
    // }
  }

  public async queryReports(
    additionalFilters,
    path,
  ): Promise<{ nextLink: string; reports: Report[] }> {
    try {
      const { data: body } = await this.axiosInstance.get<null, QueryResult>(
        path,
      );
      const response = { reports: body.data, nextLink: body.links.next || '' };
      console.log({ ...response }, 'queryReports: Sending response with');
      return { reports: body.data, nextLink: body.links.next || '' };
    } catch (err) {
      throw new IntegrationProviderAuthenticationError({
        cause: err,
        endpoint: this.hostname + path,
        status: err.status,
        statusText: err.statusText,
      });
    }
  }

  /**
   * Iterates each user resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   * @param additionalFilters
   */
  public async iterateReports(
    iteratee: ResourceIteratee<Report>,
    additionalFilters = {},
  ): Promise<void> {
    let path =
      'reports?filter[program][]=' + this.config.hackeroneProgramHandle;

    if (additionalFilters) {
      for (const key in additionalFilters) {
        const value = additionalFilters[key];
        path += '&' + key + '=' + value;
      }
    }

    let nextPage: boolean = true;
    while (nextPage) {
      const { reports, nextLink } = await this.queryReports(
        additionalFilters,
        path,
      );
      for (const report of reports) {
        await iteratee(report);
      }

      if (!nextLink) {
        nextPage = false;
      } else {
        path = nextLink;
      }
    }

    console.log('Done iterated');
  }

  /**
   * Iterates each user resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateUsers(
    iteratee: ResourceIteratee<AcmeUser>,
  ): Promise<void> {
    // TODO paginate an endpoint, invoke the iteratee with each record in the
    // page
    //
    // The provider API will hopefully support pagination. Functions like this
    // should maintain pagination state, and for each page, for each record in
    // the page, invoke the `ResourceIteratee`. This will encourage a pattern
    // where each resource is processed and dropped from memory.

    const users: AcmeUser[] = [
      {
        id: 'acme-user-1',
        name: 'User One',
      },
      {
        id: 'acme-user-2',
        name: 'User Two',
      },
    ];

    for (const user of users) {
      await iteratee(user);
    }
  }

  /**
   * Iterates each group resource in the provider.
   *
   * @param iteratee receives each resource to produce entities/relationships
   */
  public async iterateGroups(
    iteratee: ResourceIteratee<AcmeGroup>,
  ): Promise<void> {
    // TODO paginate an endpoint, invoke the iteratee with each record in the
    // page
    //
    // The provider API will hopefully support pagination. Functions like this
    // should maintain pagination state, and for each page, for each record in
    // the page, invoke the `ResourceIteratee`. This will encourage a pattern
    // where each resource is processed and dropped from memory.

    const groups: AcmeGroup[] = [
      {
        id: 'acme-group-1',
        name: 'Group One',
        users: [
          {
            id: 'acme-user-1',
          },
        ],
      },
    ];

    for (const group of groups) {
      await iteratee(group);
    }
  }
}

export function createAPIClient(config: IntegrationConfig): APIClient {
  return new APIClient(config);
}
