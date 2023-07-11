# AniList Modifier

This is a chrome extension that loads when going to the [AniList Homepage](https://anilist.co/home). I had an issue where I didn't like that when I saw a friend complete a show on my feed, I couldn't tell what they rated it without clicking through onto their list and finding the entry. Therefore here's an extension that injects a script which calls the AniList API and modifies the activity feed so that it now includes the rating.

The extension handles all rating types whether they are scaled up to 10 or 100, or even if you choose the 5 star or smiley face system.

![Example](docs/example.png)

## Download

The tool is currently available in the chrome extension store and you can install it [here](https://chrome.google.com/webstore/detail/anilist-modifier/knclmpfhlbdlndgplhbnpajhpjmklfpi).

You may also download the source files directly if you prefer by simply downloading the most recent release on this repository. Note you will only need the files `injection.js`, `background.js`, `manifest.json`, and the `icons/` and `popup/` folders. These can then be installed by enabling developer mode on the extensions tab. Click [here](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/) for further instructions if needed.
