import {
  RelationshipClass,
  RelationshipDirection,
  StepEntityMetadata,
  StepMappedRelationshipMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const Steps = {
  PROGRAM: 'build-program',
  REPORTS: 'fetch-reports',
  PROGRAM_REPORTS_RELATIONSHIPS: 'build-program-reports-relationships',
};

export const Entities: Record<
  'PROGRAM' | 'REPORT' | 'CVE' | 'CWE',
  StepEntityMetadata
> = {
  PROGRAM: {
    resourceName: 'Service',
    _type: 'hackerone_program',
    _class: ['Service', 'Assessment'],
    schema: {
      properties: {
        displayName: { type: 'string' },
        category: { type: 'string' },
        handle: { type: 'string' },
      },
      required: ['category', 'handle'],
    },
  },
  REPORT: {
    resourceName: 'Finding',
    _type: 'hackerone_report',
    _class: ['Finding'],
  },
  CVE: {
    resourceName: 'CVE',
    _type: 'cve',
    _class: ['Vulnerability'],
    schema: {
      properties: {
        name: { type: 'string' },
        displayName: { type: 'string' },
        cvssScore: { type: 'string' },
        references: { type: 'array', items: { type: 'string' } },
        webLink: { type: 'string' },
      },
      required: ['name', 'displayName', 'cvssScore', 'references', 'weblink'],
    },
  },
  CWE: {
    resourceName: 'CWE',
    _type: 'cwe',
    _class: ['Weakness'],
  },
};

export const Relationships: Record<
  'PROGRAM_REPORTED_FINDING',
  StepRelationshipMetadata
> = {
  PROGRAM_REPORTED_FINDING: {
    _type: 'hackerone_program_reported_finding',
    sourceType: Entities.PROGRAM._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.REPORT._type,
  },
};

export const MappedRelationships: Record<
  'FINDING_EXPLOITS_WEAKNESS' | 'FINDING_IS_VULNERABILITY',
  StepMappedRelationshipMetadata
> = {
  FINDING_EXPLOITS_WEAKNESS: {
    _type: 'hackerone_finding_exploits_weakness',
    sourceType: Entities.REPORT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.CWE._type,
    direction: RelationshipDirection.FORWARD,
  },
  FINDING_IS_VULNERABILITY: {
    _type: 'hackerone_finding_is_vulnerability',
    sourceType: Entities.REPORT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.CVE._type,
    direction: RelationshipDirection.FORWARD,
  },
};
