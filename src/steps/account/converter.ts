import {
  createIntegrationEntity,
  Entity,
  IntegrationInstance,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from '../../config';
import { Entities } from '../constants';

export function createAccountEntity(
  data: IntegrationInstance<IntegrationConfig>,
): Entity {
  const { config, ...rest } = data;
  return createIntegrationEntity({
    entityData: {
      source: rest,
      assign: {
        _key: `hackerone_account`,
        _type: Entities.ACCOUNT._type,
        _class: Entities.ACCOUNT._class,
        name: data.name,
        id: data.id,
        program: data.config.hackeroneProgramHandle,
      },
    },
  });
}
