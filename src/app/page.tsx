'use client';

import { startRendering } from '@/rendering';
import React, { useEffect, useRef } from 'react';

export default function Home() {
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const inited = useRef(false);

  useEffect(() => {
    if (!inited.current && canvasEl.current) {
      const glCtx = canvasEl.current.getContext('webgl2');
      if (glCtx) {
        startRendering(glCtx);
        inited.current = true;
      } else {
        // Do nothing
      }
    }
  });

  return (
    <main className="p-6">
      <div className="pt-6 pb-6">Get Started</div>
      <div className="bg-gray-50 border border-solid border-gray-200 w-[800px] h-[600px]">
        <canvas id="cvs" width="800" height="600" ref={canvasEl} className="w-[800px] h-[600px]"></canvas>
      </div>
    </main>
  );
}
