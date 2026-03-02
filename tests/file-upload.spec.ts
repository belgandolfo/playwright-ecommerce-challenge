import path from 'path';
import { test, expect } from '../fixtures/fixtures';
import { FileUploadPage } from '../pages/FileUploadPage';

const FILES_DIR = path.join(process.cwd(), 'test-data', 'files');

function filePath(name: string): string {
  return path.join(FILES_DIR, name);
}

const successfulUploadFiles: Array<{ label: string; fileName: string }> = [
  { label: 'pdf', fileName: 'pdf-file.pdf' },
  { label: 'mp4', fileName: 'video-file.mp4' },
  { label: 'png', fileName: 'image-file.png' },
  { label: 'mp3', fileName: 'audio-file.mp3' },
];

test.describe('File Upload', () => {
  for (const { label, fileName } of successfulUploadFiles) {
    test(`successful submission - ${label} file`, async ({ userInFileUploadPage }) => {
      const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
      await fileUploadPage.goto();
      await fileUploadPage.addFile(filePath(fileName));
      await expect(fileUploadPage.noFileChosenText).toBeHidden();
      await fileUploadPage.clickSubmit();
      await expect(fileUploadPage.successMessage).toBeVisible();
      await expect(fileUploadPage.successMessage).toContainText(fileName);
    });
  }

  test('submitting with no file selected shows an error message', async ({
    userInFileUploadPage,
  }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();

    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.errorMessage).toBeVisible();
  });

  test('submitting disallowed file types shows an error message', async ({
    userInFileUploadPage,
  }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();

    await fileUploadPage.addFile(filePath('xls-file.xls'));
    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.errorMessage).toBeVisible();

    await fileUploadPage.addFile(filePath('doc-file.doc'));
    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.errorMessage).toBeVisible();
  });

  test('submitting files over 50MB shows an error message', async ({ userInFileUploadPage }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();
    await fileUploadPage.addFile(filePath('large-file.zip'));
    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.errorMessage).toBeVisible();
  });

  test('submitting a zero-byte or "empty" file shows an error message', async ({
    userInFileUploadPage,
  }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();
    await fileUploadPage.addFile(filePath('empty.txt'));
    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.errorMessage).toBeVisible();
  });

  test('successful submission - file name with spaces and special characters', async ({
    userInFileUploadPage,
  }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();

    await fileUploadPage.addFile(filePath('pdf (file!) copy.pdf'));
    await expect(fileUploadPage.noFileChosenText).toBeHidden();

    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.successMessage).toBeVisible();
    await expect(fileUploadPage.successMessage).toContainText('pdf (file!) copy.pdf');
  });

  test('successful submission - after choosing multiple files, only last file is shown in the success message', async ({
    userInFileUploadPage,
  }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();
    await fileUploadPage.addFile(filePath('pdf-file.pdf'));
    await fileUploadPage.addFile(filePath('audio-file.mp3'));
    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.successMessage).toBeVisible();
    await expect(fileUploadPage.successMessage).toContainText('audio-file.mp3');
    await expect(fileUploadPage.successMessage).not.toContainText('pdf-file.pdf');
  });
});
