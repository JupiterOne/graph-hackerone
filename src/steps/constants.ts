import {
  RelationshipClass,
  RelationshipDirection,
  StepEntityMetadata,
  StepMappedRelationshipMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const ACCOUNT_ENTITY_KEY = 'entity:account';

export const Steps = {
  ACCOUNT: 'fetch-account',
  ORGANIZATION: 'fetch-organization',
  PROGRAMS: 'build-programs',
  SERVICE: 'fetch-service',
  ASSESSMENT: 'fetch-assessments',
  PROGRAM_ASSETS: 'fetch-program-assets',
  REPORTS: 'fetch-reports',
  PROGRAM_ASSETS_REPORTS_RELATIONSHIPS:
    'build-program-assets-reports-relationships',
};

export const Entities: Record<
  | 'ACCOUNT'
  | 'PROGRAM'
  | 'PROGRAM_ASSET'
  | 'ORGANIZATION'
  | 'ASSESSMENT'
  | 'REPORT'
  | 'CVE'
  | 'CWE',
  StepEntityMetadata
> = {
  ACCOUNT: {
    resourceName: 'Account',
    _type: 'hackerone_account',
    _class: ['Account'],
  },
  ORGANIZATION: {
    resourceName: 'Organization',
    _type: 'hackerone_organization',
    _class: ['Organization'],
  },
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
  PROGRAM_ASSET: {
    resourceName: 'Program Asset',
    _type: 'hackerone_program_asset',
    _class: ['Entity'], // TBD: A better fitting class
  },
  ASSESSMENT: {
    resourceName: 'Assessment',
    _type: 'hackerone_assessment',
    _class: ['Assessment'],
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
  | 'PROGRAM_REPORTED_FINDING'
  | 'PROGRAM_PERFORMED_ASSESSMENT'
  | 'PROGRAM_SCANS_PROGRAM_ASSET'
  | 'ACCOUNT_HAS_ORGANIZATION'
  | 'ACCOUNT_HAS_PROGRAM_ASSET'
  | 'ACCOUNT_HAS_PROGRAM'
  | 'PROGRAM_ASSET_HAS_FINDING'
  | 'ORGANIZATION_HAS_PROGRAM',
  StepRelationshipMetadata
> = {
  PROGRAM_REPORTED_FINDING: {
    _type: 'hackerone_program_reported_finding',
    sourceType: Entities.PROGRAM._type,
    _class: RelationshipClass.IDENTIFIED,
    targetType: Entities.REPORT._type,
  },
  ACCOUNT_HAS_ORGANIZATION: {
    _type: 'hackerone_account_has_organization',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.ORGANIZATION._type,
  },
  ACCOUNT_HAS_PROGRAM_ASSET: {
    _type: 'hackerone_account_has_program_asset',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.PROGRAM_ASSET._type,
  },
  ACCOUNT_HAS_PROGRAM: {
    _type: 'hackerone_account_has_program',
    sourceType: Entities.ACCOUNT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.PROGRAM._type,
  },
  ORGANIZATION_HAS_PROGRAM: {
    _type: 'hackerone_organization_has_program',
    sourceType: Entities.ORGANIZATION._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.PROGRAM._type,
  },
  PROGRAM_PERFORMED_ASSESSMENT: {
    _type: 'hackerone_program_performed_assessment',
    sourceType: Entities.PROGRAM._type,
    _class: RelationshipClass.PERFORMED,
    targetType: Entities.ASSESSMENT._type,
  },
  PROGRAM_SCANS_PROGRAM_ASSET: {
    _type: 'hackerone_program_scans_asset',
    sourceType: Entities.PROGRAM._type,
    _class: RelationshipClass.SCANS,
    targetType: Entities.PROGRAM_ASSET._type,
  },
  PROGRAM_ASSET_HAS_FINDING: {
    _type: 'hackerone_program_asset_has_report',
    sourceType: Entities.PROGRAM_ASSET._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.REPORT._type,
  },
};

export const MappedRelationships: Record<
  'FINDING_EXPLOITS_WEAKNESS' | 'FINDING_IS_VULNERABILITY',
  StepMappedRelationshipMetadata
> = {
  FINDING_EXPLOITS_WEAKNESS: {
    _type: 'hackerone_report_exploits_weakness',
    sourceType: Entities.REPORT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.CWE._type,
    direction: RelationshipDirection.FORWARD,
  },
  FINDING_IS_VULNERABILITY: {
    _type: 'hackerone_report_is_vulnerability',
    sourceType: Entities.REPORT._type,
    _class: RelationshipClass.HAS,
    targetType: Entities.CVE._type,
    direction: RelationshipDirection.FORWARD,
  },
};
