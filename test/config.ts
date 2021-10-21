import * as dotenv from 'dotenv';
import * as path from 'path';
import { IntegrationConfig } from '../src/config';

if (process.env.LOAD_ENV) {
  dotenv.config({
    path: path.join(__dirname, '../.env'),
  });
}

const DEFAULT_HACKERONE_API_KEY = 'dummy-hackerone-api-key';
const DEFAULT_HACKERONE_API_KEY_NAME = 'dummy-hackerone-api-key-name';
const DEFAULT_HACKERONE_PROGRAM_HANDLE = 'dummy-hackerone-program-handle';

export const integrationConfig: IntegrationConfig = {
  hackeroneApiKeyName:
    process.env.DEFAULT_HACKERONE_API_KEY_NAME ||
    DEFAULT_HACKERONE_API_KEY_NAME,
  hackeroneApiKey:
    process.env.DEFAULT_HACKERONE_API_KEY || DEFAULT_HACKERONE_API_KEY,
  hackeroneProgramHandle:
    process.env.HACKERONE_PROGRAM_HANDLE || DEFAULT_HACKERONE_PROGRAM_HANDLE,
};
