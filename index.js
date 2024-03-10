const fs = require("fs").promises;
const path = require("path");
const Tesseract = require("tesseract.js");
const inquirer = require("inquirer");

async function doesExtractedFilesDirectoryExist(folderPath) {
  try {
    const stat = await fs.stat(folderPath);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}

async function extractText(imagePath) {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(
      imagePath,
      "guj", // language code
      { logger: (info) => console.log(info) } // logger for debugging
    );
    try {
      const extractedFilesPath = path.join(
        path.dirname(imagePath),
        "extractedFiles"
      );
      //   console.log(
      //     "stat isDirectory ???? ===>>>>>> ",
      //     extractedFilesPath,
      //     await doesExtractedFilesDirectoryExist(extractedFilesPath)
      //   );
      if (!(await doesExtractedFilesDirectoryExist(extractedFilesPath))) {
        console.log(`creating ===>>>> ${extractedFilesPath}`);
        await fs.mkdir(extractedFilesPath);
      }
    } catch (error) {
      // Ignore errors if the directory already exists
      if (error.code !== "EEXIST") {
        throw error;
      }
    }

    // Create a text file with the same name as the image
    const txtPath = path.join(
      path.dirname(imagePath),
      "extractedFiles",
      `${path.basename(imagePath, path.extname(imagePath))}.txt`
    );
    await fs.writeFile(txtPath, text);

    console.log(`Text extracted and saved: ${txtPath}`);
  } catch (error) {
    console.error(`Error extracting text from: ${imagePath}`, error);
  }
}

async function processFolder(folderPath) {
  try {
    console.log(`Processing folder: ${folderPath}`);
    const files = await fs.readdir(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.stat(filePath);

      if (stats.isDirectory()) {
        console.log(`Found subfolder: ${filePath}`);
        const extractedFilesPath = path.join(folderPath, "extractedFiles");
        await fs.mkdir(extractedFilesPath, { recursive: true });

        await processFolder(filePath); // Recursively process subfolder
      } else if (stats.isFile() && /\.(png|jpg|jpeg)$/i.test(file)) {
        console.log(`Found image file: ${filePath}`);
        const extractedText = await extractText(filePath, folderPath);
      }
    }
  } catch (error) {
    console.error(`Error processing folder: ${folderPath}`, error);
  }
}

async function main() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "folderPath",
      message: "Enter the folder path:",
    },
  ]);

  await processFolder(answers.folderPath);
}

main();
