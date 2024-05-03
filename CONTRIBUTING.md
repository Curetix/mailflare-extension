## Translations

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