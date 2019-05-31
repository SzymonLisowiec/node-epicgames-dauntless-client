const {
  Endpoints: LauncherEndpoint, Application,
} = require('epicgames-client');

const ENDPOINT = require('../../resources/Endpoint');

const Http = require('../Http');
const Account = require('../Account');

const CLIENT_AUTHORIZATION = 'YjA3MGYyMDcyOWY4NDY5M2I1ZDYyMWM5MDRmYzViYzI6SEdAWEUmVEdDeEVKc2dUIyZfcDJdPWFSbyN+Pj0+K2M2UGhSKXpYUA==';

class App extends Application {

  constructor(launcher, config) {
    super(launcher, config);
    
    this.id = 'Archon';

    this.config = {
      ...this.config,
      build: '++dauntless+rel-0.8.0-CL-131970',
      engineBuild: null,
      netCL: null,
    };
        
    this.http = new Http(this.config.http);
    this.http.setHeader('Accept-Language', this.launcher.http.getHeader('Accept-Language'));
    
    this.auth = null;
    this.session = null;
    this.account = null;
    this.character = null;

    this.features = null;

    this.launcher.on('exit', this.onExit.bind(this));

  }

  async onExit() {
    
  }

  setLanguage(language) {
    this.http.setHeader('Accept-Language', language);
  }

  async init() {

    try {
      
      const login = await this.login();
      if (!login) throw new Error('Failed to login!');
      
      this.launcher.debug.print('Dauntless: Fetching features...');
      this.features = await this.fetchFeatures();

      this.launcher.debug.print('Dauntless: Checking if account is linked to EpicGames account...');
      const accountIsLinked = await this.isAccountLinked();

      if (!accountIsLinked) {
        // TODO: link account
      }

      this.launcher.debug.print('Dauntless: Logining to game\'s service...');
      await this.gameServiceLogin();

      this.launcher.debug.print('Dauntless: ready');
      return true;

    } catch (err) {

      if (typeof err === 'object') this.launcher.debug.print(err);
      else this.launcher.debug.print(new Error(err));

    }

    return false;
  }
  
  async login(isRefresh) {

    try {

      this.launcher.debug.print(`Dauntless: ${isRefresh ? 'Exchanging refreshed access token...' : 'Exchanging access token...'}`);

      const { code } = await this.launcher.account.auth.exchange();

      if (code) {

        const { data } = await this.http.sendPost(
          LauncherEndpoint.OAUTH_TOKEN,
          `basic ${CLIENT_AUTHORIZATION}`,
          {
            grant_type: 'exchange_code',
            exchange_code: code,
            includePerms: false,
            token_type: 'eg1',
          },
          true,
          {},
          'application/x-www-form-urlencoded',
        );

        this.auth = {
          accessToken: data.access_token,
          expiresIn: data.expires_in,
          expiresAt: new Date(data.expires_at),
          tokenType: data.token_type,
          refreshToken: data.refresh_token,
          refreshExpires: data.refresh_expires,
          refreshExpiresAt: new Date(data.refresh_expires_at),
          accountId: data.account_id,
          clientId: data.client_id,
          internalClient: data.internal_client,
          clientService: data.client_service,
          app: data.pp,
          inAppId: data.in_app_id,
          deviceId: data.device_id,
        };

        this.launcher.debug.print(`Dauntless: ${isRefresh ? 'Refreshed access token exchanged!' : 'Access token exchanged!'}`);

        if (!isRefresh) {
          
          await this.http.send(
            'DELETE',
            'https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/sessions/kill?killType=OTHERS_ACCOUNT_CLIENT_SERVICE',
            `${this.auth.tokenType} ${this.auth.accessToken}`,
          );
          
        }

        return true;

      }

    } catch (err) {

      throw new Error(err);

    }

    return false;
  }

  async gameServiceLogin() {

    const { data: loginData } = await this.http.sendPost(
      ENDPOINT.LOGIN,
      `${this.auth.tokenType} ${this.auth.accessToken}`,
      {
        email: this.launcher.account.id,
        env: 'prod',
        lang: 'en',
      },
    );

    if (loginData.state !== 'OPEN') {
      throw new Error(`Cannot fetch login data. Error code: ${loginData.error_code} Message: ${loginData.message || '-'}`);
      return false;
    }

    this.launcher.debug.print('Dauntless: Making account\'s session...');
    const { data: sessionData } = await this.http.send(
      'PUT',
      `${ENDPOINT.GAMESESSION}/epic`,
      `${this.auth.tokenType} ${this.auth.accessToken}`,
    );

    if (sessionData.message !== 'OK' || !sessionData.payload) {
      // TODO
      return false;
    }

    this.session = {
      id: sessionData.payload.sessionid,
      tokenType: 'BEARER',
      accessToken: sessionData.payload.sessiontoken,
    };

    this.launcher.debug.print('Dauntless: Fetching account\'s informations...');
    const { data: accountData } = await this.http.sendGet(
      ENDPOINT.ACCOUNT_INFO,
      `${this.session.tokenType} ${this.session.accessToken}`,
    );

    this.account = new Account(this, accountData);
    
    this.launcher.debug.print('Dauntless: Fetching account\'s tags...');
    await this.account.fetchTags();

    this.launcher.debug.print('Dauntless: Fetching account\'s characters...');
    await this.account.fetchCharacters();

    await this.http.sendPost(
      `${ENDPOINT.ACCOUNT_CHARACTER}/name`,
      `${this.session.tokenType} ${this.session.accessToken}`,
      {
        characterId: this.account.character.id,
        name: '', // idk, I will try change name later
      }
    );
    
    this.launcher.debug.print('Dauntless: Fetching account\'s inventory...');
    await this.account.character.fetchInventory();
    
  }

  async fetchFeatures() {
    const { data } = await this.http.sendGet(`${ENDPOINT.FEATURES}/platform/${this.config.platform.short.toLowerCase()}`);
    if (data.message === 'OK' && data.payload) return data.payload
    return null;
  }

  async isAccountLinked(accountId) {
    const { data } = await this.http.sendGet(`${ENDPOINT.ACCOUNT}/link/epic/${accountId || this.launcher.account.id}`);
    if (data.message === 'OK' && data.payload && data.payload.isLinked === true) return true;
    return false;
  }

  lookupAccount(accountId) {
    return Account.lookup(this, accountId);
  }

  async getWelcomeMessage() {
    const { data } = await this.http.sendGet(ENDPOINT.WELCOME_MESSAGE);
    if (data.message === 'OK' && data.payload) return data.payload;
    return null;
  }

  /**
   * 
   * @param {*} tag webstore, dyes or season05_pass
   */
  async getProductsForTag(tag) {
    const { data } = await this.http.sendGet(
      `${ENDPOINT.PRODUCT}/skus/public?requiredTags=${tag}`
    );
    return data;
  }

}

module.exports = App;
