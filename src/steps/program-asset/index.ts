import {
  createDirectRelationship,
  Entity,
  getRawData,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { createAPIClient } from '../../client';
import { IntegrationConfig } from '../../config';
import { HackerOneProgram } from '../../types';
import {
  ACCOUNT_ENTITY_KEY,
  Entities,
  Relationships,
  Steps,
} from '../constants';
import { createProgramAsset } from './converter';

export async function fetchProgramAssets({
  instance,
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);
  const accountEntity = (await jobState.getData(ACCOUNT_ENTITY_KEY)) as Entity;

  await jobState.iterateEntities(
    { _type: Entities.PROGRAM._type },
    async (programEntity) => {
      const program = getRawData<HackerOneProgram>(programEntity);

      if (!program) {
        logger.warn(
          `Can not get raw data for program entity ${programEntity._key}`,
        );
        return;
      }

      await apiClient.iterateProgramAsset(
        program.id,
        async (structuredScope) => {
          const assetEntity = await jobState.addEntity(
            createProgramAsset(structuredScope),
          );

          await jobState.addRelationships([
            createDirectRelationship({
              _class: RelationshipClass.SCANS,
              from: programEntity,
              to: assetEntity,
            }),
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              from: accountEntity,
              to: assetEntity,
            }),
          ]);
        },
      );
    },
  );
}

export const programAssetSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.PROGRAM_ASSETS,
    name: 'Fetch Program Assets',
    entities: [Entities.PROGRAM_ASSET],
    relationships: [
      Relationships.PROGRAM_SCANS_PROGRAM_ASSET,
      Relationships.ACCOUNT_HAS_PROGRAM_ASSET,
    ],
    dependsOn: [Steps.PROGRAMS],
    executionHandler: fetchProgramAssets,
  },
];
