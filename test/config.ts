import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import { StepTestConfig } from '@jupiterone/integration-sdk-testing';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { invocationConfig } from '../src';
import { IntegrationConfig } from '../src/config';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}
const DEFAULT_HACKERONE_PROGRAM_HANDLE = 'program-handle';
const DEFAULT_HACKERONE_API_KEY_NAME = 'dummy-acme-client-id';
const DEFAULT_HACKERONE_API_KEY = 'dummy-acme-client-secret';

export const integrationConfig: IntegrationConfig = {
  hackeroneProgramHandle:
    process.env.HACKERONE_PROGRAM_HANDLE || DEFAULT_HACKERONE_PROGRAM_HANDLE,
  hackeroneApiKeyName:
    process.env.HACKERONE_API_KEY_NAME || DEFAULT_HACKERONE_API_KEY_NAME,
  hackeroneApiKey: process.env.HACKERONE_API_KEY || DEFAULT_HACKERONE_API_KEY,
};

export function buildStepTestConfigForStep(stepId: string): StepTestConfig {
  return {
    stepId,
    instanceConfig: integrationConfig,
    invocationConfig: invocationConfig as IntegrationInvocationConfig,
  };
}
