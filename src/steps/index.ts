import { reportSteps } from './report';
import { programSteps } from './program';

const integrationSteps = [...reportSteps, ...programSteps];

export { integrationSteps };
