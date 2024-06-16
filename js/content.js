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
      const containerNode = getContainerNode();
      if (containerNode && isAdVideo(containerNode)) {
        return;
      }
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

function getNextButton() {
  return document.querySelector('a.ytp-next-button.ytp-button');
}

function pressPlaylistItem(playlistItem) {
  playlistItem.querySelector('a').click();
}

function pressNextItem(playlistItems) {
  const nextIndex = playlistItems.map(elem => elem.hasAttribute('selected')).indexOf(true) + 1;
  const nextItem = playlistItems[nextIndex];
  if (nextItem) {
    pressPlaylistItem(nextItem);
  }
}

function hideNextTooltip() {
  if (document.getElementById('yps-hide-tooltip') !== null) {
    return;
  }
  const stylesheet = document.createElement('style');
  stylesheet.innerText = `
    .ytp-tooltip.ytp-preview {
      display: none;
    };
  `;
  stylesheet.id = "yps-hide-tooltip"
  document.head.appendChild(stylesheet);
}

function disableDefaultNext(nextButton, manager) {
  const nextButtonClone = nextButton.cloneNode(true);
  nextButton.parentElement.replaceChild(nextButtonClone, nextButton);
  addNextListener(manager);
}

function addNextListener(manager) {
  const nextButton = getNextButton();
  nextButton.addEventListener('click', async () => {
    const nodes = getPlaylistItemNodes();
    const nextIndex = await manager.getNextIndex(nodes.length);
    if (nextIndex) {
      pressPlaylistItem(nodes[nextIndex]);
    } else {
      pressNextItem(nodes);
    }
  });
}

function controlNextVideo(manager) {
  let nextButton;
  const attachNextListener = () => {
    if (nextButton) {
      return;
    }
    nextButton = getNextButton();
    if (!nextButton) {
      return;
    }
    disableDefaultNext(nextButton, manager);
  }
  attachNextListener();
  const nextObserver = new MutationObserver(attachNextListener);
  nextObserver.observe(document, {
    childList: true,
    subtree: true,
  })
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
    console.log(`Reshuffling because element list length changed from ${elements.length} to ${newElements.length}`);
    elements = newElements;
    manager.shuffle(elements.length);
  });
  if (!manager.equal(lastManager) || !lastManager.hasShuffled()) {
    playlistObserver.observe(document, {
      childList: true,
      subtree: true,
    });
  } else {
    manager.simulateShuffle();
  }

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
    if (!videoNode) {
      return;
    }
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
  
  hideNextTooltip();
  controlNextVideo(manager);

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
      console.log(`Location changed from ${currLocation} to ${location.href}`);
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
