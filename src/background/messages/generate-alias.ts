import type { PlasmoMessaging } from "@plasmohq/messaging";

import { generateAliasInBackground } from "~/background";
import { detectLocale, i18n } from "~/i18n/i18n-util";
import { loadLocale } from "~/i18n/i18n-util.sync";
import { detectBrowserLocale, getCurrentTab, sendTabMessage } from "~/utils/background";

type Request = {
  hostname: string;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type Response<T = any> = {
  success: boolean;
  message: string;
  data?: T;
};

const locale = detectLocale(detectBrowserLocale);
loadLocale(locale);
const LL = i18n()[locale];

const handler: PlasmoMessaging.MessageHandler<Request, Response> = async (req, res) => {
  console.log("Received request for background alias generation:", req.body);

  if (!req.body) return;

  const tab = await getCurrentTab();
  try {
    const alias = await generateAliasInBackground(req.body.hostname);

    await sendTabMessage(tab.id, {
      command: "showAlert",
      alert: {
        id: Date.now(),
        type: "success",
        message: LL.BG_ALERT_CREATED({ alias: alias.address }),
        timeout: 5000,
      },
    });

    return res.send({
      success: true,
      message: LL.BG_ALERT_CREATED({ alias: alias.address }),
      data: alias.address,
    });
  } catch (error: any) {
    await sendTabMessage(tab.id, {
      command: "showAlert",
      alert: {
        id: Date.now(),
        type: "error",
        message: error.message,
      },
    });

    return res.send({
      success: false,
      message: error.message,
    });
  }
};

export default handler;
