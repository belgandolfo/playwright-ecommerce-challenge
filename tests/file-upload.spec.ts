import path from 'path';
import { test, expect } from '../fixtures/fixtures';
import { FileUploadPage } from '../pages/FileUploadPage';

const FILES_DIR = path.join(process.cwd(), 'test-data', 'files');

function filePath(name: string): string {
  return path.join(FILES_DIR, name);
}

test.describe('File Upload', () => {
  test('successful submission - pdf file', async ({ userInFileUploadPage }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();

    await fileUploadPage.addFile(filePath('pdf-file.pdf'));
    await expect(fileUploadPage.noFileChosenText).toBeHidden();

    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.successMessage).toBeVisible();
    await expect(fileUploadPage.successMessage).toContainText('pdf-file.pdf');
  });

  test('successful submission - mp4 file', async ({ userInFileUploadPage }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();

    await fileUploadPage.addFile(filePath('video-file.mp4'));
    await expect(fileUploadPage.noFileChosenText).toBeHidden();

    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.successMessage).toBeVisible();
    await expect(fileUploadPage.successMessage).toContainText('video-file.mp4');
  });

  test('successful submission - png file', async ({ userInFileUploadPage }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();

    await fileUploadPage.addFile(filePath('image-file.png'));
    await expect(fileUploadPage.noFileChosenText).toBeHidden();

    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.successMessage).toBeVisible();
    await expect(fileUploadPage.successMessage).toContainText('image-file.png');
  });

  test('successful submission - mp3 file', async ({ userInFileUploadPage }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();

    await fileUploadPage.addFile(filePath('audio-file.mp3'));
    await expect(fileUploadPage.noFileChosenText).toBeHidden();

    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.successMessage).toBeVisible();
    await expect(fileUploadPage.successMessage).toContainText('audio-file.mp3');
  });

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
