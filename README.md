# Cloudflare Email Extension

![GitHub package.json version](https://img.shields.io/github/package-json/v/curetix/mailflare-extension?label=package.json)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/curetix/mailflare-extension)
![GitHub Workflow Status (with branch)](https://img.shields.io/github/actions/workflow/status/curetix/mailflare-extension/build.yml?branch=main)

This extension provides an easy way to turn [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/)
into your own private email alias service, similar to AnonAddy, SimpleLogin, and others.
No third-party services or tedious configuration of a self-hosted email server needed.

A web version is available at [mailflare.pages.dev](https://mailflare.pages.dev/)

## Screenshots

![Alias List](./assets/screen_aliases.png)
![Create Alias](./assets/screen_create_alias.png)

## Features

- Create / edit / delete aliases, edit / delete aliases in bulk
- Multiple formats for alias addresses (random characters, random words, custom), optionally prefixed with current website name
- Search aliases and their descriptions
- One-Click alias generation directly inside email input fields

Potential future features:

- Create / delete destination addresses
- Advanced login options, manually providing account ID and zone IDs to further limit the API token permissions
- Web version of the extension that can be used on any device, including offline support

# Installation

<div>
  <a
    href="https://chromewebstore.google.com/detail/mailflare-email-alias-ext/aomfbgcabccoecaoimicmmkjdmdgcfpi"
  >
    <img
      alt="Chrome Web Store"
      src="assets/chrome_web_store.png"
      height="58"
    />
  </a>
  <a href="/releases/latest">
    <img
      alt="Firefox Add-ons"
      src="assets/firefox_addons.png"
      height="58"
    />
  </a>
</div>

- Download the latest version for your browser from the [releases section](/releases/latest)
- Firefox
  - When clicking on the file, Firefox will automatically ask if you want to install the extension
  - Alternatively: right-click on the file, **Save target as**, drag-and-drop the downloaded file into Firefox
- Chrome and other Chromium browser:
  - Go to the browsers extension page, usually under [chrome://extensions](edge://extensions/)
  - Drag-and-drop the downloaded file into the list of extensions

## Project Structure

- functions/ - Cloudflare pages function for proxying requests to the Cloudflare API for the web version due to CORS
- src/ - Main React app
  - src/popup.tsx - Entrypoint for the extension
  - src/web.ts - Entrypoint for the web app

## Limitations

See [this page](https://developers.cloudflare.com/email-routing/postmaster/#known-limitations):

- "Email Routing does not forward non-delivery reports to the original sender. This means the sender will not receive a notification indicating that the email did not reach the intended destination."
- "Email Routing does not support sending or replying from your Cloudflare domain."
- "Subdomains cannot use Email Routing to forward emails, unless they are part of an Enterprise account."

Additionally, there is a [limit of 200 email rules (aliases) and 200 destination addresses](https://developers.cloudflare.com/email-routing/limits/#rules-and-addresses) per domain.

## Create a Cloudflare API token

1. Create a Cloudflare account, add the domain(s) you want to use and enable Email Routing for the domain(s)
2. Go to [this page](https://dash.cloudflare.com/profile/api-tokens)
3. Click "Create Token"
4. Select "Create Custom Token"
5. Choose a name, like "Email Extension"
6. Configure the following permissions (explained in the next section):
   - Account | Email Routing Addresses | Read
   - Zone | Email Routing Rules | Edit
   - Zone | Zone | Read
7. Set "Account Resources" to your account
8. Set "Zone Resources" to "All zones" or select the zone you want to use
9. Configure "Client IP Address Filtering" and "TTL" if you want to
10. Click "Continue to summary" and then "Create token"
11. Copy the generated API key

Your API key is stored locally in your browser and is used to directly communicate with the Cloudflare API.

### Permissions explained

- **Account | Email Routing Addresses | Read** - Listing of destination email addresses
- **Zone | Email Routing Rules | Edit** - Listing, creating, editing and deleting of email rules (aliases)
- **Zone | Zone | Read** - Listing of all the zones in your Cloudflare account (or the zone you select in the "Zone Resources" section)

## Build instructions

1. Install NodeJS (the automated build workflow uses NodeJS version 18) and yarn (with `npm install -g yarn`)
2. Clone the repository: `git clone https://github.com/curetix/mailflare-extension`
3. Install the dependencies: `yarn install`
4. Run the build command: `yarn build` (for Chromium / Manifest V3), `yarn build:firefox` (for Firefox / Manifest V2)
5. The output will be in the folder `build/chrome-mv3-prod` or `build/firefox-mv2-prod`

Loading the extension:

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

## Built with

- [Plasmo](https://github.com/PlasmoHQ/plasmo)
- [React](https://github.com/facebook/react)
- [Mantine UI](https://github.com/mantinedev/mantine)
- [TanStack Query](https://github.com/TanStack/query)
