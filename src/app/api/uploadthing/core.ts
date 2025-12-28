import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

// FileRouter for your app
export const ourFileRouter = {
  // Avatar uploader - max 4MB, only images
  avatarUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      // This code runs on your server before upload
      // You can check authentication here if needed
      // For now, we'll allow all uploads

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { uploadedBy: 'user' };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log('Upload complete for user:', metadata.uploadedBy);
      console.log('File URL:', file.url);

      // Return data to the client
      return { uploadedBy: metadata.uploadedBy, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
