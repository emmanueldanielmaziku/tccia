"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode, useEffect, useState } from "react";
import useLangState from "../services/LanguageState";

export default function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { language } = useLangState();
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    const loadMessages = async () => {
      const messages = await import(
        `../messages/${language.toLowerCase()}.json`
      );
      setMessages(messages);
    };
    loadMessages();
  }, [language]);

  if (!messages) {
    return null;
  }

  return (
    <NextIntlClientProvider locale={language.toLowerCase()} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
