'use client'

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';

import Loader from '@/components/lottie/Loader.json';

interface Props {
  size?: number;
}

const CircleLoader: React.FC<Props> = ({ size = 400 }) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if(!isMounted) {
    return null;
  }
  const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

  return <Lottie animationData={Loader} loop={true} autoplay={true} style={{ width: size, height: size, padding: 0, margin: 0 , alignSelf: 'center'}} />;
};

export default CircleLoader;