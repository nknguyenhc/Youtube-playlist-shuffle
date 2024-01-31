(async () => {
  const [tab] = await getActiveTab();
  const searchParams = new URL(tab.url).searchParams;
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

function getButtonNode() {
  return document.getElementById("reset");
}

async function adjustOptions(manager) {
  getSwitchNode().checked = await manager.isEnabled();
  getLoopNode().checked = await manager.isLoop();
}

function addEventListeners(manager) {
  getSwitchNode().addEventListener("change", handleSwitch(manager));
  getLoopNode().addEventListener("change", handleLoop(manager));
  getButtonNode().addEventListener("click", handleClear(manager));
}

function handleSwitch(manager) {
  return (e) => {
    manager.saveIsEnabled(e.target.checked);
  }
}

function handleLoop(manager) {
  return (e) => {
    manager.saveIsLoop(e.target.checked);
  }
}

function handleClear(manager) {
  return () => {
    manager.clear();
    adjustOptions(manager);
  }
}
