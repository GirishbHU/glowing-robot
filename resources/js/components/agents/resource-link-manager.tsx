import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Link as LinkIcon, Lock, ExternalLink, Trash2, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ResourceLink {
    id: number;
    label: string;
    url: string;
    type: string;
    provider: 'google_drive' | 'dropbox' | 'other';
}

export function ResourceLinkManager() {
    const [links, setLinks] = useState<ResourceLink[]>([]); // Todo: Fetch from API
    const [newUrl, setNewUrl] = useState('');
    const [newLabel, setNewLabel] = useState('');

    const handleAddLink = () => {
        if (!newUrl || !newLabel) return;
        // Mock add for UI demo
        setLinks([...links, {
            id: Date.now(),
            label: newLabel,
            url: newUrl,
            type: 'pitch_deck',
            provider: 'google_drive'
        }]);
        setNewUrl('');
        setNewLabel('');
    };

    return (
        <Card className="bg-slate-950 border-slate-800 text-slate-100 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Database className="w-24 h-24 text-cyan-500" />
            </div>

            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl border border-cyan-500/50">
                        <Shield className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            My Data Vault
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs">
                            Keep your files on your cloud. We only store the access links.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Privacy Warning */}
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-start gap-3">
                    <Lock className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                        <strong className="text-amber-400 block mb-1">Unicorn Protocol: Zero-Knowledge Policy</strong>
                        Your Pitch Decks and Financial Models are <strong>never</strong> uploaded to our servers.
                        Paste your shared Google Drive or Dropbox links here so the Concierge can reference them securely.
                    </p>
                </div>

                {/* Add Link Form */}
                <div className="grid gap-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Label</label>
                            <Input
                                placeholder="e.g. Series A Deck v3"
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                className="bg-slate-950 border-slate-800 focus:border-cyan-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Secure URL</label>
                            <Input
                                placeholder="https://drive.google.com/..."
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                className="bg-slate-950 border-slate-800 focus:border-cyan-500"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleAddLink}
                        disabled={!newUrl}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold"
                    >
                        <LinkIcon className="w-4 h-4 mr-2" /> Add Secure Link
                    </Button>
                </div>

                {/* Links List */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Stored Resources</h3>
                    {links.length === 0 ? (
                        <div className="text-center py-8 text-slate-600 text-sm italic border-2 border-dashed border-slate-900 rounded-xl">
                            No links in your vault yet.
                        </div>
                    ) : (
                        links.map(link => (
                            <motion.div
                                key={link.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-3 bg-slate-900/80 border border-slate-800 rounded-lg group hover:border-slate-700 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <Database className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-slate-200">{link.label}</div>
                                        <a href={link.url} target="_blank" className="text-[10px] text-cyan-500 hover:underline flex items-center gap-1">
                                            {link.url.substring(0, 30)}... <ExternalLink className="w-2 h-2" />
                                        </a>
                                    </div>
                                </div>
                                <Button size="icon" variant="ghost" className="text-slate-600 hover:text-red-400 hover:bg-red-500/10">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </motion.div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
