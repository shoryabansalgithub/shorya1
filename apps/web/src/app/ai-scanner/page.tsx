'use client';

import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  UploadCloud, FileText, Camera, CheckCircle2, AlertCircle, 
  ScanLine, Bot, Sparkles, Box, Layers, Edit3, ArrowRight, Save, FileDown, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';

type ScanState = 'IDLE' | 'UPLOADING' | 'SCANNING' | 'MATCHING' | 'SUCCESS';

export default function AiScannerPage() {
  const [scanState, setScanState] = useState<ScanState>('IDLE');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Mock processing simulation
  const handleUpload = () => {
    setScanState('UPLOADING');
    setTimeout(() => {
      setScanState('SCANNING');
      let p = 0;
      const interval = setInterval(() => {
        p += 2;
        setProgress(p);
        if (p === 40) setScanState('MATCHING');
        if (p >= 100) {
          clearInterval(interval);
          setScanState('SUCCESS');
        }
      }, 50);
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload();
    }
  };

  const handleSave = () => {
    toast('Inventory updated & invoice saved successfully!', 'success');
    setTimeout(() => {
      setScanState('IDLE');
      setProgress(0);
    }, 2000);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] flex items-center gap-3">
            <ScanLine size={32} className="text-[#7C3AED]" />
            AI Invoice Scanner
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Digitize handwritten bills, supplier invoices, and kirana notes instantly using Gemini AI.</p>
        </div>
        <div className="bg-purple-50 text-[#7C3AED] border border-purple-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
          <Sparkles size={16} /> Beta Version
        </div>
      </div>

      <AnimatePresence mode="wait">
        {scanState === 'IDLE' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Upload Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative overflow-hidden group cursor-pointer bg-white rounded-[24px] border-2 border-dashed border-gray-200 hover:border-[#7C3AED] transition-all duration-500 flex flex-col items-center justify-center p-12 min-h-[400px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.12)]"
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange}
                accept="image/*,.pdf"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center text-[#7C3AED] group-hover:scale-110 transition-transform duration-500 mb-6 shadow-sm relative z-10">
                <UploadCloud size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2 relative z-10">Drag & Drop Bill Here</h2>
              <p className="text-sm text-gray-500 text-center max-w-xs relative z-10">Upload a handwritten bill, supplier invoice, or take a picture to digitize it.</p>
              
              <div className="flex gap-4 mt-8 relative z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:border-gray-300 transition-colors"
                >
                  <FileText size={16} /> Browse Files
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); router.push('/smart-capture'); }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#060B26] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-gray-900 transition-colors"
                >
                  <Camera size={16} /> Open Camera
                </button>
              </div>
            </div>

            {/* Info / Capabilities */}
            <div className="bg-gradient-to-br from-[#060B26] to-[#1e1b4b] rounded-[24px] p-10 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 p-8 opacity-10 blur-2xl">
                <div className="w-64 h-64 bg-[#7C3AED] rounded-full" />
              </div>
              <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <Bot size={28} className="text-[#a78bfa]" />
                Powered by Gemini Vision
              </h3>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <Edit3 size={18} className="text-[#a78bfa]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Reads Messy Handwriting</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">Understands rough kirana shorthand, cursive, and faded ink perfectly.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <ScanLine size={18} className="text-[#a78bfa]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Smart Product Matching</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">Example: "mggi 140" automatically matches to "Maggi Noodles 140g" in your inventory.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <Layers size={18} className="text-[#a78bfa]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Auto Inventory Sync</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">Calculates totals, GST, and updates your shop's stock quantities instantly.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {(scanState === 'UPLOADING' || scanState === 'SCANNING' || scanState === 'MATCHING') && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgba(15,23,42,0.04)] relative overflow-hidden"
          >
            {/* Animated Laser Line */}
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent shadow-[0_0_15px_#7C3AED] z-20"
            />
            
            <div className="relative mb-8">
              <div className="w-32 h-32 rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center relative z-10 overflow-hidden">
                <FileText size={48} className="text-gray-300" />
                <div className="absolute inset-0 bg-purple-500/10 mix-blend-overlay" />
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute -inset-4 border border-dashed border-[#7C3AED]/30 rounded-[2rem] z-0"
              />
            </div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {scanState === 'UPLOADING' && 'Uploading Document...'}
              {scanState === 'SCANNING' && 'OpenCV Cleanup & OCR Extraction...'}
              {scanState === 'MATCHING' && 'Gemini AI Matching Products...'}
            </h3>
            
            <div className="w-64 h-2 bg-gray-100 rounded-full mt-6 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-[#7C3AED] to-[#9333EA]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm font-bold text-[#7C3AED] mt-3">{progress}%</p>
          </motion.div>
        )}

        {scanState === 'SUCCESS' && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Top Stats Banner */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-600" size={24} />
                <div>
                  <h3 className="text-green-800 font-bold">Successfully Digitized</h3>
                  <p className="text-green-600 text-xs">AI extracted 4 items with 98% confidence.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setScanState('IDLE'); setProgress(0); }}
                  className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Scan Another
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-[#060B26] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-900 transition-colors"
                >
                  <Save size={16} /> Save to Database
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* Left Column: Editable OCR Matches */}
              <Card className="p-6 rounded-[24px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Sparkles size={20} className="text-[#7C3AED]" /> Smart Validation System
                </h2>
                
                <div className="space-y-4">
                  {/* Mock Item 1 */}
                  <div className="border border-purple-100 bg-purple-50/30 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">OCR Extracted Text</span>
                        <code className="text-sm font-mono text-purple-900 bg-white px-2 py-1 rounded border border-purple-100">"mggi n00dles 140" - QTY: 2 - ₹28</code>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">98% Match</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="text-[#7C3AED]" size={18} />
                        <div>
                          <p className="font-bold text-gray-800 text-sm">Maggi Noodles 140g</p>
                          <p className="text-xs text-gray-500">SKU: 890125</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 text-sm">2 × ₹14 = ₹28</p>
                        <button onClick={() => toast('Edit item feature coming soon', 'info')} className="text-[#7C3AED] text-xs font-bold hover:underline">Edit</button>
                      </div>
                    </div>
                  </div>

                  {/* Mock Item 2 */}
                  <div className="border border-purple-100 bg-purple-50/30 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">OCR Extracted Text</span>
                        <code className="text-sm font-mono text-purple-900 bg-white px-2 py-1 rounded border border-purple-100">"atta ashrivad 5k" - QTY: 1 - ₹210</code>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">95% Match</span>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="text-[#7C3AED]" size={18} />
                        <div>
                          <p className="font-bold text-gray-800 text-sm">Aashirvaad Atta 5kg</p>
                          <p className="text-xs text-gray-500">SKU: 890123</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 text-sm">1 × ₹210 = ₹210</p>
                        <button onClick={() => toast('Edit item feature coming soon', 'info')} className="text-[#7C3AED] text-xs font-bold hover:underline">Edit</button>
                      </div>
                    </div>
                  </div>

                  {/* Mock Item 3 (Unmatched) */}
                  <div className="border border-orange-200 bg-orange-50/50 rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-400" />
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">OCR Extracted Text</span>
                        <code className="text-sm font-mono text-orange-900 bg-white px-2 py-1 rounded border border-orange-100">"biscuit parl" - QTY: 5 - ₹50</code>
                      </div>
                      <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                        <AlertCircle size={12} /> Needs Verification
                      </span>
                    </div>
                    <div 
                      onClick={() => toast('Product selection modal coming soon', 'info')}
                      className="bg-white border border-orange-200 rounded-lg p-3 flex justify-between items-center shadow-sm cursor-pointer hover:border-orange-400 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border border-gray-300 rounded" />
                        <div>
                          <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
                            Select Product <ArrowRight size={14} className="text-gray-400" />
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800 text-sm">₹50</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Right Column: Generated Invoice Preview */}
              <div className="space-y-6">
                <Card className="p-0 rounded-[24px] shadow-[0_4px_20px_rgba(15,23,42,0.04)] border border-gray-100 overflow-hidden bg-[#FAFAFA]">
                  <div className="bg-white p-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-bold text-gray-800">Generated Invoice Preview</h2>
                    <button 
                      onClick={() => toast('Downloading PDF...', 'info')}
                      className="text-[#7C3AED] text-sm font-bold flex items-center gap-2 hover:underline"
                    >
                      <FileDown size={16} /> Export PDF
                    </button>
                  </div>
                  
                  <div className="p-8 pb-10">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                      <div className="flex justify-between border-b border-gray-100 pb-6 mb-6">
                        <div>
                          <h2 className="text-2xl font-black text-gray-800 tracking-tight">INVOICE</h2>
                          <p className="text-xs text-gray-400 mt-1">#INV-OCR-001</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p className="font-bold text-gray-800">DukaanAI Store</p>
                          <p>20 May 2026</p>
                        </div>
                      </div>
                      
                      <table className="w-full text-sm text-left mb-6">
                        <thead className="text-xs text-gray-400 border-b border-gray-100">
                          <tr>
                            <th className="pb-3 font-medium">Item Description</th>
                            <th className="pb-3 font-medium text-center">Qty</th>
                            <th className="pb-3 font-medium text-right">Price</th>
                            <th className="pb-3 font-medium text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-700 divide-y divide-gray-50">
                          <tr>
                            <td className="py-3 font-bold">Maggi Noodles 140g</td>
                            <td className="py-3 text-center">2</td>
                            <td className="py-3 text-right">₹14.00</td>
                            <td className="py-3 text-right font-bold">₹28.00</td>
                          </tr>
                          <tr>
                            <td className="py-3 font-bold">Aashirvaad Atta 5kg</td>
                            <td className="py-3 text-center">1</td>
                            <td className="py-3 text-right">₹210.00</td>
                            <td className="py-3 text-right font-bold">₹210.00</td>
                          </tr>
                          <tr>
                            <td className="py-3 font-bold text-orange-600">Pending Match (biscuit)</td>
                            <td className="py-3 text-center">5</td>
                            <td className="py-3 text-right">₹10.00</td>
                            <td className="py-3 text-right font-bold">₹50.00</td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <div className="border-t border-gray-200 pt-4 flex justify-end">
                        <div className="w-1/2">
                          <div className="flex justify-between text-sm mb-2 text-gray-500">
                            <span>Subtotal</span>
                            <span>₹288.00</span>
                          </div>
                          <div className="flex justify-between text-sm mb-3 text-gray-500">
                            <span>GST (0%)</span>
                            <span>₹0.00</span>
                          </div>
                          <div className="flex justify-between text-lg font-black text-[#7C3AED] border-t border-gray-100 pt-3">
                            <span>Total</span>
                            <span>₹288.00</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <button 
                  onClick={handleSave}
                  className="w-full py-4 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white rounded-[16px] font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
                >
                  <Box size={20} /> Update Inventory & Save
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
