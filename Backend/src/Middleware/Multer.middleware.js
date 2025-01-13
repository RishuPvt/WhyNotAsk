import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get the __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the full path to the directory where files will be stored
const tempDir = path.resolve(__dirname, "../public/temp");

// Ensure the directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true }); // Create directory and any missing parent directories
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${uuidv4()}${Date.now()}`;
    const extension = path.extname(file.originalname);
    const uniqueFileName = `${uniqueSuffix}${extension}`;
    cb(null, uniqueFileName);
  },
});

export const upload = multer({
  storage,
});
