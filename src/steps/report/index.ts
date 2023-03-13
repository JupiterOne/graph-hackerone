import {
  createDirectRelationship,
  getRawData,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
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
import { FindingEntity, HackerOneProgram } from '../../types';
import { getProgramAssetKey } from '../program-asset/converter';

export async function fetchReports({
  jobState,
  logger,
  instance,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const { config } = instance;
  const apiClient = createAPIClient(config);

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

      await apiClient.iterateReports(
        program.attributes.handle,
        async (report) => {
          const findingEntity = (await jobState.addEntity(
            createFindingEntity(report),
          )) as FindingEntity;

          await jobState.addRelationship(
            createProgramReportedFindingRelationship(
              programEntity,
              findingEntity,
            ),
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
                createFindingWeaknessRelationship(
                  findingEntity,
                  weaknessEntity,
                ),
              );
            }
          }
        },
      );
    },
  );
}

export async function buildFindingAssetRelationships({
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  await jobState.iterateEntities(
    { _type: Entities.REPORT._type },
    async (findingEntity: FindingEntity) => {
      const structuredScopeId = findingEntity.structuredScopeId;
      const programAssetEntity = structuredScopeId
        ? await jobState.findEntity(getProgramAssetKey(structuredScopeId))
        : undefined;

      if (programAssetEntity) {
        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: programAssetEntity,
            to: findingEntity,
          }),
        );
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
    dependsOn: [Steps.PROGRAMS, Steps.PROGRAM_ASSETS],
    executionHandler: fetchReports,
  },
  {
    id: Steps.PROGRAM_ASSETS_REPORTS_RELATIONSHIPS,
    name: 'Build Program Assets and Reports Relationships',
    entities: [],
    relationships: [Relationships.PROGRAM_ASSET_HAS_FINDING],
    dependsOn: [Steps.REPORTS, Steps.PROGRAM_ASSETS],
    executionHandler: buildFindingAssetRelationships,
  },
];
