import {
  IntegrationExecutionContext,
  IntegrationValidationError,
  IntegrationInstanceConfigFieldMap,
  IntegrationInstanceConfig,
} from '@jupiterone/integration-sdk-core';
import { createAPIClient } from './client';
import { HackerOneIntegrationInstanceConfig } from './types';

/**
 * A type describing the configuration fields required to execute the
 * integration for a specific report in the data provider.
 *
 * When executing the integration in a development environment, these values may
 * be provided in a `.env` file with environment variables. For example:
 *
 * - `CLIENT_ID=123` becomes `instance.config.clientId = '123'`
 * - `CLIENT_SECRET=abc` becomes `instance.config.clientSecret = 'abc'`
 *
 * Environment variables are NOT used when the integration is executing in a
 * managed environment. For example, in JupiterOne, users configure
 * `instance.config` in a UI.
 */
export const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  hackeroneProgramHandle: {
    type: 'string',
    mask: true,
  },
  hackeroneApiKeyName: {
    type: 'string',
    mask: false,
  },
  hackeroneApiKey: {
    type: 'string',
    mask: true,
  },
};

/**
 * Properties provided by the `IntegrationInstance.config`. This reflects the
 * same properties defined by `instanceConfigFields`.
 */
export interface IntegrationConfig extends IntegrationInstanceConfig {
  /**
   * The HackerOne program handle.
   */
  hackeroneProgramHandle: string;

  /**
   * The API key name used to authenticate requests.
   */
  hackeroneApiKeyName: string;

  /**
   * The API Key used to authenticate requests.
   */
  hackeroneApiKey: string;
}

export async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const config = context.instance.config as HackerOneIntegrationInstanceConfig;

  if (!config) {
    throw new IntegrationValidationError('Missing configuration');
  } else if (!config.hackeroneApiKey) {
    throw new IntegrationValidationError('Config requires hackeroneApiKey.');
  } else if (!config.hackeroneApiKeyName) {
    throw new IntegrationValidationError(
      'Config requires hackeroneApiKeyName.',
    );
  } else if (!config.hackeroneProgramHandle) {
    throw new IntegrationValidationError(
      'Config requires hackeroneProgramHandle.',
    );
  }

  const apiClient = createAPIClient(config);
  await apiClient.verifyAuthentication();
}
