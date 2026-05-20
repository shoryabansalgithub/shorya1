import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define the file path (store it in the web app root so it persists)
const dataFilePath = path.join(process.cwd(), 'data', 'customers.json');

// Ensure the directory exists
const ensureDirectoryExists = () => {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export async function GET() {
  ensureDirectoryExists();
  if (fs.existsSync(dataFilePath)) {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    try {
      const customers = JSON.parse(fileContents);
      return NextResponse.json(customers);
    } catch (e) {
      return NextResponse.json(null);
    }
  }
  return NextResponse.json(null);
}

export async function POST(request: Request) {
  ensureDirectoryExists();
  try {
    const customers = await request.json();
    fs.writeFileSync(dataFilePath, JSON.stringify(customers, null, 2), 'utf8');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to write data' }, { status: 500 });
  }
}
