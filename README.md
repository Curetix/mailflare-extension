# Cloudflare Email Extension

This extension provides an easy-to-use way to turn Cloudflare's Email Routing into your own private email alias service for your domains, similar to AnonAddy and SimpleLogin.
No third-party services or tedious configuration of a self-hosted email server needed.


## Features

- Create / edit / delete destination addresses
- Create / edit / delete email rules (aliases)
- Multiple variants for address generation (random characters, random words, custom), prefixed with current website name possible
- One-Click alias generation directly inside email input fields (see DuckDuckGo / SimpleLogin)


## Limitations

See [this page](https://developers.cloudflare.com/email-routing/known-limitations):

- "Email Routing does not support internationalized email addresses. Email Routing only supports Internationalized domain names."
- "Email Routing does not forward non-delivery reports to the original sender. This means the sender will not receive a notification indicating that the email did not reach the intended destination."
- "Subdomains cannot use Email Routing to forward emails, unless they are part of an Enterprise account."
- "Email Routing does not support sending or replying from your Cloudflare domain."

On top of that, further limits might exist but are not known publicly. One community forum post suggests that you cannot create more than 200 rules (which are used as custom addresses).


## Create a Cloudflare API token

1. Create a Cloudflare account, add the domain(s) you want to use and enable Email Routing for the domain(s)
2. Go to [this page](https://dash.cloudflare.com/profile/api-tokens)
3. Click "Create Token"
4. Select "Create Custom Token"
5. Choose a name, like "Email Extension"
6. Configure the following permissions (explained in the next section):
    - Account | Email Routing Addresses | Edit (or Read if you do not want to add/edit/delete destination addresses from the extension)
    - Zone | Email Routing Rules | Edit
    - Zone | Zone | Read
7. Set "Account Resources" to your account
8. Set "Zone Resources" to "All zones" or select the zone you want to use
9. Configure "Client IP Address Filtering" and "TTL" if you want to
10. Click "Continue to summary" and then "Create token"
11. Copy the generated API key

Your API key is stored locally in your browser and is used to directly communicate with the Cloudflare API.


### Permissions explained

**Account | Email Routing Addresses | Edit** - Listing, creating, editing and deleting of destination email addresses. If you do not want to create/edit/delete addresses from the extension, you can also choose Read.
**Zone | Email Routing Rules | Edit** - Listing, creating, editing and deleting of email rules (aliases)
**Zone | Zone | Read** - Listing of all the zones in your Cloudflare account (or the zone you select in the "Zone Resources" section)


## Sending from alias using Email Worker (Beta)

**This is a concept in an experimental stage right now!**

Email alias services like SimpleLogin and AnonAddy allow their users to reply to emails received from their alias addresses while keeping the users main email private.
[Here is a nice explanation](https://anonaddy.com/help/replying-to-email-using-an-alias/) on how this works.

While this is [not possible](https://developers.cloudflare.com/email-routing/known-limitations/#sending-or-replying-to-an-email-from-your-cloudflare-domain) directly with Cloudflare Email Routing,
we can combine a catch-all address, an Email Worker, and an external API service like Mailjet for sending emails to achieve something similar like this.

Let's say you have the alias **john@doe.net** for your private address **johndoe@gmail.com**. You receive an email from **alice@example.com** and want to reply using your alias address.
Instead of replying directly to **alice@example.com**, you would use the address **john+alice=example.com@doe.net**.
Since you do not have a rule matching this configured, it is processed by a catch-all Email Worker. It parses the address into sender and receiver (**john@doe.net** and **alice@example.com**),
checks if **john@doe.net** is actually an alias, and forwards the email using an external API like Mailjet (which of course has to be configured for the domain **doe.net**).
Finally, **alice@example.com** will receive a reply to her email from **john@doe.net** instead of your private email address **johndoe@gmail.com**.
