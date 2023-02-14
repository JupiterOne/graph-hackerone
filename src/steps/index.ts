import { accountSteps } from './account';
import { assessmentSteps } from './assessment';
import { organizationSteps } from './organization';
import { programSteps } from './program';
import { programAssetSteps } from './program-asset';
import { reportSteps } from './report';

const integrationSteps = [
  ...accountSteps,
  ...organizationSteps,
  ...programSteps,
  ...programAssetSteps,
  ...reportSteps,
  ...assessmentSteps,
];

export { integrationSteps };
