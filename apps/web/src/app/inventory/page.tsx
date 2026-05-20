'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function InventoryPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <p className="text-muted-foreground mt-2">Stock management and real-time tracking</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This page will include inventory management with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Product catalog with images</li>
            <li>Real-time stock levels</li>
            <li>Low stock alerts</li>
            <li>SKU management</li>
            <li>Batch/Expiry date tracking</li>
            <li>Stock transfer between shops</li>
            <li>Inventory reports & analytics</li>
            <li>Barcode scanning support</li>
          </ul>
          <Button className="mt-6">Add Product</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
