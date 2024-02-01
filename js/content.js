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

function main() {
  const manager = getManager();
  if (!manager) {
    return false;
  }
  let elements = [];
  const pageObserver = new MutationObserver(() => {
    const newElements = getPlaylistItemNodes();
    if (elements.length === newElements.length || newElements.length === 0) {
      return;
    }
    elements = newElements;
    manager.shuffle(elements.length);
  });
  pageObserver.observe(document, {
    childList: true,
    subtree: true,
  });

  return () => pageObserver.disconnect();
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
