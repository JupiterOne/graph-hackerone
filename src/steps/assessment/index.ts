import {
  createDirectRelationship,
  getRawData,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../../config';
import { HackerOneProgram } from '../../types';
import { Entities, Relationships, Steps } from '../constants';
import { createAssessmentEntity } from './converter';

export async function fetchAssessments({
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  await jobState.iterateEntities(
    { _type: Entities.PROGRAM._type },
    async (programEntity) => {
      const program = getRawData<HackerOneProgram>(programEntity);

      if (!program) {
        logger.warn(`Can not get raw data for entity ${programEntity._key}`);
        return;
      }

      const assessmentEntity = await jobState.addEntity(
        createAssessmentEntity(program.attributes.handle),
      );
      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.PERFORMED,
          from: programEntity,
          to: assessmentEntity,
        }),
      );
    },
  );
}

export const assessmentSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.ASSESSMENT,
    name: 'Fetch Assessments',
    entities: [Entities.ASSESSMENT],
    relationships: [Relationships.PROGRAM_PERFORMED_ASSESSMENT],
    dependsOn: [Steps.PROGRAMS],
    executionHandler: fetchAssessments,
  },
];
