class Manager {
  listId;
  storage;

  static infoKey = 'playlistShuffles';

  constructor(listId, isPopup) {
    this.listId = listId;
    if (isPopup) {
      this.storage = {
        async getItem(key) {
          return localStorage.getItem(key);
        },
        setItem(key, value) {
          localStorage.setItem(key, value);
        },
      };
    } else {
      this.storage = {
        async getItem(key) {
          return chrome.storage.sync.get([key])
            .then(items => items.length > 0 ? items[0] : undefined);
        },
        setItem(key, value) {
          chrome.storage.sync.set({ [key]: value });
        },
      }
    }
  }

  async loadInfo() {
    const infoString = await this.storage.getItem(Manager.infoKey);
    try {
      return this.loadInfoFromString(infoString);
    } catch (e) {
      return [{
        listId: this.listId,
      }];
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

  async saveIsEnabled(isEnabled) {
    const info = await this.loadInfo();
    for (let i = 0; i < info.length; i++) {
      if (info[i].listId === this.listId) {
        info[i].isEnabled = isEnabled;
        this.storage.setItem(Manager.infoKey, JSON.stringify(info));
        return info;
      }
    }
    info.push({
      listId: this.listId,
      isEnabled: isEnabled,
    });
    this.storage.setItem(Manager.infoKey, JSON.stringify(info));
    return info;
  }

  async saveIsLoop(isLoop) {
    const info = await this.loadInfo();
    for (let i = 0; i < info.length; i++) {
      if (info[i].listId === this.listId) {
        info[i].isLoop = isLoop;
        this.storage.setItem(Manager.infoKey, JSON.stringify(info));
        return info;
      }
    }
    info.push({
      listId: this.listId,
      isLoop: isLoop,
    });
    this.storage.setItem(Manager.infoKey, JSON.stringify(info));
    return info;
  }
}
