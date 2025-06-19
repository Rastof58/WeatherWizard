import { useState, useEffect } from 'react';
import { getTelegramUser, getTelegramTheme, initTelegramApp } from '@/lib/telegram';

export const useTelegram = () => {
  const [user, setUser] = useState(getTelegramUser());
  const [theme, setTheme] = useState(getTelegramTheme());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initTelegramApp();
    setUser(getTelegramUser());
    setTheme(getTelegramTheme());
    setIsReady(true);
  }, []);

  return {
    user,
    theme,
    isReady,
  };
};
