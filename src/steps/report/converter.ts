import {
  createMappedRelationship,
  parseTimePropertyValue,
  Relationship,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';

import { Entities, MappedRelationships, Relationships } from '../constants';
import {
  AttackEntity,
  FindingEntity,
  FindingWeaknessRelationship,
  ProgramEntity,
  Report,
  ReportAttributes,
  ReportRelationships,
  ServiceFindingRelationship,
  VulnerabilityEntity,
  Weakness,
  WeaknessEntity,
} from '../../types';

export function createFindingEntity(report: Report): FindingEntity {
  const attributes: ReportAttributes = report.attributes;
  const relationships: ReportRelationships = report.relationships;

  let details;
  if (relationships.severity) {
    const severity =
      (relationships.severity.data && relationships.severity.data.attributes) ||
      {};
    details = {
      severity: severity.rating,
      score: severity.score ?? 0,
      scope: severity.scope,
      numericSeverity: severity.score ?? 0,
      vector: severity.attack_vector,
      complexity: severity.attack_complexity,
      confidentiality: severity.confidentiality,
      integrity: severity.integrity,
      availability: severity.availability,
      privileges: severity.privileges_required,
      interaction: severity.user_interaction,
    };
  } else {
    details = {
      severity: '',
      score: 0,
      scope: null,
      numericSeverity: 0,
      vector: '',
      complexity: '',
      confidentiality: '',
      integrity: '',
      availability: '',
      privileges: '',
      interaction: '',
    };
  }

  let bountyAmountAwarded;
  let bountyBonusAmountAwarded;
  let bountyAwardedAt;

  const bounties =
    (relationships.bounties && relationships.bounties.data) || [];
  if (bounties.length >= 1) {
    const bounty = (bounties[0] && bounties[0].attributes) || {};
    bountyAmountAwarded = bounty.awarded_amount;
    bountyBonusAmountAwarded = bounty.awarded_bonus_amount;
    bountyAwardedAt = bounty.created_at;
  } else {
    bountyAmountAwarded = 0;
    bountyBonusAmountAwarded = 0;
    bountyAwardedAt = null;
  }
  const totalAmount =
    Number(bountyAmountAwarded) + Number(bountyBonusAmountAwarded);

  const scope = (relationships.structured_scope &&
    relationships.structured_scope.data &&
    relationships.structured_scope.data.attributes) || {
    asset_identifier: null,
  };
  const target = scope.asset_identifier;

  const reporter =
    (relationships.reporter &&
      relationships.reporter.data &&
      relationships.reporter.data.attributes) ||
    {};

  return {
    _class: Entities.REPORT._class,
    _key: `hackerone-report-${report.id}`,
    _type: Entities.REPORT._type,
    id: report.id,
    type: report.type,
    title: attributes.title,
    name: attributes.title,
    category: 'other',
    displayName: attributes.title,
    details: attributes.vulnerability_information,
    state: attributes.state,
    open:
      attributes.state === 'new' ||
      attributes.state === 'triaged' ||
      attributes.state === 'needs-more-info',
    createdOn: parseTimePropertyValue(attributes.created_at),
    disclosedOn: parseTimePropertyValue(attributes.disclosed_at),
    firstActivityAt: parseTimePropertyValue(
      attributes.first_program_activity_at,
    ),
    lastActivityAt: parseTimePropertyValue(attributes.last_activity_at),
    updatedOn: parseTimePropertyValue(attributes.last_activity_at),
    triagedOn: parseTimePropertyValue(attributes.triaged_at),
    closedOn: parseTimePropertyValue(attributes.closed_at),
    bountyAmount: bountyAmountAwarded,
    bountyBonusAmount: bountyBonusAmountAwarded,
    totalAmountAwarded: totalAmount,
    bountyAwardedOn: parseTimePropertyValue(bountyAwardedAt),
    hackerAlias: reporter.username,
    hackerProfilePic:
      reporter.profile_picture && reporter.profile_picture['260x260'],
    webLink: `https://hackerone.com/bugs?report_id=${report.id}`,
    scope: details.scope,
    targets: [target],
    ...details,
  };
}

export function createProgramReportedFindingRelationship(
  program: ProgramEntity,
  finding: FindingEntity,
): ServiceFindingRelationship {
  return {
    _class: RelationshipClass.IDENTIFIED,
    _key: `${program._key}|identified|${finding._key}`,
    _type: Relationships.PROGRAM_REPORTED_FINDING._type,
    _fromEntityKey: program._key,
    _toEntityKey: finding._key,
    displayName: 'IDENTIFIED',
  };
}

export function createVulnerabilityEntity(
  cveId: string,
): VulnerabilityEntity | undefined {
  if (!cveId.toLowerCase().startsWith('cve-')) {
    return undefined;
  }
  return {
    _key: cveId.toLowerCase(),
    _type: 'cve',
    _class: 'Vulnerability',
    displayName: cveId.toUpperCase(),
    webLink: `https://nvd.nist.gov/vuln/detail/${cveId}`,
  };
}

export function createFindingToVulnRelationship(
  finding: FindingEntity,
  targetEntity,
): Relationship {
  return createMappedRelationship({
    source: finding,
    _key: `${finding._key}|is|${targetEntity._key}`,
    _type: MappedRelationships.FINDING_IS_VULNERABILITY._type,
    _class: RelationshipClass.IS,
    target: targetEntity,
    targetFilterKeys: [['_type', '_key']],
    relationshipDirection: RelationshipDirection.FORWARD,
    skipTargetCreation: false,
  });
}

export function createWeaknessEntity(
  weakness: Weakness,
): WeaknessEntity | AttackEntity | undefined {
  const attributes = weakness.attributes;
  if (attributes && attributes.external_id) {
    const id = attributes.external_id.toLowerCase();
    if (id.startsWith('cwe-')) {
      return {
        _key: id,
        _type: 'cwe',
        _class: 'Weakness',
        name: attributes.name,
        displayName: id.toUpperCase(),
        description: attributes.description,
        webLink: `https://cwe.mitre.org/data/definitions/${
          id.split('-')[1]
        }.html`,
      };
    } else if (id.startsWith('capec-')) {
      return {
        _key: id,
        _type: 'capec',
        _class: 'Attack',
        name: attributes.name,
        displayName: id.toUpperCase(),
        description: attributes.description,
        webLink: `https://capec.mitre.org/data/definitions/${
          id.split('-')[1]
        }.html`,
      };
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

export function createFindingWeaknessRelationship(
  finding: FindingEntity,
  targetEntity,
): FindingWeaknessRelationship {
  return createMappedRelationship({
    source: finding,
    _key: `${finding._key}|exploits|${targetEntity._key}`,
    _class: RelationshipClass.EXPLOITS,
    _type: MappedRelationships.FINDING_EXPLOITS_WEAKNESS._type,
    target: targetEntity,
    targetFilterKeys: [['_type', '_key']],
    relationshipDirection: RelationshipDirection.FORWARD,
    skipTargetCreation: false,
  });
}
