/**
 * DukanAI Storage Migration Script (Epic 2, Phase 2.1.1)
 * 
 * This script migrates the old flat storage directory structure to the new
 * strictly isolated, tenant-based hierarchy.
 * 
 * OLD FORMAT: data/storage/Customers/{customerName}/*
 * NEW FORMAT: data/storage/{shopId}/Customers/{customerId}/*
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs-extra';
import * as path from 'path';

const prisma = new PrismaClient();
const OLD_STORAGE_ROOT = path.join(process.cwd(), 'data', 'storage');

async function migrateStorage() {
  console.log('Starting Enterprise Storage Migration...');
  
  const customersDir = path.join(OLD_STORAGE_ROOT, 'Customers');
  if (!(await fs.pathExists(customersDir))) {
    console.log('No old Customers directory found. Migration complete.');
    return;
  }

  const entries = await fs.readdir(customersDir);
  const manifest: Record<string, string> = {};
  let successCount = 0;
  let failCount = 0;

  for (const entry of entries) {
    const oldPath = path.join(customersDir, entry);
    const stat = await fs.stat(oldPath);
    if (!stat.isDirectory()) continue;

    // The folder name used to be the customerName
    const customerName = entry;
    
    // Find the customer in the database to map to shopId and customerId
    // If multiple customers have the same name (due to lack of isolation), we pick the first one.
    // In a real enterprise scenario, we'd use the global index JSON to map it perfectly.
    const customer = await prisma.customer.findFirst({
      where: { name: customerName }
    });

    if (!customer) {
      console.warn(`WARNING: Skipping folder '${customerName}'. No matching customer found in DB.`);
      failCount++;
      continue;
    }

    const { shopId, id: customerId } = customer;
    
    // New Path: data/storage/{shopId}/Customers/{customerId}
    const newPath = path.join(OLD_STORAGE_ROOT, shopId, 'Customers', customerId);

    try {
      await fs.ensureDir(path.dirname(newPath));
      await fs.move(oldPath, newPath, { overwrite: false });
      manifest[oldPath] = newPath;
      successCount++;
      console.log(`[SUCCESS] Moved '${customerName}' -> '${shopId}/Customers/${customerId}'`);
    } catch (e: any) {
      console.error(`[ERROR] Failed to move '${customerName}': ${e.message}`);
      failCount++;
    }
  }

  // Save manifest for potential rollback
  await fs.writeJson(path.join(OLD_STORAGE_ROOT, 'migration_manifest.json'), manifest, { spaces: 2 });
  console.log(`\nMigration complete. Success: ${successCount}, Failed: ${failCount}`);
  
  // Cleanup old global system files (they should be re-generated organically, or a more complex script would shard them)
  const systemDir = path.join(OLD_STORAGE_ROOT, 'System');
  if (await fs.pathExists(systemDir)) {
    console.log('Archiving old global System folder (customer_index.json, etc.)');
    await fs.move(systemDir, path.join(OLD_STORAGE_ROOT, 'System_Archived_PreMigration'), { overwrite: true });
  }

  await prisma.$disconnect();
}

migrateStorage().catch(e => {
  console.error('Migration failed fatally:', e);
  process.exit(1);
});
