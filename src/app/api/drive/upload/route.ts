import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export const runtime = 'nodejs';

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
    const getText = (...keys: string[]) => {
      for (const key of keys) {
        const value = formData.get(key);
        if (typeof value === 'string' && value.trim()) return value.trim();
      }
      return '';
    };

    const patientName = getText('patientName', 'name');
    const mrn = getText('mrn', 'mrnNumber', 'patientMrn');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!patientName || !mrn) {
      return NextResponse.json(
        { error: 'Missing patientName or mrn in upload request' },
        { status: 400 }
      );
    }

    const { GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, GDRIVE_REFRESH_TOKEN, GDRIVE_FOLDER_ID } = process.env;

    const credsOk = !!(GDRIVE_CLIENT_ID && GDRIVE_CLIENT_SECRET && GDRIVE_REFRESH_TOKEN && GDRIVE_FOLDER_ID);
    if (!credsOk) {
      return NextResponse.json({ error: 'Google Drive credentials not configured' }, { status: 500 });
    }

    // ── OAuth2 using your personal Google account ──
    const oauth2Client = new google.auth.OAuth2(
      GDRIVE_CLIENT_ID,
      GDRIVE_CLIENT_SECRET,
    );

    oauth2Client.setCredentials({
      refresh_token: GDRIVE_REFRESH_TOKEN,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const sanitizedPatientName = patientName.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_');
    const sanitizedMrn = mrn.replace(/[\\/:*?"<>|]/g, '');
    const folderName = `${sanitizedPatientName}_${sanitizedMrn}`;

    const escapedFolderName = folderName.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const folderLookup = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${escapedFolderName}' and '${GDRIVE_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name)',
      pageSize: 1,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    let patientFolderId = folderLookup.data.files?.[0]?.id;

    if (!patientFolderId) {
      const createdFolder = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [GDRIVE_FOLDER_ID],
        },
        fields: 'id',
        supportsAllDrives: true,
      });
      patientFolderId = createdFolder.data.id || undefined;
    }

    if (!patientFolderId) {
      throw new Error('Failed to resolve patient folder in Google Drive');
    }

    // Convert File to readable stream
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // Upload to Google Drive folder
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [patientFolderId],
      },
      media: {
        mimeType: file.type || 'application/octet-stream',
        body: stream,
      },
      fields: 'id, webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    const fileId = response.data.id;

    // Make file publicly viewable via link
    if (fileId) {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    }

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');

    return NextResponse.json({
      success: true,
      url: `https://drive.google.com/file/d/${fileId}/view`,
      fileId,
      folderId: patientFolderId,
      folderName,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
    }, { headers });

  } catch (error: any) {
    console.error('Google Drive Upload Error:', error);
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    return NextResponse.json(
      { error: error.message || 'Failed to upload to Google Drive' },
      { status: 500, headers }
    );
  }
}
