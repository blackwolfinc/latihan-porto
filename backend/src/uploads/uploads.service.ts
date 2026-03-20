import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

@Injectable()
export class UploadsService {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = join(process.cwd(), 'uploads');

    try {
      const dirs = ['images', 'documents'];
      for (const dir of dirs) {
        const dirPath = join(this.uploadDir, dir);
        if (!existsSync(dirPath)) {
          mkdirSync(dirPath, { recursive: true });
        }
      }
    } catch (err) {
      console.warn('Could not create upload directories:', err.message);
    }
  }

  uploadFile(file: Express.Multer.File, folder: string): { filename: string; url: string } {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const folderPath = join(this.uploadDir, folder);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    const filename = uniqueSuffix + ext;
    const filePath = join(folderPath, filename);

    writeFileSync(filePath, file.buffer);

    const url = `/uploads/${folder}/${filename}`;
    return { filename, url };
  }

  uploadImage(file: Express.Multer.File): { filename: string; url: string } {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files (JPEG, PNG, GIF, WebP) are allowed');
    }

    return this.uploadFile(file, 'images');
  }

  uploadDocument(file: Express.Multer.File): { filename: string; url: string } {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF, DOC, DOCX, JPEG, and PNG files are allowed');
    }

    return this.uploadFile(file, 'documents');
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  deleteFile(filename: string): { message: string } {
    const filePath = join(this.uploadDir, filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      return { message: 'File deleted successfully' };
    }
    throw new BadRequestException('File not found');
  }
}
