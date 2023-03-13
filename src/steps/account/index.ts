import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../../config';
import { ACCOUNT_ENTITY_KEY, Entities, Steps } from '../constants';
import { createAccountEntity } from './converter';

export async function fetchAccount({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const accountEntity = await jobState.addEntity(createAccountEntity(instance));

  await jobState.setData(ACCOUNT_ENTITY_KEY, accountEntity);
}

export const accountSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.ACCOUNT,
    name: 'Fetch Account',
    entities: [Entities.ACCOUNT],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchAccount,
  },
];
