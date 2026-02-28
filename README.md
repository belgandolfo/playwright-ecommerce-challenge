## Challenge – Playwright Test Automation

This project is a **Playwright-based UI test automation suite**. It uses `@playwright/test` to run browser tests against web applications in Chromium, Firefox, and WebKit.

---

## Getting Started

### Prerequisites

- **Node.js** (recommended: LTS version)
- **npm** (bundled with Node)

Check versions:

```bash
node -v
npm -v
```

### Install dependencies

From the project root:

```bash
npm install
```

This installs `@playwright/test` and its dependencies.

### Install browsers

Playwright needs browser binaries:

```bash
npx playwright install
```

This downloads Chromium, Firefox, and WebKit for testing.

---

## Project Structure

- `playwright.config.js` – main Playwright Test configuration (browsers, reporters, options).
- `tests/` – test specs written with `@playwright/test` in TypeScript.
  - `fixtures.ts` – custom fixtures that inject page objects into tests.
  - `example.spec.ts` – sample tests against `https://playwright.dev/`.
- `pages/` – Page Object Model (POM) classes that model screens in the app.
- `package.json` – Node project metadata and scripts.

You can add more spec files under `tests/` to grow your automation suite.

---

## Running Tests

You can choose **environment** (dev / qa) and **login user** (admin / nonAdmin) when running tests. Use the npm scripts below, or set `TEST_ENV` and `TEST_USER` yourself.

### By environment and user

| Goal | Command |
|------|---------|
| Dev, default user (admin) | `npm run test:dev` |
| QA, default user (admin) | `npm run test:qa` |
| Dev + admin user | `npm run test:dev:admin` |
| Dev + nonAdmin user | `npm run test:dev:nonAdmin` |
| QA + admin user | `npm run test:qa:admin` |
| QA + nonAdmin user | `npm run test:qa:nonAdmin` |

With custom env/user (e.g. QA + nonAdmin):

```bash
TEST_ENV=qa TEST_USER=nonAdmin npx playwright test
```

### Other run options

Run tests in headed mode (see the browser):

```bash
npm run test:dev -- --headed
```

Run a specific test file:

```bash
npm run test:qa -- tests/login.spec.ts
```

Run a specific test by title:

```bash
npm run test:dev -- -g "has title"
```

---

## Test reports and artifacts

### How to generate the report

The HTML report is generated automatically whenever you run tests (the default reporter is `html`). No extra flags are needed:

```bash
npx playwright test
```

To generate the report without opening it (e.g. in CI), run the same command; the report is written to `playwright-report/`.

### How to view the HTML report

- **Locally:** The report is configured to **open in the browser after every run** when not in CI. If it doesn’t open, or you want to open it again later:

  ```bash
  npx playwright show-report
  ```

  This serves the latest report from `playwright-report/` and opens it in your browser.

- **In CI (e.g. CircleCI):** The report does not auto-open (there is no display). The report is still generated in `playwright-report/` and is stored as an artifact so you can download and open it, or run `npx playwright show-report` locally on the downloaded folder.

### Where artifacts (videos / traces) live

- **HTML report:** `playwright-report/` (index and assets for the report UI).
- **Test artifacts:** `test-results/` — each test run creates a folder per test (e.g. `test-results/login-spec-ts-Login-shows-error-.../`). Inside you’ll find:
  - **Videos** (kept only when a test fails; `video: 'retain-on-failure'` in config).
  - **Traces** (when a test is retried; `trace: 'on-first-retry'` in config).

### How to interpret failure artifacts

- **Video:** Recorded for every test; only retained when the test fails. In the HTML report, open the failed test and use the **Video** attachment to watch the full run and see what happened before the failure.
- **Trace:** Recorded on the first retry (when enabled). In the report, click **Trace** for the failed test, or run `npx playwright show-trace test-results/.../trace.zip`, to replay the test step-by-step and inspect the DOM, console, and network.

Use the video to watch the test run up to the failure; use the trace to replay and inspect the exact step that failed.

---

## Environments (dev / qa)

This project uses **dotenv** and **`TEST_ENV`** to switch environments:

- `.env.dev` – settings for the **dev** environment.
- `.env.qa` – settings for the **qa** environment.
- `playwright.config.js` reads `TEST_ENV` and loads `.env.<TEST_ENV>`, using `BASE_URL` as the `baseURL` for all tests.

The login user is controlled by **`TEST_USER`** (default: `admin`). The auto fixture `loggedInPageWithLogout` uses this to log in as admin or nonAdmin. Valid values: `admin`, `nonAdmin` (from `test-data/users.ts`).

For all run commands (by env and user), see [Running Tests](#running-tests).

---

## Continuous Integration (CircleCI)

**When it runs:** On every push and when pull requests are opened or updated.

**Config:** `.circleci/config.yml` is generated from `ci-constants.json` (single source of truth for `circleParallelism`). To change the number of parallel workers, edit the JSON and run `npm run generate:circleci`.

**Where to find results:**

- **Tests** tab – Pass/fail summary (from JUnit results).
- **Artifacts** – Per-node **HTML report** (`playwright-report-0`, `playwright-report-1`, …) and **test-results** (`test-results-0`, `test-results-1`, …) with JUnit and traces. Download from the job’s Artifacts tab to inspect failures.

---

## Writing New Tests

Create a new file under `tests/`, for example `tests/login.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('https://example.com/');
  await expect(page).toHaveTitle(/Example/);
});
```

Then run:

```bash
npx playwright test tests/login.spec.ts
```

For more advanced patterns (page objects, fixtures, auth helpers), see the official docs: `https://playwright.dev/docs/test-intro`.

---

## Test fixtures

This project uses **custom fixtures** in `tests/fixtures.ts`. Tests that import `test` and `expect` from that file get page objects (e.g. `loginPage`, `shoppingCartPage`) injected instead of constructing them by hand.

**Why use fixtures?**

- **Less boilerplate** – You request only the pages you need (e.g. `async ({ loginPage, shoppingCartPage }) => { ... }`). No `new LoginPage(page)` in every test.
- **Consistent setup** – Page objects are created the same way everywhere; you can later add shared setup (e.g. base URL, auth) in one place.
- **Clear dependencies** – Each test declares what it uses in its argument list, which makes tests easier to read and refactor.
- **Reuse and scaling** – New fixtures (e.g. “logged-in user”) can be added once and reused across many tests.

**`loggedInPageWithLogout` (auto fixture)**

This fixture is **automatic**: it runs for every test that uses the default `test` from this file. You get a page signed in as the **admin user** (credentials from `.env.dev` / `.env.qa`), with login **before** the test and logout **after**, so each test has a fresh session. The page object fixtures (`loginPage`, `shoppingCartPage`, etc.) all use this logged-in page by default.

```ts
import { test, expect } from './fixtures';

test('add item as admin', async ({ shoppingCartPage }) => {
  await shoppingCartPage.goto();
  await shoppingCartPage.addItemToCart('iphone12');
});
```

To run tests **without** login (e.g. login page tests), use **`testNoAuth`**:

```ts
import { testNoAuth, expect } from './fixtures';

testNoAuth('shows error for invalid credentials', async ({
  loginPage,
}) => {
  await loginPage.login('bad@example.com', 'wrong');
});
```

---

## Code Quality: ESLint and Prettier

This project uses **ESLint** and **Prettier** for code quality and consistent formatting:

- **ESLint** (`eslint`, `@typescript-eslint/*`, `eslint-plugin-playwright`) checks for common issues in TypeScript and Playwright tests.
- **Prettier** (`prettier`, `eslint-config-prettier`) handles code formatting.

From the project root, you can run:

```bash
# Lint all files
npm run lint

# Lint and auto-fix fixable issues
npm run lint:fix

# Format the codebase with Prettier
npm run format
```

