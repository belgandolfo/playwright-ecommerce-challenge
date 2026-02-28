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

**Choosing the login user**

The auto fixture `loggedInPageWithLogout` uses the user selected by **`TEST_USER`** (default: `admin`). You can run with a specific user via npm scripts:

```bash
# Dev + admin user (default)
npm run test:dev:admin

# Dev + non-admin user
npm run test:dev:nonAdmin

# Same for QA
npm run test:qa:admin
npm run test:qa:nonAdmin
```

Or set the env yourself: `TEST_USER=nonAdmin npm run test:dev`. Valid values: `admin`, `nonAdmin` (from `test-data/users.ts`).

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

---

## CI Integration

There is a sample GitHub Actions workflow in `.github/workflows/playwright.yml` that:

- Installs dependencies.
- Installs Playwright browsers.
- Runs `npx playwright test`.
- Uploads the HTML report as an artifact.

You can enable or customize this workflow for continuous integration in GitHub.

