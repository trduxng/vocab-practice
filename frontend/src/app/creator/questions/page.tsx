'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorQuestionsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/creator/topics'); }, [router]);
  return null;
}
