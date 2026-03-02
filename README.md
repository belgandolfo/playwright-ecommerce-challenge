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
- `fixtures/` – shared fixtures and custom `test` exports used by all specs.
- `tests/` – test specs written with `@playwright/test` in TypeScript.
- `pages/` – Page Object Model (POM) classes that model screens in the app.
- `test-data/` – test users and domain data used by specs.
- `.circleci/config.yml` – CircleCI pipeline to run Playwright tests in parallel using `qa`/`dev` contexts and publish reports/artifacts.
- `package.json` – Node project metadata, scripts, and dev dependencies.

You can add more page objects under `pages/` and more spec files under `tests/` to grow your automation suite.

---

## Running Tests

You can choose **environment** (dev / qa) and **login user** (admin / nonAdmin) when running tests. Use the npm scripts below, or set `TEST_ENV` and `TEST_USER` yourself.

### By environment and user

| Goal                      | Command                     |
| ------------------------- | --------------------------- |
| Dev, default user (admin) | `npm run test:dev`          |
| QA, default user (admin)  | `npm run test:qa`           |
| Dev + admin user          | `npm run test:dev:admin`    |
| Dev + nonAdmin user       | `npm run test:dev:nonAdmin` |
| QA + admin user           | `npm run test:qa:admin`     |
| QA + nonAdmin user        | `npm run test:qa:nonAdmin`  |

With custom env/user (e.g. QA + nonAdmin):

```bash
TEST_ENV=qa TEST_USER=nonAdmin npx playwright test
```

### By browser (project)

By default, tests run on all configured browsers (Chromium, Firefox, WebKit). To run only on one browser, use the `--project` flag:

| Browser       | Command                                  |
| ------------- | ---------------------------------------- |
| Chromium only | `npm run test:dev -- --project=chromium` |
| Firefox only  | `npm run test:dev -- --project=firefox`  |
| WebKit only   | `npm run test:dev -- --project=webkit`   |

You can combine with any env/user script, for example:

```bash
npm run test:qa -- --project=chromium
npm run test:dev:nonAdmin -- --project=firefox
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

Run a specific test by title (include the spec file so the correct fixtures are loaded):

```bash
npm run test:dev -- tests/shopping-cart.spec.ts -g "add same item multiple times"
npm run test:qa -- tests/shopping-cart.spec.ts -g "add same item multiple times" --headed --project=chromium
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

This project uses **dotenv** and `**TEST_ENV`\*\* to switch environments:

- `.env.dev` – settings for the **dev** environment.
- `.env.qa` – settings for the **qa** environment.
- `playwright.config.js` reads `TEST_ENV` and loads `.env.<TEST_ENV>`, using `BASE_URL` as the `baseURL` for all tests.

The login user is controlled by `**TEST_USER`\*\* (default: `admin`). The auto fixture `loggedInPageWithLogout` uses this to log in as admin or nonAdmin. Valid values: `admin`, `nonAdmin` (from `test-data/users.ts`).

For all run commands (by env and user), see [Running Tests](#running-tests).

---

## Continuous Integration (CircleCI)

**When it runs:** On every push and when pull requests are opened or updated. Also, a daily morning run was configured. Pipelines run in CircleCI using a single `test` job that can target **qa** or **dev** via contexts.

- **Default environment:** `qa`
  - The CircleCI config defines a pipeline parameter `environment` with default `qa`.
  - On normal pushes/PRs (no parameter set), the `**test-qa` workflow** runs, using the `**qa`context** and`TEST_ENV=qa`.
- **Dev environment (manual runs):**
  - From the CircleCI UI, click **Run pipeline** and set the `environment` parameter to `dev`.
  - This triggers the `**test-dev` workflow**, which runs the same job but with the `**dev`context** and`TEST_ENV=dev`.

**Where to find results (both qa and dev runs):**

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

`**loggedInPageWithLogout` (auto fixture)\*\*

This fixture is **automatic**: it runs for every test that uses the default `test` from this file. You get a page signed in as the **admin user** (credentials from `.env.dev` / `.env.qa`), with login **before** the test and logout **after**, so each test has a fresh session. The page object fixtures (`loginPage`, `shoppingCartPage`, etc.) all use this logged-in page by default.

```ts
import { test, expect } from './fixtures';

test('add item as admin', async ({ shoppingCartPage }) => {
  await shoppingCartPage.goto();
  await shoppingCartPage.addItemToCart('iphone12');
});
```

To run tests **without** login (e.g. login page tests), use `**testNoAuth`\*\*:

```ts
import { testNoAuth, expect } from './fixtures';

testNoAuth('shows error for invalid credentials', async ({ loginPage }) => {
  await loginPage.login('bad@example.com', 'wrong');
});
```

---

## Code Quality: ESLint and Prettier

This project uses **ESLint** and **Prettier** for code quality and consistent formatting:

- **ESLint** (`eslint`, `@typescript-eslint/`\*, `eslint-plugin-playwright`) checks for common issues in TypeScript and Playwright tests.
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

---

## Future Improvements

- **API-level validation**: Add API tests (using Playwright’s `request` fixtures or a separate API test runner) to validate responses, schemas, error codes, and edge cases directly at the API layer. This would complement UI tests and make failures easier to localize (API vs UI vs environment).

- **API-based login for non-login tests**: For flows that don’t need to test the login UI itself, introduce fixtures that authenticate via API and inject a logged-in session (cookies / tokens) into the browser before navigating. This makes preconditions much faster and less flaky because they don’t depend on the login form. In this particular app we couldn’t implement this yet because the login page has no backing APIs exposed.

- **Accessibility testing**: Integrate automated accessibility checks (for example with `@axe-core/playwright`) into key flows such as login, shopping cart, shipping details, and order confirmation. Useful checks include:
  - Ensuring all interactive elements have accessible names/labels.
  - Verifying sufficient color contrast for text and buttons.
  - Detecting missing form labels and ARIA attributes.
  - Checking page structure (landmarks, heading levels) and focus order.

- **Visual regression testing**: Add visual snapshot tests (e.g. with `expect(page).toHaveScreenshot()` or a dedicated visual regression tool) for important views like the shopping cart, shipping form, order confirmation, and file upload page. This would catch unintended visual changes (layout shifts, styling regressions, missing elements) that functional assertions alone might not detect.
