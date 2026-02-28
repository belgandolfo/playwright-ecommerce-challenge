#!/usr/bin/env node
/**
 * Generates .circleci/config.yml from ci-constants.json.
 * Single source of truth: circleParallelism (2, 3, 4, …). All steps (parallelism,
 * prepare loop, store_artifacts) are generated from that value.
 * To change parallel executors: edit ci-constants.json, then run npm run generate:circleci.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const constantsPath = path.join(root, 'ci-constants.json');
const outPath = path.join(root, '.circleci', 'config.yml');

const { circleParallelism } = JSON.parse(fs.readFileSync(constantsPath, 'utf8'));

const indices = Array.from({ length: circleParallelism }, (_, i) => i);
const indicesStr = indices.join(' ');

const storeArtifactSteps = indices
  .flatMap((i) => [
    `      - store_artifacts:
          when: always
          path: ~/project/playwright-report-${i}
          destination: playwright-report-${i}
          continue_on_fail: true`,
    `      - store_artifacts:
          when: always
          path: ~/project/test-results-${i}
          destination: test-results-${i}
          continue_on_fail: true`,
  ])
  .join('\n');

const config = `# Generated from ci-constants.json. Regenerate: npm run generate:circleci
version: 2.1

jobs:
  test:
    parallelism: ${circleParallelism}
    docker:
      - image: mcr.microsoft.com/playwright:v1.58.2-jammy
    resource_class: medium
    working_directory: ~/project
    environment:
      CI: true
      TEST_ENV: qa
    steps:
      - checkout
      - restore_cache:
          keys:
            - npm-{{ checksum "package-lock.json" }}
      - run:
          name: Install dependencies
          command: npm ci
      - save_cache:
          key: npm-{{ checksum "package-lock.json" }}
          paths:
            - node_modules
      - run:
          name: Install Playwright browsers
          command: npx playwright install --with-deps
      - run:
          name: Run Playwright tests
          command: npx playwright test --shard=\$((CIRCLE_NODE_INDEX+1))/\${CIRCLE_NODE_TOTAL}
      - store_test_results:
          path: ~/project/test-results
      - run:
          name: Prepare test-results per node (for artifacts)
          command: |
            for i in ${indicesStr}; do mkdir -p test-results-\$i; done
            cp -r test-results/. test-results-\${CIRCLE_NODE_INDEX}/ 2>/dev/null || true
${storeArtifactSteps}

workflows:
  test-on-push-and-pr:
    jobs:
      - test
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, config.trimStart() + '\n', 'utf8');
console.log(`Wrote .circleci/config.yml (parallelism: ${circleParallelism})`);