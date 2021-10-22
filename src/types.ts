// Providers often supply types with their API libraries.

export interface AcmeUser {
  id: string;
  name: string;
}

export interface AcmeGroup {
  id: string;
  name: string;
  users?: Pick<AcmeUser, 'id'>[];
}

export interface QueryResult {
  data: {
    data: Report[];
    links: { next?: string };
  };
}

export interface Report {
  id: string;
  type: string;
  attributes: ReportAttributes;
  // relationships: ReportRelationships;
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

// export interface ReportRelationships {
//   severity?: Severity;
//   weakness?: Weakness;
//   reporter: Reporter;
//   bounties: Bounties;
//   structured_scope?: StructuredScope;
// }
//
// export interface Severity {
//   data: {
//     attributes: {
//       rating: string;
//       score?: number | null;
//       attack_vector?: string;
//       attack_complexity?: string;
//       privileges_required?: string;
//       user_interaction?: string;
//       scope?: string | null;
//       confidentiality?: string;
//       integrity?: string;
//       availability?: string;
//     };
//   };
// }
//
// export interface Weakness {
//   id: string;
//   type?: string;
//   attributes: {
//     name: string;
//     description: string;
//     external_id?: string;
//     created_at: Date;
//   };
// }
//
// export interface Reporter {
//   data: {
//     attributes: {
//       username: string;
//       name: string;
//       profile_picture: {
//         "260x260": string;
//       };
//     };
//   };
// }
//
// export interface Bounties {
//   data: Bounty[];
// }
//
// export interface Bounty {
//   attributes: {
//     awarded_amount: number;
//     awarded_bonus_amount: number;
//     created_at: Date;
//   };
// }
//
// export interface StructuredScope {
//   data: {
//     attributes: {
//       asset_identifier: string;
//     };
//   };
// }
//
// export function toFindingEntity(report: Report): FindingEntity {
//   const attributes: ReportAttributes = report.attributes;
//   const relationships: ReportRelationships = report.relationships;
//
//   let details;
//   if (relationships.severity) {
//     const severity =
//       (relationships.severity.data && relationships.severity.data.attributes) ||
//       {};
//     details = {
//       severity: severity.rating,
//       score: severity.score,
//       scope: severity.scope,
//       numericSeverity: severity.score,
//       vector: severity.attack_vector,
//       complexity: severity.attack_complexity,
//       confidentiality: severity.confidentiality,
//       integrity: severity.integrity,
//       availability: severity.availability,
//       privileges: severity.privileges_required,
//       interaction: severity.user_interaction,
//     };
//   } else {
//     details = {
//       severity: "",
//       score: null,
//       scope: null,
//       numericSeverity: null,
//       vector: "",
//       complexity: "",
//       confidentiality: "",
//       integrity: "",
//       availability: "",
//       privileges: "",
//       interaction: "",
//     };
//   }
//
//   let bountyAmountAwarded;
//   let bountyBonusAmountAwarded;
//   let bountyAwardedAt;
//
//   const bounties =
//     (relationships.bounties && relationships.bounties.data) || [];
//   if (bounties.length >= 1) {
//     const bounty = (bounties[0] && bounties[0].attributes) || {};
//     bountyAmountAwarded = bounty.awarded_amount;
//     bountyBonusAmountAwarded = bounty.awarded_bonus_amount;
//     bountyAwardedAt = bounty.created_at;
//   } else {
//     bountyAmountAwarded = 0;
//     bountyBonusAmountAwarded = 0;
//     bountyAwardedAt = null;
//   }
//   const totalAmount =
//     Number(bountyAmountAwarded) + Number(bountyBonusAmountAwarded);
//
//   const scope = (relationships.structured_scope &&
//     relationships.structured_scope.data &&
//     relationships.structured_scope.data.attributes) || {
//     asset_identifier: null,
//   };
//   const target = scope.asset_identifier;
//
//   const reporter =
//     (relationships.reporter &&
//       relationships.reporter.data &&
//       relationships.reporter.data.attributes) ||
//     {};
//
//   return {
//     _class: "Finding",
//     _key: `hackerone-report-${report.id}`,
//     _type: HACKERONE_REPORT_ENTITY_TYPE,
//     id: report.id,
//     type: report.type,
//     title: attributes.title,
//     displayName: attributes.title,
//     details: attributes.vulnerability_information,
//     state: attributes.state,
//     open:
//       attributes.state === "new" ||
//       attributes.state === "triaged" ||
//       attributes.state === "needs-more-info",
//     createdOn: getTime(attributes.created_at),
//     disclosedOn: getTime(attributes.disclosed_at),
//     firstActivityAt: getTime(attributes.first_program_activity_at),
//     lastActivityAt: getTime(attributes.last_activity_at),
//     updatedOn: getTime(attributes.last_activity_at),
//     triagedOn: getTime(attributes.triaged_at),
//     closedOn: getTime(attributes.closed_at),
//     bountyAmount: bountyAmountAwarded,
//     bountyBonusAmount: bountyBonusAmountAwarded,
//     totalAmountAwarded: totalAmount,
//     bountyAwardedOn: getTime(bountyAwardedAt),
//     hackerAlias: reporter.username,
//     hackerProfilePic:
//       reporter.profile_picture && reporter.profile_picture["260x260"],
//     webLink: `https://hackerone.com/bugs?report_id=${report.id}`,
//     scope: details.scope,
//     targets: target,
//     ...details,
//   };
// }

// Those can be useful to a degree, but often they're just full of optional
// values. Understanding the response data may be more reliably accomplished by
// reviewing the API response recordings produced by testing the wrapper client
// (./client.ts). However, when there are no types provided, it is necessary to define
// opaque types for each resource, to communicate the records that are expected
// to come from an endpoint and are provided to iterating functions.

/*
import { Opaque } from 'type-fest';
export type AcmeUser = Opaque<any, 'AcmeUser'>;
export type AcmeGroup = Opaque<any, 'AcmeGroup'>;
*/
