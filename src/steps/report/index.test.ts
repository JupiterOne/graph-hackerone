import { executeStepWithDependencies } from '@jupiterone/integration-sdk-testing';
import { buildStepTestConfigForStep } from '../../../test/config';
import { Recording, setupProjectRecording } from '../../../test/recording';
import { Steps } from '../constants';

// See test/README.md for details
let recording: Recording;
afterEach(async () => {
  await recording.stop();
});

test('fetch-reports', async () => {
  recording = setupProjectRecording({
    directory: __dirname,
    name: 'fetch-reports',
  });

  const stepConfig = buildStepTestConfigForStep(Steps.REPORTS);
  const stepResult = await executeStepWithDependencies(stepConfig);

  const { collectedEntities, collectedRelationships } = stepResult;

  expect(
    collectedEntities.some((entity) => entity._type === 'hackerone_report'),
  ).toBe(true);
  expect(
    collectedRelationships.some(
      (relationship) =>
        relationship._type === 'hackerone_program_reported_finding',
    ),
  ).toBe(true);
});

test('build-program-assets-reports-relationships', async () => {
  recording = setupProjectRecording({
    directory: __dirname,
    name: 'build-program-assets-reports-relationships',
  });

  const stepConfig = buildStepTestConfigForStep(
    Steps.PROGRAM_ASSETS_REPORTS_RELATIONSHIPS,
  );
  const stepResult = await executeStepWithDependencies(stepConfig);
  expect(stepResult).toMatchStepMetadata(stepConfig);
});
