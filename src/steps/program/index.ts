import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { createAPIClient } from '../../client';

import { IntegrationConfig } from '../../config';
import {
  ACCOUNT_ENTITY_KEY,
  Entities,
  Relationships,
  Steps,
} from '../constants';
import { createProgramEntity } from './converter';

export async function fetchPrograms({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);
  const accountEntity = (await jobState.getData(ACCOUNT_ENTITY_KEY)) as Entity;

  await jobState.iterateEntities(
    { _type: Entities.ORGANIZATION._type },
    async (organizationEntity) => {
      await apiClient.iteratePrograms(async (program) => {
        const programEntity = await jobState.addEntity(
          createProgramEntity(program),
        );

        await jobState.addRelationships([
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: organizationEntity,
            to: programEntity,
          }),
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: accountEntity,
            to: programEntity,
          }),
        ]);
      });
    },
  );
}

export const programSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.PROGRAMS,
    name: 'Build Programs',
    entities: [Entities.PROGRAM],
    relationships: [
      Relationships.ORGANIZATION_HAS_PROGRAM,
      Relationships.ACCOUNT_HAS_PROGRAM,
    ],
    dependsOn: [Steps.ORGANIZATION],
    executionHandler: fetchPrograms,
  },
];
