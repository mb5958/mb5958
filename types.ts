
export interface ImageFile {
  name: string;
  base64: string;
  mimeType: string;
}

export interface HistoryItem {
  id: string;
  personImage: ImageFile;
  clothingImage: ImageFile;
  resultImage: string; // base64 string without prefix
}
