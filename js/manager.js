class Manager {
  listId;

  static infoKey = 'playlistShuffles';

  constructor(listId) {
    this.listId = listId;
  }

  loadInfo() {
    const infoString = localStorage.getItem(Manager.infoKey);
    try {
      this.loadInfoFromString(infoString);
    } catch (e) {
      return {
        listId: this.listId,
      };
    }
  }

  loadInfoFromString(infoString) {
    const infoObject = JSON.parse(infoString);
    if (Array.isArray(infoObject)) {
      return this.loadListInfoFromArray(infoObject);
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
}
