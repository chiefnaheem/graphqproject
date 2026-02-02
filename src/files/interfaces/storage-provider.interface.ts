import { FileUpload } from 'graphql-upload-ts';

export interface UploadResult {
    key: string;
    size: number;
    url?: string;
}

export interface IStorageProvider {
    upload(file: FileUpload, key: string): Promise<UploadResult>;
    delete(key: string): Promise<void>;
    stat(key: string): Promise<{ size: number }>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
