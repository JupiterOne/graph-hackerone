import {
  createIntegrationEntity,
  Entity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { HackerOneOrganization } from '../../types';
import { Entities } from '../constants';

export function createOrganizationEntity(data: HackerOneOrganization): Entity {
  return createIntegrationEntity({
    entityData: {
      source: {},
      assign: {
        _key: `hackerone_organization:${data.id}`,
        _type: Entities.ORGANIZATION._type,
        _class: Entities.ORGANIZATION._class,
        id: data.id,
        type: data.type,
        name: data.attributes.handle,
        handle: data.attributes.handle,
        createdOn: parseTimePropertyValue(data.attributes.created_at),
        updatedOn: parseTimePropertyValue(data.attributes.updated_at),
      },
    },
  });
}
