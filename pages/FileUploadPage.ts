import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class FileUploadPage extends BasePage {
  readonly title: Locator;
  readonly chooseFileButton: Locator;
  readonly fileInput: Locator;
  readonly submitButton: Locator;
  readonly noFileChosenText: Locator;
  /** Element that displays the chosen file name (often the same as the "No file chosen" area after selection). */
  readonly fileNameText: Locator;
  /** Message shown after a successful upload (e.g. contains the file name). */
  readonly successMessage: Locator;
  /** Message shown when upload fails or validation fails. */
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByRole('heading', { name: 'File Upload Example' });
    this.chooseFileButton = page.getByRole('button', { name: 'Choose File' });
    this.fileInput = page.locator('input[type="file"]');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.noFileChosenText = page.getByText('No file chosen');
    this.fileNameText = page.getByText('No file chosen');
    this.successMessage = page.locator('#file_upload_response');
    this.errorMessage = page.getByRole('alert').filter({ hasText: /invalid file/i });
  }

  /**
   * Navigates to the file upload page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/file-upload.html');
  }

  /**
   * Adds a file from the given path.
   * Use a path to a real file or a path from the project.
   */
  async addFile(filePath: string): Promise<void> {
    await this.fileInput.setInputFiles(filePath);
  }

  /**
   * Clicks the Submit button.
   */
  async clickSubmit(): Promise<void> {
    await this.submitButton.click();
  }
}
