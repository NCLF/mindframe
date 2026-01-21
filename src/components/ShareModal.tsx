'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Check, Send, MessageCircle, Download } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  audioBase64?: string;
  title?: string;
}

export function ShareModal({ isOpen, onClose, text, audioBase64, title = 'Поделиться' }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    };
    setIsMobile(checkMobile());
  }, []);

  const shareUrl = 'https://t.me/Mind_Frame_bot';
  const shortText = text.length > 200 ? text.slice(0, 200) + '...' : text;
  const fullShareText = `🧠 MindFrame - Моя нейро-сессия\n\n"${shortText}"\n\nПопробуй: ${shareUrl}`;

  // Download audio file
  const handleDownload = () => {
    if (!audioBase64) return;

    const link = document.createElement('a');
    link.href = `data:audio/mpeg;base64,${audioBase64}`;
    link.download = 'mindframe-session.mp3';
    link.click();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullShareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTelegramShare = () => {
    const encoded = encodeURIComponent(fullShareText);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encoded}`, '_blank');
    onClose();
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(fullShareText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
    onClose();
  };

  const handleVKShare = () => {
    const encoded = encodeURIComponent(fullShareText);
    window.open(`https://vk.com/share.php?url=${encodeURIComponent(shareUrl)}&title=${encoded}`, '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-slate-700 bg-slate-900 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Download Audio - always first, most useful action */}
          {audioBase64 && (
            <Button
              variant="outline"
              className="w-full justify-start gap-3 border-emerald-500/50 bg-emerald-900/20 hover:bg-emerald-900/40"
              onClick={handleDownload}
            >
              <Download className="h-5 w-5 text-emerald-400" />
              <span>Скачать аудио (MP3)</span>
            </Button>
          )}

          {/* Telegram */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 border-slate-700 bg-slate-800 hover:bg-slate-700"
            onClick={handleTelegramShare}
          >
            <Send className="h-5 w-5 text-blue-400" />
            <span>Telegram</span>
          </Button>

          {/* WhatsApp */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 border-slate-700 bg-slate-800 hover:bg-slate-700"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle className="h-5 w-5 text-green-400" />
            <span>WhatsApp</span>
          </Button>

          {/* VK */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 border-slate-700 bg-slate-800 hover:bg-slate-700"
            onClick={handleVKShare}
          >
            <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.523-2.049-1.709-1.033-1.005-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202-2.17-3.048-2.763-5.339-2.763-5.814 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .373.17.508.271.508.22 0 .407-.135.813-.542 1.254-1.406 2.15-3.574 2.15-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.49-.085.744-.576.744z"/>
            </svg>
            <span>ВКонтакте</span>
          </Button>

          {/* Copy */}
          <Button
            variant="outline"
            className="w-full justify-start gap-3 border-slate-700 bg-slate-800 hover:bg-slate-700"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-5 w-5 text-green-400" />
                <span className="text-green-400">Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="h-5 w-5 text-slate-400" />
                <span>Скопировать текст</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
