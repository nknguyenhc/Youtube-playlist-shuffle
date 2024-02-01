function getManager() {
  const searchParams = new URLSearchParams(location.search);
  for (const [key, value] of searchParams) {
    if (key === 'list') {
      return new Manager(value);
    }
  }
}

function getPlaylistItemNodes() {
  return Array.from(document.querySelectorAll('ytd-playlist-panel-video-renderer'));
}

function getContainerNode() {
  return document.querySelector('#container.style-scope.ytd-player');
}

function getVideoNode(containerNode) {
  return containerNode.querySelector('video.video-stream.html5-main-video');
}

function isAdVideo(containerNode) {
  return containerNode.querySelector('.ytp-heat-map') === null;
}

function getVideoListener(videoNode) {
  return () => {
    if (videoNode.currentTime > videoNode.duration - 5) {
      videoNode.pause();
    }
  }
}

function main() {
  const manager = getManager();
  if (!manager) {
    // not in a Youtube playlist
    return false;
  }
  let elements = [];
  const playlistObserver = new MutationObserver(() => {
    // shuffle upon detecting the list
    const newElements = getPlaylistItemNodes();
    if (elements.length === newElements.length || newElements.length === 0) {
      return;
    }
    elements = newElements;
    manager.shuffle(elements.length);
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
    console.log("attaching event listener");
    videoNode = getVideoNode(containerNode);
    videoController = getVideoListener(videoNode);
    videoNode.addEventListener('timeupdate', videoController);
  };
  attachEventListener();
  const videoObserver = new MutationObserver(attachEventListener);
  videoObserver.observe(document, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  return () => {
    playlistObserver.disconnect();
    videoObserver.disconnect();
    if (videoNode) {
      videoNode.removeEventListener('timeupdate', videoController);
    }
  };
}

function execute() {
  let execution = main();
  let currLocation = location.href;
  const urlObserver = new MutationObserver(() => {
    if (location.href !== currLocation) {
      currLocation = location.href;
      if (execution) {
        execution();
      }
      execution = main();
    }
  });
  urlObserver.observe(document, {
    childList: true,
    subtree: true,
  });
}

execute();
