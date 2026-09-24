'use client';

import { useEffect } from 'react';
import { useForestStore } from '@/store/useForestStore';
import { forestAudio } from '@/utils/audioSynthesizer';

export function AudioController() {
  const setAudioEnergy = useForestStore((s) => s.setAudioEnergy);

  useEffect(() => {
    let animId: number;

    const updateLoop = () => {
      const energy = forestAudio.getEnergy();
      setAudioEnergy(energy);
      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [setAudioEnergy]);

  return null;
}
