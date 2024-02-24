function getManager() {
  const searchParams = new URLSearchParams(location.search);
  for (const [key, value] of searchParams) {
    if (key === 'list') {
      return new Manager(value);
    }
  }
}

function getPlaylistItemNodes() {
  return Array.from(document.querySelectorAll('ytd-playlist-panel-video-renderer, ytd-playlist-video-renderer'))
    .filter(el => el.offsetParent !== null);
}

function getContainerNode() {
  return document.querySelector('#container.style-scope.ytd-player');
}

function getVideoNode(containerNode) {
  return containerNode.querySelector('video.video-stream.html5-main-video');
}

function isAdVideo(containerNode) {
  return containerNode.querySelector('.ad-showing') !== null;
}

function getVideoListener(manager, videoNode) {
  return async () => {
    if (videoNode.currentTime > videoNode.duration - 2) {
      const nodes = getPlaylistItemNodes();
      const nextIndex = await manager.getNextIndex(nodes.length);
      if (nextIndex === undefined) {
        return;
      } else if (nextIndex === null) {
        videoNode.pause();
        return;
      }
      pressPlaylistItem(nodes[nextIndex]);
    }
  }
}

function pressPlaylistItem(playlistItem) {
  playlistItem.querySelector('a').click();
}

function main(lastManager) {
  const manager = getManager();
  if (!manager) {
    // not in a Youtube playlist
    return [manager, false];
  }
  let elements = [];
  const playlistObserver = new MutationObserver(() => {
    // shuffle upon detecting the list
    const newElements = getPlaylistItemNodes();
    if (elements.length === newElements.length || newElements.length === 0) {
      return;
    }
    elements = newElements;
    if (!manager.equal(lastManager)) {
      manager.shuffle(elements.length);
    }
  });
  playlistObserver.observe(document, {
    childList: true,
    subtree: true,
  });

  let videoNode;
  let videoController;
  const attachEventListener = () => {
    const containerNode = getContainerNode();
    if (!containerNode) {
      return;
    }
    if (isAdVideo(containerNode)) {
      return;
    }
    // attach event listener
    if (videoNode) {
      return;
    }
    videoNode = getVideoNode(containerNode);
    videoController = getVideoListener(manager, videoNode);
    videoNode.addEventListener('timeupdate', videoController);
  };
  attachEventListener();
  const videoObserver = new MutationObserver(attachEventListener);
  videoObserver.observe(document, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  return [manager, () => {
    playlistObserver.disconnect();
    videoObserver.disconnect();
    if (videoNode) {
      videoNode.removeEventListener('timeupdate', videoController);
    }
  }];
}

function execute() {
  let [lastManager, execution] = main();
  let currLocation = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== currLocation) {
      currLocation = location.href;
      if (execution) {
        execution();
      }
      [lastManager, execution] = main(lastManager);
    }
  });
  urlObserver.observe(document, {
    childList: true,
    subtree: true,
  });
}

execute();
