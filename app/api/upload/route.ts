import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'Файл байхгүй байна' }, { status: 400 });

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    const isVideo = file.type.startsWith('video/');

    const result = await cloudinary.uploader.upload(dataURI, {
      folder:        'mongolian-resorts',
      resource_type: isVideo ? 'video' : 'image',
      ...(isVideo ? {} : {
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      }),
    });

    return NextResponse.json({
      url:       result.secure_url,
      public_id: result.public_id,
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message ?? 'Upload алдаа' }, { status: 500 });
  }
}
