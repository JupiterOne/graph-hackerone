export const HACKERONE_SERVICE_ENTITY_TYPE = "hackerone_program";
export const HACKERONE_REPORT_ENTITY_TYPE = "hackerone_report";
export const HACKERONE_SERVICE_FINDING_RELATIONSHIP_TYPE =
  "hackerone_program_reported_finding";
export const HACKERONE_FINDING_WEAKNESS_RELATIONSHIP_TYPE =
  "hackerone_finding_exploits_weakness";
export const HACKERONE_FINDING_VULNERABILITY_RELATIONSHIP_TYPE =
  "hackerone_finding_is_vulnerability";
export const HACKERONE_CLIENT_404_ERROR = "StatusCodeError: 404"; // TODO/HACK: Underlying library not re-throwing status codes correctly so this instead does a substring match to detect if a 404 (e.g., no direct access to err.errors[])
