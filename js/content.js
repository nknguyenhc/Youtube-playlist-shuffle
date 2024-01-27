const manager = new Manager(getListIdFromUrl());

function getListIdFromUrl() {
  const searchParams = new URLSearchParams(location.search);
  for (const [key, value] of searchParams) {
    if (key === 'list') {
      return value;
    }
  }
}

let elements;
const pageObserver = new MutationObserver(() => {
  elements = Array.from(document.querySelectorAll('ytd-playlist-panel-video-renderer'));
  console.log(elements.length);
});
pageObserver.observe(document, {
  attributes: true,
  childList: true,
  subtree: true,
});
