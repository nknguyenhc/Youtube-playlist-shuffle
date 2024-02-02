(async () => {
  const [tab] = await getActiveTab();
  const tabUrl = new URL(tab.url);
  if (!isYoutubeOpen(tabUrl)) {
    hideOptions();
    return;
  }
  const searchParams = tabUrl.searchParams;
  const manager = getManager(searchParams);
  if (!manager) {
    hideOptions();
    return;
  }
  adjustOptions(manager);
  addEventListeners(manager);
})();

function getActiveTab() {
  return chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
}

function isYoutubeOpen(url) {
  return url.hostname.includes('youtube.com');
}

function getManager(searchParams) {
  for (const [key, value] of searchParams) {
    if (key === 'list') {
      return new Manager(value);
    }
  }
}

function hideOptions() {
  document.getElementById("options").style.display = "none";
  document.getElementById("message").style.display = "";
}

function getSwitchNode() {
  return document.getElementById("isOn");
}

function getLoopNode() {
  return document.getElementById("isLoop");
}

function getReshuffleNode() {
  return document.getElementById("reshuffle");
}

function getButtonNode() {
  return document.getElementById("reset");
}

async function adjustOptions(manager) {
  const isEnabled = await manager.isEnabled();
  getSwitchNode().checked = isEnabled;
  getLoopNode().checked = await manager.isLoop();
  enableOptions(isEnabled);
}

function enableOptions(isEnabled) {
  getLoopNode().disabled = !isEnabled;
  getReshuffleNode().disabled = !isEnabled;
}

function animateEnableSwitch() {
  getSwitchNode().checked = false;
  setTimeout(() => {
    getSwitchNode().checked = true;
  }, 300);
}

function addEventListeners(manager) {
  getSwitchNode().addEventListener("change", handleSwitch(manager));
  getLoopNode().addEventListener("change", handleLoop(manager));
  getReshuffleNode().addEventListener("click", handleReshuffle(manager));
  getButtonNode().addEventListener("click", handleClear(manager));
}

function handleSwitch(manager) {
  return (e) => {
    manager.saveIsEnabled(e.target.checked);
    enableOptions(e.target.checked);
  }
}

function handleLoop(manager) {
  return (e) => {
    manager.saveIsLoop(e.target.checked);
  }
}

function handleReshuffle(manager) {
  return () => {
    manager.saveIsEnabled(true);
    animateEnableSwitch();
  }
}

function handleClear(manager) {
  return () => {
    manager.clear();
    adjustOptions(manager);
  }
}
