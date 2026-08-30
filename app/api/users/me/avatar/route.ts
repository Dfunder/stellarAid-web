import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Mock virus scan function
const scanFileForVirus = async (filePath: string) => {
  // In a real application, you would integrate with a virus scanning service like ClamAV
  console.log(`Scanning ${filePath} for viruses...`);
  // For demonstration purposes, let's assume the file is clean
  return true;
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('avatar') as File;

  if (!file) {
    return new NextResponse('No file uploaded', { status: 400 });
  }

  // File type validation (whitelist)
  const allowedFileTypes = ['image/jpeg', 'image/png'];
  if (!allowedFileTypes.includes(file.type)) {
    return new NextResponse('Invalid file type', { status: 400 });
  }

  // File size limit (2MB)
  const maxFileSize = 2 * 1024 * 1024;
  if (file.size > maxFileSize) {
    return new NextResponse('File size exceeds the limit', { status: 400 });
  }

  // Create an isolated upload directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  // Rename the file on the server
  const fileExtension = path.extname(file.name);
  const newFileName = `${uuidv4()}${fileExtension}`;
  const filePath = path.join(uploadDir, newFileName);

  // Save the file
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, fileBuffer);

  // Virus scanning
  const isFileClean = await scanFileForVirus(filePath);
  if (!isFileClean) {
    // If the file is infected, delete it and return an error
    await fs.unlink(filePath);
    return new NextResponse('File is infected with a virus', { status: 400 });
  }

  // Return the URL of the uploaded file
  const fileUrl = `/uploads/${newFileName}`;
  return new NextResponse(JSON.stringify({ url: fileUrl }), { status: 200 });
}
