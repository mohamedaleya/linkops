'use client';

import { useQRCode } from 'next-qrcode';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface Props {
  url: string;
  filename?: string;
}

export default function QRCodeDisplay({ url, filename = 'qr-code' }: Props) {
  const { Canvas, SVG } = useQRCode();

  const downloadPNG = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.png`;
    a.click();
  };

  const downloadSVG = () => {
    const svgElement = document
      .getElementById('qr-svg-container')
      ?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const options = {
    level: 'M',
    margin: 2,
    scale: 4,
    width: 200,
    color: {
      dark: '#171717',
      light: '#ffffff',
    },
  };

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl">
      <div className="rounded-xl border bg-background p-4">
        <Canvas text={url} options={options} />
        <div id="qr-svg-container" className="hidden">
          <SVG text={url} options={options} />
        </div>
      </div>
      <div className="flex w-full gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={downloadPNG}
        >
          <Download className="h-4 w-4" />
          PNG
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={downloadSVG}
        >
          <Download className="h-4 w-4" />
          SVG
        </Button>
      </div>
    </div>
  );
}
