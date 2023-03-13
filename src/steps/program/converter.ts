import {
  createIntegrationEntity,
  Entity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { HackerOneProgram } from '../../types';
import { Entities } from '../constants';

export function createProgramEntity(data: HackerOneProgram): Entity {
  const programHandle = data.attributes.handle;
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: `hackerone:${programHandle}`,
        _type: Entities.PROGRAM._type,
        _class: Entities.PROGRAM._class,
        id: data.id,
        name: `HackerOne Bounty Program for ${programHandle}`,
        displayName: `HackerOne Bounty Program for ${programHandle}`,
        summary: `HackerOne Bounty Program for ${programHandle}`,
        category: 'bug-bounty',
        function: ['other'],
        handle: programHandle,
        internal: false,
        policy: data.attributes.policy,
        createdOn: parseTimePropertyValue(data.attributes.created_at),
        updatedOn: parseTimePropertyValue(data.attributes.updated_at),
      },
    },
  });
}
