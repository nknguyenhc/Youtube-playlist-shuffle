(async () => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const searchParams = new URL(tab.url).searchParams;
  let manager;
  for (const [key, value] in searchParams) {
    if (key === 'list') {
      manager = new Manager(value);
    }
  }
})();
