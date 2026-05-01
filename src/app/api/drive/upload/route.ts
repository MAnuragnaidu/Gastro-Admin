import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import stream from 'stream';

// Define a type for Drive metadata if needed, but 'any' is sufficient for the googleapis responses here

export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return new NextResponse(null, { status: 200, headers });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const isExport = formData.get('isExport') === 'true'; // flag to differentiate pdf exports vs normal docs

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const { GDRIVE_CLIENT_EMAIL, GDRIVE_PRIVATE_KEY, GDRIVE_FOLDER_ID } = process.env;

    if (!GDRIVE_CLIENT_EMAIL || !GDRIVE_PRIVATE_KEY || !GDRIVE_FOLDER_ID) {
      return NextResponse.json({ error: 'Google Drive credentials not configured' }, { status: 500 });
    }

    // Handle formatting of private key (replace literal \n with actual newlines)
    const privateKey = GDRIVE_PRIVATE_KEY.replace(/\\n/g, '\n');

    // Authenticate with Google Drive
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GDRIVE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Convert File to a readable stream for Google Drive
    const buffer = Buffer.from(await file.arrayBuffer());
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);

    // Prepare file metadata
    const fileMetadata = {
      name: file.name,
      parents: [GDRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: file.type || 'application/octet-stream',
      body: bufferStream,
    };

    // Upload to Google Drive
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    const fileId = response.data.id;

    // Optional: Make the file viewable by anyone with the link so the app can link to it easily
    if (fileId) {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
        supportsAllDrives: true,
      });
    }

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');

    return NextResponse.json({
      success: true,
      fileId: fileId,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
    }, { headers });
  } catch (error: any) {
    console.error('Google Drive Upload Error:', error);
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    return NextResponse.json({ error: error.message || 'Failed to upload to Google Drive' }, { status: 500, headers });
  }
}
