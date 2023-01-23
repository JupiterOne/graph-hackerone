import {
  createIntegrationEntity,
  Entity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { HackerOneStructuredScope } from '../../types';
import { Entities } from '../constants';

export function getProgramAssetKey(id: string) {
  return `hackerone_asset:${id}`;
}

export function createProgramAsset(data: HackerOneStructuredScope): Entity {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: getProgramAssetKey(data.id),
        _type: Entities.PROGRAM_ASSET._type,
        _class: Entities.PROGRAM_ASSET._class,
        id: data.id,
        type: data.type,
        name: data.attributes.asset_identifier,
        assetType: data.attributes.asset_type,
        assetIdentifier: data.attributes.asset_identifier,
        eligibleForBounty: data.attributes.eligible_for_bounty,
        eligibleForSubmission: data.attributes.eligible_for_submission,
        instruction: data.attributes.instruction,
        maxSeverity: data.attributes.max_severity,
        createdOn: parseTimePropertyValue(data.attributes.created_at),
        updatedOn: parseTimePropertyValue(data.attributes.updated_at),
        reference: data.attributes.reference,
      },
    },
  });
}
