# Youtube-playlist-shuffle

![icon](icon/icon-128.png)

Truly shuffle your Youtube playlists

## Features

Listen to Youtube music frequently? Youtube shuffling only randomises the first video, but play in order for the second video onwards.

Add this extension to your browser! We will automatically shuffle playlists.

* Generate a fixed order for one full cycle, ensuring that all songs are played within one cycle.
* Allow disabling shuffling or stop at the last song for playlists you indicate.

## Usage

1. Install this extension to your browser. If you wish to install this extension directly from this repository, you can follow installation instructions in the development section below.
2. Open your playlist on Youtube. It can be a playlist you have prepared, or a mix generated by Youtube. By default, shuffling is enabled, and will start playing random songs from the next song.
3. In the list of extensions on the top right corner of your browser, click on our icon. You can customise your choices for your current playlist from the popup.
4. To go the next song, pull the time indicator of the video to around 1s before the end. Do not pull to the very end and press next.

## Future directions

Our extension are still in early development stage, and hence is not yet able to fully control Youtube playlists. We hope that in a future version, we can:

* Control the next video of Youtube, allowing users to pull video time indicator to the very end or press next to move onto the next video in the shuffle.
* Better handling of adding or removing items from a playlist.

## Development

1. Clone this repository.

```
git clone https://github.com/nknguyenhc/Youtube-playlist-shuffle.git
```

2. On your browser, open the list of extensions by going to the following URL:

```
chrome://extensions
```

3. On the top right of your page, enable development mode.
4. On the top left of your page, click `Load unpacked` button.
5. Load the folder that contains this repository from your local computer.
6. Start development.
