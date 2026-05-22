import { Injectable, Logger } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service'; // We will create this next
import Fuse from 'fuse.js';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  // constructor(private prisma: PrismaService) {}

  async processDocument(fileBuffer: Buffer, documentType: string) {
    this.logger.log(`Starting OCR processing for document type: ${documentType}`);
    
    // Step 1: Upload to Cloudinary (Mocked for now)
    const imageUrl = await this.uploadToCloudinary(fileBuffer);
    
    // Step 2: Call Python FastAPI Microservice for OpenCV cleanup & Tesseract OCR
    const rawOcrText = await this.callPythonOcrService(imageUrl);
    
    // Step 3: Send messy OCR text to Gemini Vision API for structured parsing
    const parsedData = await this.parseWithGemini(rawOcrText);
    
    // Step 4: Smart Matching with Inventory (Fuzzy Search)
    const matchedItems = await this.fuzzyMatchProducts(parsedData.items);
    
    // Step 5: Save everything to Prisma Database
    /*
    const document = await this.prisma.document.create({
      data: {
        type: documentType as any,
        imageUrl,
        rawOcrText,
        extractedJson: parsedData,
        status: 'COMPLETED',
        extractedItems: {
          create: matchedItems.map(item => ({
            rawText: item.rawName,
            matchedProductId: item.matchedSku || null,
            quantity: item.qty,
            unitPrice: item.price,
            totalPrice: item.qty * item.price,
            confidence: item.confidence,
          }))
        }
      }
    });
    */

    // Return the response back to the frontend dashboard
    return {
      success: true,
      message: 'Document successfully parsed and matched',
      // documentId: document.id,
      preview: {
        imageUrl,
        rawOcrText,
        parsedData,
        matchedItems
      }
    };
  }

  private async uploadToCloudinary(_buffer: Buffer): Promise<string> {
    this.logger.log('Uploading image to Cloudinary...');
    // Implementation goes here
    return 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
  }

  private async callPythonOcrService(_imageUrl: string): Promise<string> {
    this.logger.log('Calling Python FastAPI for OpenCV & Tesseract...');
    // const response = await fetch('http://python-ocr-service/scan', { method: 'POST', body: JSON.stringify({ imageUrl }) });
    return "mggi n00dles 140 QTY 2 28.00\natta ashrivad 5k QTY 1 210.00";
  }

  private async parseWithGemini(_rawText: string): Promise<any> {
    this.logger.log('Sending raw OCR text to Gemini API for JSON parsing...');
    // Example: prompt Gemini to return clean JSON array of { rawName, qty, price }
    return {
      items: [
        { rawName: 'mggi n00dles 140', qty: 2, price: 14.00 },
        { rawName: 'atta ashrivad 5k', qty: 1, price: 210.00 },
      ]
    };
  }

  private async fuzzyMatchProducts(extractedItems: any[]): Promise<any[]> {
    this.logger.log('Running Fuse.js fuzzy matching against inventory...');
    
    // Mock Inventory Database
    const inventory = [
      { id: '890125', name: 'Maggi Noodles 140g', price: 14 },
      { id: '890123', name: 'Aashirvaad Atta 5kg', price: 210 },
      { id: '890128', name: 'Parle G Biscuit', price: 10 },
    ];

    const fuse = new Fuse(inventory, { keys: ['name'], threshold: 0.4 });

    return extractedItems.map(item => {
      const results = fuse.search(item.rawName);
      if (results.length > 0) {
        const match = results[0].item;
        return {
          ...item,
          matchedSku: match.id,
          matchedName: match.name,
          confidence: 0.95
        };
      }
      return {
        ...item,
        matchedSku: null,
        matchedName: null,
        confidence: 0.2
      };
    });
  }
}
