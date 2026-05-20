'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure your DukaanAI preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settings Page</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This page will include settings for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Shop configuration</li>
            <li>User management & permissions</li>
            <li>API keys & integrations</li>
            <li>WhatsApp & SMS configuration</li>
            <li>Invoice templates</li>
            <li>Tax settings</li>
            <li>Notification preferences</li>
            <li>Backup & sync settings</li>
          </ul>
          <Button className="mt-6">Configure Settings</Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
