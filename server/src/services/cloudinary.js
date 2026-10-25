import { v2 as cloudinary } from 'cloudinary';

export const uploadsReady = () =>
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export function uploadBuffer(buffer, options) {
  configure();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => (err ? reject(err) : resolve(result)));
    stream.end(buffer);
  });
}

// Verification documents are stored as "authenticated" files: they only open with a signed link.
export function signedUrl(publicId) {
  configure();
  return cloudinary.url(publicId, { type: 'authenticated', sign_url: true, secure: true, resource_type: 'image' });
}

export const NOT_READY = { error: 'Uploads are not set up yet. Add the Cloudinary keys to server/.env.' };
