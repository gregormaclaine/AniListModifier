# AniList Modifier

This is a chrome/firefox extension to improve your experience using [AniList Homepage](https://anilist.co/home).

**Features**:

- ⭐ Adds scores to user activity when completing or dropping anime and manga
  - Works for all rating types whether they are scaled up to 10 or 100, or the 5 star or smiley face system
- 🎨 Color codes ratings both in the activity feed and media lists
  - Colors can be calculated automatically or customised to your preference
- ⏫ Automatically scrolls to top of page when the activity feed does not populate
- 💎 All features can be enabled or disabled independently via the settings page

![Example](docs/example.png)

## Planned Features

- Improved **activity history** color grid on the profile page

  - Currently it is fairly unreliable and also only counts unique activities. Instead there will be a toggle to change it to count number of episodes watched.

- Entire revamp of the **list comparison page**

  - Instead of just an unsorted table, it has the potential to give a lot of insight into the similarities and differences between your and your friends' lists. The revamp would introduce a selection of graphs and charts to compare your lists as well as a more modern table to sort and filter common anime/manga.

- Improved **analytics**
  - More work can be done on the analytics collected by the extension to give a better indication to what features of the extension require the most work.

## Download

The tool is currently available in the chrome extension store and you can install it [here](https://chrome.google.com/webstore/detail/anilist-modifier/knclmpfhlbdlndgplhbnpajhpjmklfpi). It is also currently pending approval in the Firefox addons store; however, it may be ready by the time you see this.

You may also compile the most recent version yourself if you prefer. To do this you will need to download or clone this repository, and then run:

- `npm install` or `yarn install`
- `npm build` or `yarn build`

If instead you want to build this for Firefox, run the following command instead:

- `npm run build-firefox` or `yarn run build-firefox`

This will compile the typescript and move all necessary files to the `build/` folder. This folder can then be installed as an extension by enabling developer mode on the extensions tab. Click [here](https://webkul.com/blog/how-to-install-the-unpacked-extension-in-chrome/) for further instructions if needed.
