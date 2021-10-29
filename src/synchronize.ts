import HackeroneClient from "hackerone-client";

import {
  IntegrationExecutionContext,
  PersisterOperationsResult,
} from "@jupiterone/jupiter-managed-integration-sdk";

import {
  HACKERONE_CLIENT_404_ERROR,
  HACKERONE_SERVICE_ENTITY_TYPE,
} from "./constants";
import {
  Report,
  toFindingEntity,
  toServiceFindingRelationship,
  toVulnerabilityEntity,
  toVulnerabilityRelationship,
  toWeaknessEntity,
  toWeaknessRelationship,
} from "./converters";
import { createOperationsFromFindings } from "./createOperations";
import logger from "./logger";
import {
  FindingEntity,
  FindingVulnerabilityRelationship,
  FindingWeaknessRelationship,
  HackerOneIntegrationInstanceConfig,
  ServiceEntity,
  ServiceFindingRelationship,
} from "./types";

export default async function synchronize(
  context: IntegrationExecutionContext,
): Promise<PersisterOperationsResult> {
  const { persister } = context.clients.getClients();

  const config = context.instance.config as HackerOneIntegrationInstanceConfig;
  const Hackerone = new HackeroneClient(
    config.hackeroneApiKey,
    config.hackeroneApiKeyName,
  );

  const service: ServiceEntity = {
    _key: `hackerone:${config.hackeroneProgramHandle}`,
    _type: HACKERONE_SERVICE_ENTITY_TYPE,
    _class: ["Service", "Assessment"],
    displayName: `HackerOne Bounty Program for ${config.hackeroneProgramHandle}`,
    category: "bug-bounty",
    handle: config.hackeroneProgramHandle,
  };
  const programInfo = {
    displayName: service.displayName,
    handle: config.hackeroneProgramHandle,
    category: service.category,
  };
  const serviceFindingRelationships: ServiceFindingRelationship[] = [];
  const findingVulnerabilityRelationships: FindingVulnerabilityRelationship[] = [];
  const findingWeaknessRelationships: FindingWeaknessRelationship[] = [];
  const serviceEntities: ServiceEntity[] = [service];
  const findingEntities: FindingEntity[] = [];

  let reports: Report[][] = [];
  try {
    reports = await Hackerone.queryReports(config.hackeroneProgramHandle);
  } catch (err) {
    let errMsg: string = err.message;
    if (errMsg.includes(HACKERONE_CLIENT_404_ERROR)) {
      errMsg =
        "No reports found using that program *handle* (the program handle is different than the program display name --> verify this value from either the H1 program URL or Edit Page screen)";
      logger.error(errMsg);
    }

    throw new Error(errMsg);
  }

  logger.info(programInfo, "Found reports using program info");

  for (const reportCollection of reports) {
    for (const report of reportCollection) {
      const finding = toFindingEntity(report);
      findingEntities.push(finding);
      serviceFindingRelationships.push(
        toServiceFindingRelationship(service, finding),
      );
      for (const cveId of report.attributes.cve_ids || []) {
        const vuln = toVulnerabilityEntity(cveId);
        if (vuln) {
          findingVulnerabilityRelationships.push(
            toVulnerabilityRelationship(finding, vuln),
          );
        }
      }
      if (report.relationships.weakness) {
        const weakness = toWeaknessEntity(report.relationships.weakness);
        if (weakness) {
          findingWeaknessRelationships.push(
            toWeaknessRelationship(finding, weakness),
          );
        }
      }
    }
  }

  return persister.publishPersisterOperations(
    await createOperationsFromFindings(
      context,
      serviceEntities,
      findingEntities,
      serviceFindingRelationships,
      findingVulnerabilityRelationships,
      findingWeaknessRelationships,
    ),
  );
}
