import apiClient from "@/lib/api-client";
import { ApiResponse } from "@/types";

export interface UploadScreenshotResult {
  url: string; // e.g. "/screenshots/uuid.jpg"
}

export const uploadsService = {
  /**
   * Uploads a screenshot file to the API's local disk storage.
   * Returns a path like "/screenshots/<uuid>.jpg" that the API serves at root.
   *
   * @param file        The File object to upload
   * @param onProgress  Optional callback with upload progress 0–100
   */
  async uploadScreenshot(
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<UploadScreenshotResult> {
    const form = new FormData();
    form.append("file", file);

    // NestJS ResponseInterceptor wraps the payload as { success, data, timestamp }
    const { data } = await apiClient.post<ApiResponse<UploadScreenshotResult>>(
      "/uploads/screenshot",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) {
            onProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        },
      },
    );

    return data.data;
  },

  /** Builds the full URL from the relative path returned by the API */
  toFullUrl(relativePath: string): string {
    const apiOrigin =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v\d+$/, "") ??
      "http://localhost:3000";
    return `${apiOrigin}${relativePath}`;
  },
};
