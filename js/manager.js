class Manager {
  listId;
  storage;

  static infoKey = 'playlistShuffles';

  constructor(listId) {
    this.listId = listId;
    this.storage = {
      async getItem() {
        return chrome.storage.sync.get([Manager.infoKey])
          .then(item => item[Manager.infoKey]);
      },
      setItem(value) {
        chrome.storage.sync.set({ playlistShuffles: value });
      },
    }
  }

  async loadInfo() {
    const infoString = await this.storage.getItem();
    try {
      return this.loadInfoFromString(infoString);
    } catch (e) {
      return [];
    }
  }

  loadInfoFromString(infoString) {
    const infoObject = JSON.parse(infoString);
    if (Array.isArray(infoObject)) {
      return infoObject;
    } else {
      return [];
    }
  }

  loadListInfoFromArray(array) {
    const info = array.find(x => x.listId === this.listId);
    if (info) {
      return info;
    } else {
      return {
        listId: this.listId,
      };
    }
  }

  async isEnabled() {
    const info = this.loadListInfoFromArray(await this.loadInfo());
    if (info.isEnabled) {
      return true;
    } else {
      return false;
    }
  }

  async isLoop() {
    const info = this.loadListInfoFromArray(await this.loadInfo());
    if (info.isLoop) {
      return true;
    } else {
      return false;
    }
  }

  async initialise() {
    const info = await this.loadInfo();
    console.log("info", info);
    for (let i = 0; i < info.length; i++) {
      if (info[i].listId === this.listId) {
        return;
      }
    }

    info.push({
      listId: this.listId,
      isEnabled: true,
      isLoop: true,
    });
    this.storage.setItem(JSON.stringify(info));
    return info;
  }

  async saveIsEnabled(isEnabled) {
    const info = await this.loadInfo();
    for (let i = 0; i < info.length; i++) {
      if (info[i].listId === this.listId) {
        info[i].isEnabled = isEnabled;
        this.storage.setItem(JSON.stringify(info));
        return info;
      }
    }
    info.push({
      listId: this.listId,
      isEnabled: isEnabled,
    });
    this.storage.setItem(JSON.stringify(info));
    return info;
  }

  async saveIsLoop(isLoop) {
    const info = await this.loadInfo();
    for (let i = 0; i < info.length; i++) {
      if (info[i].listId === this.listId) {
        info[i].isLoop = isLoop;
        this.storage.setItem(JSON.stringify(info));
        return info;
      }
    }
    info.push({
      listId: this.listId,
      isLoop: isLoop,
    });
    this.storage.setItem(JSON.stringify(info));
    return info;
  }
}
