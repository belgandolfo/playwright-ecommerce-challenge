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
  - `example.spec.ts` – sample tests against `https://playwright.dev/`.
- `pages/` – Page Object Model (POM) classes that model screens in the app.
- `package.json` – Node project metadata and scripts.

You can add more spec files under `tests/` to grow your automation suite.

---

## Running Tests

Run all Playwright tests:

```bash
npx playwright test
```

Run tests in headed mode (see the browser window):

```bash
npx playwright test --headed
```

Run a specific test file:

```bash
npx playwright test tests/example.spec.ts
```

Run a specific test by title:

```bash
npx playwright test -g "has title"
```

Generate and open the HTML report:

```bash
npx playwright test --reporter=html
npx playwright show-report
```

---

## Environments (dev / qa)

This project uses **dotenv** and `TEST_ENV` to switch environments:

- `.env.dev` – settings for the **dev** environment.
- `.env.qa` – settings for the **qa** environment.
- `playwright.config.js` reads `TEST_ENV` and loads `.env.<TEST_ENV>`, using `BASE_URL` as the `baseURL` for all tests.

From the project root, you can run:

```bash
# Run tests against dev environment
npm run test:dev

# Run tests against qa environment
npm run test:qa
```

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

---

## CI Integration

There is a sample GitHub Actions workflow in `.github/workflows/playwright.yml` that:

- Installs dependencies.
- Installs Playwright browsers.
- Runs `npx playwright test`.
- Uploads the HTML report as an artifact.

You can enable or customize this workflow for continuous integration in GitHub.

