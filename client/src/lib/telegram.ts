interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  colorScheme: 'light' | 'dark';
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

export const initTelegramApp = () => {
  if (tg) {
    tg.ready();
    tg.expand();
  }
};

export const getTelegramUser = () => {
  return tg?.initDataUnsafe?.user;
};

export const getTelegramTheme = () => {
  return {
    colorScheme: tg?.colorScheme || 'dark',
    themeParams: tg?.themeParams || {},
  };
};

export const closeTelegramApp = () => {
  if (tg) {
    tg.close();
  }
};
