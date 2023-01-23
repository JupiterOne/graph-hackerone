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
import { createOrganizationEntity } from './converter';

export async function fetchOrganization({
  instance,
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const apiClient = createAPIClient(instance.config);
  const accountEntity = (await jobState.getData(ACCOUNT_ENTITY_KEY)) as Entity;

  await apiClient.fetchOrganization(async (organization) => {
    const organizationEntity = await jobState.addEntity(
      createOrganizationEntity(organization),
    );

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        from: accountEntity,
        to: organizationEntity,
      }),
    );
  });
}

export const organizationSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.ORGANIZATION,
    name: 'Fetch Organization',
    entities: [Entities.ORGANIZATION],
    relationships: [Relationships.ACCOUNT_HAS_ORGANIZATION],
    dependsOn: [Steps.ACCOUNT],
    executionHandler: fetchOrganization,
  },
];
