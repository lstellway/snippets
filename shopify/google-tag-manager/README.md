# Shopify - Google Tag Manager Implementation

This snippet should serve as a good generic starting point for shop owners working to integrate Google Analytics via Google Tag Manager into their Shopify store.

<br />

**Note on testing**

[Shopify custom pixels](https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/code) creates a sandboxed environment with access to [Shopify analytics standard events](https://shopify.dev/docs/api/web-pixels-api/standard-events). The sandboxed environment runs pixel code in a HTML `<iframe />`, which does not play well with Google Tag Manager's development tooling _(for debugging events)_.

As a result, confirming the installation and debugging may be a bit of a challenge. My approach has been to use the developer tools in Google Chrome to find the corresponding `<iframe />` running my pixel code and run `console.log()` commands. Eg:

```js
console.log(window.dataLayer);
```

Definitely not the most friendly, but it seems to be working. 

<br />

## Installation

<br />

**Shopify custom pixel**

Create a [Shopify custom pixel](https://help.shopify.com/en/manual/promoting-marketing/pixels/custom-pixels/code) using the code in [shopify-pixel.js](./shopify-pixel.js). Be sure to replace the generic `GTM-XXXXXXX` value with your Google Tag Manager container ID. 

> Note:<br />Your theme may override functionality, which may interfere with the execution of default Shopify events _(in my case, our theme had custom search and cart functionality, which prevented the related Shopify events from firing)_. Be sure to test your theme.

<br />

**Prepare Google Tag Manager**

Import the provided [GTM-XXXXXXX_workspace.json](./GTM-XXXXXXX_workspace.json) file into your Google Tag Manager container. 

Be sure to update the provided variables _(Google Tag ID and Google Analytics property ID)_. Links to relevant documentation have been provided in the "notes" section for many of the provided container elements.

> _Refer to the [Google documentation](https://support.google.com/tagmanager/answer/6106997?hl=en) for information on importing and exporting container data._

<br />

**Optional - Install Google Tag Manager to your theme**

There may be certain scenarios where you may need access to data the default Shopify events do not provide. In these cases, you may want to install Google Tag Manager into your theme the traditional way _(refer to the [Google documentation](https://support.google.com/tagmanager/answer/6103696?hl=en))_.

