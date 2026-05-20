'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function AnalyticsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">Business insights and predictive analytics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analytics Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This page will include advanced analytics with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Sales trends & forecasting</li>
            <li>Product performance analysis</li>
            <li>Customer behavior analytics</li>
            <li>Revenue breakdown by category</li>
            <li>Peak hours identification</li>
            <li>Payment method analysis</li>
            <li>Udhar recovery rates</li>
            <li>Predictive inventory recommendations</li>
          </ul>
          <Button className="mt-6">Generate Report</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
