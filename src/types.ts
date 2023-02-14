import { Entity, Relationship } from '@jupiterone/integration-sdk-core';

export interface ProgramEntity extends Entity {
  category: string;
  handle: string;
}

export interface FindingEntity extends Entity {
  state: string;
  details: string;
  title: string;
  id: string;
  type: string;
  open: boolean;
  createdOn?: number;
  disclosedOn?: number;
  firstActivityAt?: number;
  lastActivityAt?: number;
  updatedOn?: number;
  triagedOn?: number;
  closedOn?: number;
  severity?: string;
  score?: number | null;
  numericSeverity?: number | null;
  scope?: string | null;
  targets?: string | string[] | null;
  vector?: string;
  complexity?: string;
  confidentiality?: string;
  integrity?: string;
  availability?: string;
  privileges?: string;
  interaction?: string;
  bountyAmount?: number;
  bountyBonusAmount?: number;
  bountyAwardedOn?: number;
  totalAmountAwarded?: number;
  hackerAlias: string;
  hackerProfilePic?: string;
  structuredScopeId?: string;
}

export interface VulnerabilityEntity extends Entity {
  name?: string;
  description?: string;
}

export interface WeaknessEntity extends Entity {
  name: string;
  description: string;
}

export interface AttackEntity extends Entity {
  name: string;
  description: string;
}

export type ServiceFindingRelationship = Relationship;

export type FindingVulnerabilityRelationship = Relationship;

export type FindingWeaknessRelationship = Relationship;

export interface HackerOneIntegrationInstanceConfig {
  hackeroneApiKey: string;
  hackeroneApiKeyName: string;
  hackeroneProgramHandle: string;
}

export interface Program {
  name: string;
}

export interface Report {
  id: string;
  type: string;
  attributes: ReportAttributes;
  relationships: ReportRelationships;
}

export interface ReportAttributes {
  title: string;
  vulnerability_information: string;
  state: string;
  created_at: Date | null;
  disclosed_at: Date | null;
  first_program_activity_at: Date | null;
  last_activity_at: Date | null;
  triaged_at: Date | null;
  closed_at: Date | null;
  cve_ids?: string[];
}

export interface ReportRelationships {
  severity?: Severity;
  weakness?: Weakness;
  reporter: Reporter;
  bounties: Bounties;
  structured_scope?: StructuredScope;
}

export interface Severity {
  data: {
    attributes: {
      rating: string;
      score?: number | null;
      attack_vector?: string;
      attack_complexity?: string;
      privileges_required?: string;
      user_interaction?: string;
      scope?: string | null;
      confidentiality?: string;
      integrity?: string;
      availability?: string;
    };
  };
}

export interface Weakness {
  id: string;
  type?: string;
  attributes: {
    name: string;
    description: string;
    external_id?: string;
    created_at: Date;
  };
}

export interface Reporter {
  data: {
    attributes: {
      username: string;
      name: string;
      profile_picture: {
        '260x260': string;
      };
    };
  };
}

export interface Bounties {
  data: Bounty[];
}

export interface Bounty {
  attributes: {
    awarded_amount: number;
    awarded_bonus_amount: number;
    created_at: Date;
  };
}

export interface StructuredScope {
  data: {
    id: string;
    attributes: {
      asset_identifier: string;
    };
  };
}

export interface HackerOneOrganization {
  id: string;
  type: string;
  attributes: {
    handle: string;
    created_at: string;
    updated_at: string;
  };
}

export interface HackerOneProgram {
  id: string;
  type: string;
  attributes: {
    handle: string;
    policy: string;
    created_at: string;
    updated_at: string;
  };
}

export interface HackerOneStructuredScope {
  id: string;
  type: string;
  attributes: {
    asset_type: string;
    asset_identifier: string;
    eligible_for_bounty: boolean;
    eligible_for_submission: boolean;
    instruction: string;
    max_severity: string;
    created_at: string;
    updated_at: string;
    reference: string;
  };
}
