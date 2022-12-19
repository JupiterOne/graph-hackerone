import {
  IntegrationStep,
  IntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-core';

import { IntegrationConfig } from '../../config';
import {
  Steps,
  Entities,
  Relationships,
  MappedRelationships,
} from '../constants';
import {
  createFindingEntity,
  createFindingToVulnRelationship,
  createFindingWeaknessRelationship,
  createProgramReportedFindingRelationship,
  createVulnerabilityEntity,
  createWeaknessEntity,
} from './converter';
import { createAPIClient } from '../../client';
import { PROGRAM_ENTITY_KEY } from '../program';
import { FindingEntity, ProgramEntity } from '../../types';

export async function fetchReports({
  jobState,
  instance,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const { config } = instance;
  const apiClient = createAPIClient(config);

  await apiClient.iterateReports(
    config.hackeroneProgramHandle,
    async (report) => {
      const findingEntity = (await jobState.addEntity(
        createFindingEntity(report),
      )) as FindingEntity;

      const programEntity = (await jobState.getData(
        PROGRAM_ENTITY_KEY,
      )) as ProgramEntity;

      await jobState.addRelationship(
        createProgramReportedFindingRelationship(programEntity, findingEntity),
      );

      for (const cveId of report.attributes.cve_ids || []) {
        const vuln = createVulnerabilityEntity(cveId);
        if (vuln) {
          await jobState.addRelationship(
            createFindingToVulnRelationship(findingEntity, vuln),
          );
        }
      }

      if (report.relationships.weakness) {
        const weaknessEntity = createWeaknessEntity(
          report.relationships.weakness,
        );
        if (weaknessEntity) {
          await jobState.addRelationship(
            createFindingWeaknessRelationship(findingEntity, weaknessEntity),
          );
        }
      }
    },
  );
}

export const reportSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: Steps.REPORTS,
    name: 'Fetch Reports',
    entities: [Entities.REPORT],
    relationships: [Relationships.PROGRAM_REPORTED_FINDING],
    mappedRelationships: [
      MappedRelationships.FINDING_EXPLOITS_WEAKNESS,
      MappedRelationships.FINDING_IS_VULNERABILITY,
    ],
    dependsOn: [Steps.PROGRAM],
    executionHandler: fetchReports,
  },
];
