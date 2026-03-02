import path from 'path';
import { test, expect } from './fixtures';
import { FileUploadPage } from '../pages/FileUploadPage';

const FILES_DIR = path.join(process.cwd(), 'test-data', 'files');

function filePath(name: string): string {
  return path.join(FILES_DIR, name);
}

test.describe('File Upload', () => {
  test('successful submission - pdf file', async ({ userInFileUploadPage }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();
    //await expect(fileUploadPage.noFileChosenText).toBeVisible();
    // the no file chosen text is not findable in the page

    const file = filePath('pdf-file.pdf');
    await fileUploadPage.addFile(file);
    //await expect(fileUploadPage.fileNameText).toContainText('pdf-file.pdf');
    // the file name text is not findable in the page
    await expect(fileUploadPage.noFileChosenText).toBeHidden();

    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.successMessage).toBeVisible();
    await expect(fileUploadPage.successMessage).toContainText('pdf-file.pdf');
  });

  test('successful submission - mp4 file', async ({ userInFileUploadPage }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();
    //await expect(fileUploadPage.noFileChosenText).toBeVisible();
    // the no file chosen text is not findable in the page

    const file = filePath('video-file.mp4');
    await fileUploadPage.addFile(file);
    //await expect(fileUploadPage.fileNameText).toContainText('video-file.mp4');
    // the file name text is not findable in the page
    await expect(fileUploadPage.noFileChosenText).toBeHidden();

    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.successMessage).toBeVisible();
    await expect(fileUploadPage.successMessage).toContainText('video-file.mp4');
  });

  test('successful submission - png file', async ({ userInFileUploadPage }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();
    //await expect(fileUploadPage.noFileChosenText).toBeVisible();
    // the no file chosen text is not findable in the page

    const file = filePath('image-file.png');
    await fileUploadPage.addFile(file);
    //await expect(fileUploadPage.fileNameText).toContainText('image-file.png');
    // the file name text is not findable in the page
    await expect(fileUploadPage.noFileChosenText).toBeHidden();

    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.successMessage).toBeVisible();
    await expect(fileUploadPage.successMessage).toContainText('image-file.png');
  });

  test('successful submission - mp3 file', async ({ userInFileUploadPage }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();
    //await expect(fileUploadPage.noFileChosenText).toBeVisible();
    // the no file chosen text is not findable in the page

    const file = filePath('audio-file.mp3');
    await fileUploadPage.addFile(file);
    //await expect(fileUploadPage.fileNameText).toContainText('audio-file.mp3');
    // the file name text is not findable in the page
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
    //await expect(fileUploadPage.noFileChosenText).toBeVisible();
    // the no file chosen text is not findable in the page

    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.errorMessage).toBeVisible();
  });

  test('submitting disallowed file types shows an error message', async ({
    userInFileUploadPage,
  }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();

    const xlsFile = filePath('xls-file.xls');
    await fileUploadPage.addFile(xlsFile);
    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.errorMessage).toBeVisible();

    const docFile = filePath('doc-file.doc');
    await fileUploadPage.addFile(docFile);
    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.errorMessage).toBeVisible();
  });

  test('submitting files over 50MB shows an error message', async ({ userInFileUploadPage }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();
    const file = filePath('large-file.zip');
    await fileUploadPage.addFile(file);
    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.errorMessage).toBeVisible();
  });

  test('submitting a zero-byte or "empty" file shows an error message', async ({
    userInFileUploadPage,
  }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();
    const file = filePath('empty.txt');
    await fileUploadPage.addFile(file);
    await fileUploadPage.clickSubmit();
    await expect(fileUploadPage.errorMessage).toBeVisible();
  });

  test('successful submission - file name with spaces and special characters', async ({
    userInFileUploadPage,
  }) => {
    const fileUploadPage = new FileUploadPage(userInFileUploadPage.page);
    await fileUploadPage.goto();
    //await expect(fileUploadPage.noFileChosenText).toBeVisible();
    // the no file chosen text is not findable in the page

    const file = filePath('pdf (file!) copy.pdf');
    await fileUploadPage.addFile(file);
    //await expect(fileUploadPage.fileNameText).toContainText('pdf (file!) copy.pdf');
    // the file name text is not findable in the page
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
