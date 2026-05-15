import { useEffect, useId, useState } from "react";

declare global {
  interface Window {
    ktt10?: {
      setup: (config: Record<string, unknown>) => void;
      open?: () => void;
    };
  }
}

const SCRIPT_ID = "chatbot-builder-webchat-script";
const SCRIPT_SRC = "https://app.chatgptbuilder.io/webchat/plugin.js?v=6";

type ChatbotBuilderWebchatProps = {
  accountId: string;
  webchatId?: string;
  color?: string;
  headerTitle?: string;
};

export function ChatbotBuilderWebchat({
  accountId,
  webchatId,
  color = "#ff4d1d",
  headerTitle = "OnnetPC assistant",
}: ChatbotBuilderWebchatProps) {
  const reactId = useId().replace(/:/g, "");
  const elementId = `chatbot-builder-${reactId}`;
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!accountId) {
      setLoadError(true);
      return;
    }

    let cancelled = false;

    const setupWebchat = () => {
      if (cancelled || !window.ktt10) return;

      const config: Record<string, unknown> = {
        accountId,
        color,
        type: "container",
        element: `#${elementId}`,
        headerTitle,
        hideHeader: false,
        loadMessages: true,
        showPersona: true,
      };

      if (webchatId) {
        config.id = webchatId;
      } else {
        config.pageId = accountId;
      }

      window.ktt10.setup(config);
    };

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      if (window.ktt10) {
        setupWebchat();
      } else {
        existingScript.addEventListener("load", setupWebchat, { once: true });
      }
      return () => {
        cancelled = true;
        existingScript.removeEventListener("load", setupWebchat);
      };
    }

    const parentUrl = encodeURIComponent(window.location.href);
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `${SCRIPT_SRC}&parent=${parentUrl}`;
    script.async = true;
    script.onload = setupWebchat;
    script.onerror = () => {
      if (!cancelled) setLoadError(true);
    };

    document.head.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [accountId, color, elementId, headerTitle, webchatId]);

  if (loadError) {
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center rounded-lg border border-border bg-muted/20 p-8 text-center">
        <div>
          <p className="text-lg font-bold">Chat is unavailable</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Check the Chatbot Builder webchat settings and redeploy with the public webchat IDs.
          </p>
        </div>
      </div>
    );
  }

  return <div id={elementId} className="h-full min-h-[620px] w-full overflow-hidden rounded-lg border border-border bg-card" />;
}
