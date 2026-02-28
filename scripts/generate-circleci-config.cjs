#!/usr/bin/env node
/**
 * Generates .circleci/config.yml from ci-constants.json.
 * Single source of truth for parallelism; persist steps generated from circleParallelism.
 * Run: npm run generate:circleci
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const constantsPath = path.join(root, 'ci-constants.json');
const outPath = path.join(root, '.circleci', 'config.yml');

const { circleParallelism } = JSON.parse(fs.readFileSync(constantsPath, 'utf8'));

const persistSteps = Array.from(
  { length: circleParallelism },
  (_, i) =>
    `      - persist_to_workspace:
          <<: *persist_blob
          paths:
            - blob-reports-${i}`
).join('\n');

const config = `# Generated from ci-constants.json. Regenerate: npm run generate:circleci
version: 2.1

x-workspace-persist: &persist_blob
  root: ~/project
  when: always
  continue_on_fail: true

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
          name: Prepare blob report for merge (unique path per node)
          command: |
            mkdir -p blob-reports-\${CIRCLE_NODE_INDEX}
            cp -r blob-report/. blob-reports-\${CIRCLE_NODE_INDEX}/ 2>/dev/null || true
${persistSteps}

  merge-reports:
    docker:
      - image: mcr.microsoft.com/playwright:v1.58.2-jammy
    resource_class: medium
    working_directory: ~/project
    steps:
      - checkout
      - attach_workspace:
          at: ~/project
      - restore_cache:
          keys:
            - npm-{{ checksum "package-lock.json" }}
      - run:
          name: Install dependencies
          command: npm ci
      - run:
          name: Gather blob reports and merge into one HTML report
          command: |
            mkdir -p all-blob-reports
            for d in blob-reports-*; do
              [ -d "$d" ] && cp -r "$d"/* all-blob-reports/ 2>/dev/null || true
            done
            npx playwright merge-reports --reporter html ./all-blob-reports
      - store_artifacts:
          path: ~/project/playwright-report
          destination: playwright-report

workflows:
  test-on-push-and-pr:
    jobs:
      - test
      - merge-reports:
          requires:
            - test
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, config.trimStart() + '\n', 'utf8');
console.log(`Wrote .circleci/config.yml (parallelism: ${circleParallelism})`);