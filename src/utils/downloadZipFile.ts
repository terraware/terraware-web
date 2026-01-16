import JSZip from 'jszip';
import sanitize from 'sanitize-filename';

interface ZipFileContent {
  /**
   * Name of the file to create inside the zipfile. If there is a suffix specified in the top-level
   * parameters, it will be appended to this value.
   */
  fileName: string;

  /**
   * Source of the file's content. This can either be the data or a promise that resolves to the
   * data. If the zipfile contains multiple files whose content comes from promises, they will be
   * resolved concurrently.
   */
  content: string | Blob | (() => Promise<string | Blob | null>);
}

interface DownloadZipFileParams {
  /**
   * Name of the directory inside the zipfile where the files will be placed. Also used as the base
   * filename of the generated zipfile. For example, if this is `foo`, the generated zipfile will be
   * called `foo.zip` and a file `xyz.csv` in the zip archive will be called `foo/xyz.csv`.
   */
  dirName: string;

  files: ZipFileContent[];

  /** Suffix to append to each file's name. For example, `.csv`. */
  suffix?: string;
}

/**
 * Adds UTF-8 BOM to the beginning of content to ensure proper Excel parsing.
 * The BOM helps Excel recognize UTF-8 encoding and properly parse CSV delimiters.
 */
function addUtf8Bom(content: string | Blob): string | Blob {
  const BOM = '\uFEFF';

  if (typeof content === 'string') {
    return BOM + content;
  }

  return new Blob([BOM, content], { type: content.type });
}

/** Downloads a binary file to the user's system. */
function downloadBlob(fileName: string, content: Blob) {
  const url = URL.createObjectURL(content);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Generates and downloads a zip archive of a set of files.
 *
 * @throws Error The zipfile couldn't be constructed, e.g., because one of the content generation
 * functions returned null.
 */
export default async function downloadZipFile(params: DownloadZipFileParams) {
  const { dirName, files, suffix } = params;
  const sanitizedDirName = sanitize(dirName);
  const effectiveSuffix = suffix !== undefined ? suffix : '';
  const zip = new JSZip();

  const folder = zip.folder(sanitizedDirName);
  if (!folder) {
    throw new Error('Failed to create folder in zip archive');
  }

  const contentPromises = files.map(async ({ fileName, content }) => {
    const fullFileName = sanitize(fileName + effectiveSuffix);
    const isCsv = effectiveSuffix.toLowerCase() === '.csv';

    if (typeof content === 'string' || content instanceof Blob) {
      const fileContent = isCsv ? addUtf8Bom(content) : content;
      folder.file(fullFileName, fileContent);
    } else {
      const generatedContent = await content();
      if (generatedContent === null) {
        throw new Error(`Failed to generate content for file "${fullFileName}"`);
      }

      const fileContent = isCsv ? addUtf8Bom(generatedContent) : generatedContent;
      folder.file(fullFileName, fileContent);
    }
  });

  await Promise.all(contentPromises);

  const zipContent = await zip.generateAsync({ type: 'blob' });

  downloadBlob(sanitizedDirName + '.zip', zipContent);
}
