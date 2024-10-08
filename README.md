# Cloudflare Email Extension

![Latest GitHub release](https://img.shields.io/github/v/release/curetix/mailflare-extension)
![Chrome Web Store Version](https://img.shields.io/chrome-web-store/v/aomfbgcabccoecaoimicmmkjdmdgcfpi)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/curetix/mailflare-extension/build.yml?branch=main)

This extension provides an easy way to turn [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/)
into your own private email alias service, similar to AnonAddy, SimpleLogin, and others.
No third-party services or tedious configuration of a self-hosted email server needed.
A web version is also available at [mailflare.pages.dev](https://mailflare.pages.dev/).

Built with [React](https://github.com/facebook/react), [Plasmo](https://github.com/PlasmoHQ/plasmo),
and [Mantine UI](https://github.com/mantinedev/mantine)

## Screenshots

![Alias List](./assets/screen_aliases.png)
![Create Alias](./assets/screen_create_alias.png)

## Features

- Create / edit / delete aliases, edit / delete aliases in bulk
- Multiple formats for alias addresses (random characters, random words, custom), optionally prefixed with current
  website name
- Search aliases and their descriptions
- One-Click alias generation directly inside email input fields ([Demo GIF](./assets/screen_quick_create_button.gif))
- One-Click alias generation from the context menu ([Demo GIF](./assets/screen_context_menu.gif))

## Installation

### Chrome and other Chromium Browsers

<div>
  <a href="https://chromewebstore.google.com/detail/mailflare-email-alias-ext/aomfbgcabccoecaoimicmmkjdmdgcfpi">
    <img
      alt="Chrome Web Store"
      src="assets/chrome_web_store.png"
      height="58"
    />
  </a>
</div>

Download the extension either directly from the Chrome Web Store, or:

- Download the latest version from
  the [releases section](https://github.com/Curetix/mailflare-extension/releases/latest)
- Go to the browsers extension page, usually under [chrome://extensions](edge://extensions/)
- Drag-and-drop the downloaded file into the list of extensions

### Firefox

<div>
  <a href="https://github.com/Curetix/mailflare-extension/releases/latest">
    <img
      alt="Firefox Add-ons"
      src="assets/firefox_addons.png"
      height="58"
    />
  </a>
</div>

- Download the latest version from
  the [releases section](https://github.com/Curetix/mailflare-extension/releases/latest)
- When clicking on the file, Firefox will automatically ask if you want to install the extension
- Alternatively: right-click on the file, **Save target as**, drag-and-drop the downloaded file into Firefox
- After installing, you might have to manually enable required permissions:
    - Go to the addons page (`about:addons`)
    - Click on MailFlare
    - Go to the Permissions tab
    - Enable at least `Access your data for *://api.cloudflare.com`
    - If you don't intend to use the Quick-Create button or context menu create button, you can
      leave `Access your data for all websites` disabled

### Progressive Web App

The [web version of MailFlare](https://mailflare.pages.dev/) is a PWA and can be "installed" on any device.
Look for the installation icon displayed in your desktop browsers address bar, or the installation prompt your mobile
browser automatically shows when visiting the site.

## Limitations

See [this page](https://developers.cloudflare.com/email-routing/postmaster/#known-limitations):

- "Email Routing does not forward non-delivery reports to the original sender. This means the sender will not receive a
  notification indicating that the email did not reach the intended destination."
- "Email Routing does not support sending or replying from your Cloudflare domain."

Additionally, there is
a [limit of 200 email rules (aliases) and 200 destination addresses](https://developers.cloudflare.com/email-routing/limits/#rules-and-addresses)
per domain.

## Create a Cloudflare API token

1. Create a Cloudflare account, add the domain(s) you want to use and enable Email Routing for the domain(s)
2. Go to [this page](https://dash.cloudflare.com/profile/api-tokens)
3. Click "Create Token"
4. Select "Create Custom Token"
5. Choose a name, like "Email Extension"
6. Configure the following permissions (explained in the next section):
    - `Account | Email Routing Addresses | Read`
    - `Zone | Email Routing Rules | Edit`
    - `Zone | Zone | Read`
    - Optional: `Zone | Zone Settings | Read`
7. Set "Account Resources" to your account
8. Set "Zone Resources" to "All zones" or select the zone you want to use
9. Configure "Client IP Address Filtering" and "TTL" if you want to
10. Click "Continue to summary" and then "Create token"
11. Copy the generated API key

Your API key is stored locally in your browser and is used to directly communicate with the Cloudflare API.

### Permissions explained

- `Account | Email Routing Addresses | Read` - Listing of destination email addresses
- `Zone | Email Routing Rules | Edit` - Listing, creating, editing and deleting of email rules (aliases)
- `Zone | Zone | Read` - Listing of all the zones in your Cloudflare account (or the zone you select in the "Zone
  Resources" section)
- Optional: `Zone | Zone Settings | Read` - Checking if Email Routing is enabled and configured ("ready") for the domain

## Build instructions

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
