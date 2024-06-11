# Contributing to MailFlare

## Local Development

To develop this extension locally with features like Auto Refresh and Hot Module Reload, follow these steps:

- Install Node.js (the automated build workflow uses Node.js v20) and pnpm (with `npm install -g pnpm`)
- Clone the repository: `git clone https://github.com/curetix/mailflare-extension`
- Install the dependencies: `pnpm install`

Web:

- Run `pnpm dev:web` (Cloudflare Wrangler might prompt you to authenticated, you should be fine skipping that)
- Open MailFlare in the browser of your choice at `http://localhost:4000`

Chrome Extension:

- Run `pnpm dev`, this will create a dev version of the extension in the `build/chrome-mv3-dev` folder
- In Chrome, go to **Settings**, then **Extensions** (or open `chrome://extensions` directly)
- Enable the **Developer mode** toggle (top right)
- Click **Load unpacked** and select `build/chrome-mv3-dev` inside the MailFlare project folder

Firefox Extension:

- Run `pnpm dev:firefox`, this will create a dev version of the extension in the `build/firefox-mv3-dev` folder
- In Firefox, enter `about:debugging` into the address bar
- Click **This Firefox**
- Click **Load Temporary Add-On...**
- Select `build/firefox-mv3-dev/manifest.json` inside the MailFlare project folder
  (this setting is temporary and will be reset when Firefox is closed)

## Building

1. Install Node.js (the automated build workflow uses Node.js v20) and pnpm (with `npm install -g pnpm`)
2. Clone the repository: `git clone https://github.com/curetix/mailflare-extension`
3. Install the dependencies: `pnpm install`
4. Run the build command: `pnpm build` (for Chromium), `pnpm build:firefox` (for Firefox), or `pnpm build:all` for all
   targets
5. The output will be in the folder `build/chrome-mv3-prod` or `build/firefox-mv3-prod`

Loading the extension (non-signed builds):

- Chrome
    1. Go to Settings -> Extensions
    2. Enable the **Developer mode** toggle (top right)
    3. Click **Load unpacked** and select the folder of the built extension
- Firefox
    1. Enter `about:debugging` into the address bar
    2. Click **This Firefox**
    3. Click **Load Temporary Add-On...**
    4. Navigate to the folder of the built extension and select the `manifest.json` file
    5. (This will have to be repeated every time Firefox launches)

## Project Structure

- assets/ - Assets for the GitHub repository, e.g. images in the README
- functions/ - Cloudflare pages function for proxying requests to the Cloudflare API for the web version due to CORS
- public/ - Public assets for the web version
- src/ - Main React app
    - src/background/\* - Background service worker scripts
    - src/contents/\* - Content scripts
    - src/i18n/\* - Everything around internalization, using [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n)
    - src/lib/cloudflare/\* - Cloudflare API functions
    - src/utils/\* - Various utility functions and classes
    - src/popup.tsx - Entrypoint for the extension
    - src/web.ts - Entrypoint for the web app

## Adding Translations

You are welcome to help translate MailFlare to other languages.
We use [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n) to handle translations.

In this guide we will initialize a translation to Italian (language code `it`).

1. Start `typesafe-i18n` with `pnpm run typesafe-i18n`. This will automatically update types based on the changes you're going to make.
2. Add a new folder for the translation in `src/i18n/` named the two-letter language code: `src/i18n/it/`
3. Create a `index.ts` inside the newly created folder and start with the following template:

    ```ts
    import type { Translation } from "~i18n/i18n-types";
    
    const it = {
      
    } satisfies Translation
    
    export default it;
    ```

4. Copy all translation strings from one of the existing translations to your newly created translation file:

   ```ts
    import type { Translation } from "~i18n/i18n-types";
    
    const it = {
        // General
        YES: "Yes",
        NO: "No",
        SAVE: "Save",
        OPEN: "Open",
        REFRESH: "Refresh",
        COPY: "Copy",
        INFO: "Info",
   
        // ...
    } satisfies Translation
    
    export default it;
    ```

5. Now you can translate all strings to your chosen language.
6. Add a new key to the base translation file `src/i18n/en/index.ts`:

   ```ts
   const en = {
     // ...
     LANGUAGE: "Language",
     LANGUAGE_DESC: "Choose a language for the UI",
     LANGUAGE_ENGLISH: "🇬🇧 English",
     LANGUAGE_GERMAN: "🇩🇪 German (Deutsch)",
     LANGUAGE_ITALIAN: "🇮🇹 Italian (Italiano)", // <-- add a line like this
     // ...
   }
   
   ```
   (You can find flag emojis here: https://emojipedia.org/flags)

7. Translate the new key (in this example `LANGUAGE_ITALIAN`) in all other translations. You can easily use translator
   to do this, since it's only a single word for each language.
8. Once you're done, add the language to the Language selector in the extension options
   component `src/components/settings-modal.tsx`:

   ```tsx
   // ...
   
   const settingsItems = [
     // ...
     {
       title: LL.LANGUAGE(),
       description: LL.LANGUAGE_DESC(),
       action: (
         <Select
           value={locale}
           onChange={onLocaleSelected}
           allowDeselect={false}
           data={[
             { value: "en", label: LL.LANGUAGE_ENGLISH() },
             { value: "de", label: LL.LANGUAGE_GERMAN() },
             { value: "it", label: LL.LANGUAGE_DUTCH() }, // <-- add a line like this
           ]}
         />
       ),
     },
     // ...
   ]
   
   // ...
   ```

9. You can run the web version locally (`pnpm run dev:web`) to test your changes.
10. That should be it! Feel free to commit, push and open a pull request.