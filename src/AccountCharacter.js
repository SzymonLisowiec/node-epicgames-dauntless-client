const ENDPOINT = require('../resources/Endpoint');

class AccountCharacter {

  constructor(account, data) {
    this.account = account;
    this.app = this.account.app;

    this.id = data.id,
    this.updateVersion = data.updateVersion;
    this.catalogDaoId = data.catalogDaoId;
    this.name = data.name;
    this.createdDate = new Date(data.createdAt);
    this.lastModifiedDate = new Date(data.lastModifiedDate);
    
    this.data = JSON.parse(data.data);
    // JSON.stringify(data.data, null, 2);

    this.inventory = [];

  }

  get tutorialIsFinished() {
    return this.data.HasFinishedTutorial;
  }

  get recentPlayers() {
    return JSON.parse(this.data.RecentPlayers).RecentPlayers;
  }

  get loadout() {
    return JSON.parse(this.data.LOADOUT);
  }

  get appearance() {
    return JSON.parse(this.data.AppearanceData);
  }

  async fetchInventory() {
    await this.app.http.sendPost(
      `${ENDPOINT.ACCOUNT_CHARACTER_INVENTORY}/${this.id}/dauntlessrel-0.8.0:131970`,
      `${this.app.session.tokenType} ${this.app.session.accessToken}`,
    );
    // currently I have {"code":"NONE","message":""}
  }

  async push() { // pushes changes in this.data
    await this.app.http.sendPost(
      ENDPOINT.ACCOUNT_CHARACTER,
      `${this.app.session.tokenType} ${this.app.session.accessToken}`,
      {
        characterId: this.id,
        data: JSON.stringify(this.data), 
        updateVersion: this.updateVersion,
      },
    );
    this.updateVersion += 1;
  }

}

module.exports = AccountCharacter;
