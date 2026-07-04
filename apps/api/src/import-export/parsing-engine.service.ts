import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import csvParser from 'csv-parser';

@Injectable()
export class ParsingEngineService {
  private readonly logger = new Logger(ParsingEngineService.name);

  /**
   * Parses a CSV file into an array of generic JSON objects.
   * For enterprise scale, this should yield or stream, but we return chunks.
   */
  async parseCsv(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(new BadRequestException(`Failed to parse CSV: ${err.message}`)));
    });
  }

  /**
   * Parses a JSON file into an array.
   */
  async parseJson(filePath: string): Promise<any[]> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      if (!Array.isArray(data)) throw new Error('Root JSON element must be an array');
      return data;
    } catch (err) {
      throw new BadRequestException(`Failed to parse JSON: ${(err as Error).message}`);
    }
  }

  /**
   * Universal parser router.
   */
  async parseFile(filePath: string, format: string): Promise<any[]> {
    if (format.toUpperCase() === 'CSV') {
      return this.parseCsv(filePath);
    } else if (format.toUpperCase() === 'JSON') {
      return this.parseJson(filePath);
    } else {
      throw new BadRequestException(`Unsupported format: ${format}`);
    }
  }
}
