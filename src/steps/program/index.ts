import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../../config';
import { Entities, Steps } from '../constants';
import { createProgramEntity } from './converter';

export const PROGRAM_ENTITY_KEY = 'entity:program';

export async function buildProgram({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const accountEntity = await jobState.addEntity(
    createProgramEntity(instance.config.hackeroneProgramHandle),
  );

  await jobState.setData(PROGRAM_ENTITY_KEY, accountEntity);
}

export const programSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.PROGRAM,
    name: 'Build Program',
    entities: [Entities.PROGRAM],
    relationships: [],
    dependsOn: [],
    executionHandler: buildProgram,
  },
];
