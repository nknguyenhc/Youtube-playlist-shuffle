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

  clear() {
    this.storage.setItem('');
  }

  async shuffle(numOfItems) {
    const items = this.getShuffledList(numOfItems);
    const info = await this.loadInfo();
    for (let i = 0; i < info.length; i++) {
      if (info[i].listId === this.listId) {
        if (!info[i].isEnabled) {
          return info;
        }
        info[i].shuffle = items;
        info[i].pointer = 0;
        this.storage.setItem(JSON.stringify(info));
        return info;
      }
    }
    info.push({
      listId: this.listId,
      isEnabled: true,
      isLoop: true,
      shuffle: items,
      pointer: 0,
    });
    this.storage.setItem(JSON.stringify(info));
    return info
  }

  getShuffledList(numOfItems) {
    const items = Array.from(Array(numOfItems).keys());
    let currentIndex = numOfItems;
    while (currentIndex > 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [items[currentIndex], items[randomIndex]] = [items[randomIndex], items[currentIndex]];
    }
    return items;
  }

  async getNextIndex() {
    const info = await this.loadInfo();
    for (let i = 0; i < info.length; i++) {
      if (info[i].listId === this.listId) {
        if (!info[i].isEnabled) {
          // do not manipulate the DOM
          return undefined;
        }
        if (!info[i].isLoop && info[i].shuffle.length === info[i].pointer) {
          // stop the playlist
          return null;
        }
        // manipulate the DOM
        if (info[i].pointer === info[i].shuffle.length) {
          info[i].pointer = 0;
        }
        const result = info[i].shuffle[info[i].pointer];
        info[i].pointer = info[i].isLoop ? (info[i].pointer + 1) % info[i].shuffle.length : info[i].pointer + 1;
        this.storage.setItem(JSON.stringify(info));
        return result;
      }
    }
  }

  equal(item) {
    if (!(item instanceof Manager)) {
      return false;
    }
    return this.listId === item.listId;
  }
}
