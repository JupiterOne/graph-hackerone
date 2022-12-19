import {
  createIntegrationEntity,
  Entity,
} from '@jupiterone/integration-sdk-core';
import { Entities } from '../constants';

export function createProgramEntity(programHandle: string): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _key: `hackerone:${programHandle}`,
        _type: Entities.PROGRAM._type,
        _class: ['Service', 'Assessment'],
        name: `HackerOne Bounty Program for ${programHandle}`,
        displayName: `HackerOne Bounty Program for ${programHandle}`,
        summary: `HackerOne Bounty Program for ${programHandle}`,
        category: ['bug-bounty'],
        function: ['other'],
        handle: programHandle,
        internal: false,
      },
    },
  });
}
