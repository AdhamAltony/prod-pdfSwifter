// app/actions/uploadFile.js
import fs from 'fs';
import path from 'path';

export async function uploadFile(files, tool) {
  try {
    // Example: save files to a local folder
    const uploadDir = path.join(process.cwd(), 'uploads', tool);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(path.join(uploadDir, file.name), buffer);
    }

    return { success: true, message: `${files.length} file(s) uploaded to ${tool}` };
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Upload failed' };
  }
}
