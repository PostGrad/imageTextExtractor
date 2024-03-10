const fs = require("fs");
const path = require("path");
const Tesseract = require("tesseract.js");

const imagePath = "/home/pranayp/Downloads/test.jpeg";
Tesseract.recognize(
  imagePath,
  "guj", // Specify the language code for Gujarati
  {
    logger: (info) => console.log(info), // Log progress information
  }
)
  .then(({ data: { text } }) => {
    // Output the extracted text
    console.log("Extracted Text:", text);
    // Get the base name of the image file (without extension)
    const baseName = path.basename(imagePath, path.extname(imagePath));

    // Create a text file path with the same name as the image file
    const textFilePath = path.join(path.dirname(imagePath), `${baseName}.txt`);

    // Write the extracted text to the text file
    fs.writeFile(textFilePath, text, (err) => {
      if (err) {
        console.error("Error writing text file:", err);
      } else {
        console.log("Text file saved:", textFilePath);
      }
    });
  })
  .catch((error) => {
    console.error("Error during OCR:", error);
  });
