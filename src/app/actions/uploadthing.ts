'use server';

import { UTApi } from 'uploadthing/server';

const utapi = new UTApi();

export async function deleteAvatarFromStorage(fileKey: string) {
  if (!fileKey) return { success: false, error: 'No file key provided' };

  try {
    // IMPORTANT: In UploadThing v7, deleteFiles returns { success: boolean, deletedCount: number }
    // It accepts a single string key or an array of keys.
    const result = await utapi.deleteFiles(fileKey);

    return {
      success: result.success,
      result: {
        success: result.success,
        deletedCount: result.deletedCount,
      },
    };
  } catch (error) {
    console.error('Error deleting avatar from UploadThing:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
