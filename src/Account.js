const ENDPOINT = require('../resources/Endpoint');
const Character = require('./AccountCharacter');

class Account {

  constructor(app, data) {
    this.app = app;
    this.id = data.accountId;
    /**
     * self
     * {
     *  accountId: 'ANG5QPE56JCPDNMDLO2CWTIDQQ',
     *  email: null,
     *  username: null,
     *  preferredLanguage: null,
     *  verified: false,
     *  creationDate: '2019-05-30 00:00:00'
     * }
     */
    /**
     * stranger
     * {
     *  "accountId":"ANG5QPE56JCPDNMDLO2CWTIDQQ",
     *  "username":null,
     *  "language":null,
     *  "isSubscribed":false,
     *  "linkedAccounts": [
     *    {
     *      "accountType":"epic",
     *      "accountId":"9a1d43b1d826420e9fa393a79b74b2ff"
     *    }
     *  ]
     * }
     */
    this.linkedAccounts = data.linkedAccounts;
    this.language = data.language || data.preferredLanguage;
    this.tags = [];
    this.characters = [];
    this.balance = {
      CURRENCY_CELLDUST: 0,
      CURRENCY_PLATINUM: 12900,
    };
  }

  get character() {
    return this.characters[0] || null;
  }

  async fetchBalance() {
    const { data } = await this.app.http.sendGet(
      ENDPOINT.ACCOUNT_BALANCE,
      `${this.app.session.tokenType} ${this.app.session.accessToken}`,
    );

    this.balance = data;
  }

  async fetchTags() {
    const { data } = await this.app.http.sendGet(
      ENDPOINT.ACCOUNT_TAGS,
      `${this.app.session.tokenType} ${this.app.session.accessToken}`,
    );

    this.tags = data.tags;
  }

  async fetchCharacters() {
    const { data } = await this.app.http.sendGet(
      ENDPOINT.ACCOUNT_CHARACTER,
      `${this.app.session.tokenType} ${this.app.session.accessToken}`,
    );

    data.forEach((character) => {
      this.characters.push(new Character(this, character));
    });

  }

  static async lookup(app, accountId) {
    const { data } = await app.http.sendPost(
      `${ENDPOINT.ACCOUNT_INFO}/public`,
      `${app.session.tokenType} ${app.session.accessToken}`,
      {
        accountId,
      },
    );
    if (!data || !data.accountId) return null;
    return new this(app, data);
  }
  
}

module.exports = Account;
