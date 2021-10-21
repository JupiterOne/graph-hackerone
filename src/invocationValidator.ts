// TODO/Rick: Old file // keeping for debugging
// import HackeroneClient from "hackerone-client";
//
// import {
//   IntegrationInstanceAuthenticationError,
//   IntegrationInstanceConfigError,
//   IntegrationValidationContext,
// } from "@jupiterone/jupiter-managed-integration-sdk";
//
// import { HackerOneIntegrationInstanceConfig } from "./types";
//
// export default async function invocationValidator(
//   context: IntegrationValidationContext,
// ) {
//   const config = context.instance.config as HackerOneIntegrationInstanceConfig;
//
//   if (!config) {
//     throw new IntegrationInstanceConfigError("Missing configuration");
//   } else if (!config.hackeroneApiKey) {
//     throw new IntegrationInstanceConfigError("hackeroneApiKey is required");
//   } else if (!config.hackeroneApiKeyName) {
//     throw new IntegrationInstanceConfigError("hackeroneApiKeyName is required");
//   } else if (!config.hackeroneProgramHandle) {
//     throw new IntegrationInstanceConfigError(
//       "hackeroneProgramHandle is required",
//     );
//   }
//
//   const provider = new HackeroneClient(
//     config.hackeroneApiKey,
//     config.hackeroneApiKeyName,
//     config.hackeroneProgramHandle,
//   );
//   try {
//     await provider.verifyAccess();
//   } catch (err) {
//     throw new IntegrationInstanceAuthenticationError(err);
//   }
// }
