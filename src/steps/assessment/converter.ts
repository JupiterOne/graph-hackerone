import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { Entities } from '../constants';

export function createAssessmentEntity(programHandle: string): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _key: `hackerone_assessment:${programHandle}`,
        _type: Entities.ASSESSMENT._type,
        _class: Entities.ASSESSMENT._class,
        name: programHandle,
        category: 'bug-bounty',
        summary: `HackerOne Bounty Program for ${programHandle}`,
        internal: false,
      },
    },
  });
}
