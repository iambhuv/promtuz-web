
"use client";
import { useStore } from '@/store';
import React, { useEffect } from 'react'

function updateFavicon(count: number) {
  const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
  if (!favicon) return;

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  const img = new Image();
  img.src = favicon.href;
  img.onload = () => {
    ctx.drawImage(img, 0, 0, 64, 64);
    if (count > 0) {
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(48, 48, 16, 0, 2 * Math.PI); // Bottom right
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText((count > 9 ? '9+' : count).toString(), 48, 54); // Adjusted text position
    }
    favicon.href = canvas.toDataURL();
  };
}

const NotitificationCounter = () => {
  const notiCount = useStore(store => {
    let count = 0;
    for (const channel of Object.values(store.channels)) {
      count += channel.unread_message_count;
      if (count > 9) return 10;
    }
    return count;
  });

  useEffect(() => {
    updateFavicon(notiCount)
  }, [notiCount])

  return null;
}

export default NotitificationCounter