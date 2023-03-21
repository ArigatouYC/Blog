'use strict';

const {
  PlatformType,
  ProviderType,
  ErrorCodeType
} = require('./consts.js')

const {
  AppConfig
} = require('./config.js')

const {
  Storage
} = require('./storage.js')

const {
  BridgeError
} = require('./bridge-error.js')

const {
  WeixinServer
} = require('./weixin-server.js')

const appConfig = new AppConfig()

class AccessToken extends Storage {

  constructor() {
    super('access-token', ['provider', 'appid'])
  }

  async fallback(parameters) {
    const oauthConfig = appConfig.get(parameters.dcloudAppid, parameters.provider)
    let methodName
    if (parameters.provider === ProviderType.WEIXIN_MP) {
      methodName = 'GetMPAccessTokenData'
    } else if (parameters.provider === ProviderType.WEIXIN_H5) {
      methodName = 'GetH5AccessTokenData'
    } else {
      throw new BridgeError(ErrorCodeType.SYSTEM_ERROR, "provider invalid")
    }

    const responseData = await WeixinServer[methodName](oauthConfig)

    const duration = responseData.expires_in || (60 * 60 * 2)
    delete responseData.expires_in

    return {
      value: responseData,
      duration
    }
  }
}

class UserAccessToken extends Storage {

  constructor() {
    super('user-access-token', ['provider', 'appid', 'openid'])
  }
}

class SessionKey extends Storage {

  constructor() {
    super('session-key', ['provider', 'appid', 'openid'])
  }
}

class Encryptkey extends Storage {

  constructor() {
    super('encrypt-key', ['provider', 'appid', 'openid'])
  }

  getKeyString(key) {
    return `${super.getKeyString(key)}-${key.version}`
  }

  getExpiresIn(value) {
    if (value <= 0) {
      return 60
    }
    return value
  }

  async fallback(parameters) {
    const accessToken = await Factory.Get(AccessToken, parameters)
    const userSession = await Factory.Get(SessionKey, parameters)

    const responseData = await WeixinServer.GetUserEncryptKeyData({
      openid: parameters.openid,
      access_token: accessToken.access_token,
      session_key: userSession.session_key
    })

    const keyInfo = responseData.key_info_list.find((item) => {
      return item.version = parameters.version
    })

    const value = {
      encrypt_key: keyInfo.encrypt_key,
      iv: keyInfo.iv
    }

    return {
      value,
      duration: keyInfo.expire_in
    }
  }
}

class Ticket extends Storage {

  constructor() {
    super('ticket', ['provider', 'appid'])
  }

  async fallback(parameters) {
    const accessToken = await Factory.Get(AccessToken, {
      dcloudAppid: parameters.dcloudAppid,
      provider: ProviderType.WEIXIN_H5
    })

    const responseData = await WeixinServer.GetH5TicketData(accessToken)

    const duration = responseData.expires_in || (60 * 60 * 2)
    delete responseData.expires_in
    delete responseData.errcode
    delete responseData.errmsg

    return {
      value: responseData,
      duration
    }
  }
}


const Factory = {

  async Get(T, key, fallback) {
    Factory.FixOldKey(key)
    return await Factory.MakeUnique(T).get(key, fallback)
  },

  async Set(T, key, value, expiresIn) {
    Factory.FixOldKey(key)
    await Factory.MakeUnique(T).set(key, value, expiresIn)
  },

  async Remove(T, key) {
    Factory.FixOldKey(key)
    await Factory.MakeUnique(T).remove(key)
  },

  FixOldKey(key) {
    if (!key.provider) {
      key.provider = key.platform
    }

    const configData = appConfig.get(key.dcloudAppid, key.provider)
    if (!configData) {
      throw new BridgeError(ErrorCodeType.SYSTEM_ERROR, 'appid or provider invalid')
    }
    key.appid = configData.appid
  },

  MakeUnique(T) {
    return new T()
  }
}


// exports

async function getAccessToken(key, fallback) {
  return await Factory.Get(AccessToken, key, fallback)
}

async function setAccessToken(key, value, expiresIn) {
  await Factory.Set(AccessToken, key, value, expiresIn)
}

async function removeAccessToken(key) {
  await Factory.Remove(AccessToken, key)
}

async function getUserAccessToken(key, fallback) {
  return await Factory.Get(UserAccessToken, key, fallback)
}

async function setUserAccessToken(key, value, expiresIn) {
  await Factory.Set(UserAccessToken, key, value, expiresIn)
}

async function removeUserAccessToken(key) {
  await Factory.Remove(UserAccessToken, key)
}

async function getSessionKey(key, fallback) {
  return await Factory.Get(SessionKey, key, fallback)
}

async function setSessionKey(key, value, expiresIn) {
  await Factory.Set(SessionKey, key, value, expiresIn)
}

async function removeSessionKey(key) {
  await Factory.Remove(SessionKey, key)
}

async function getEncryptKey(key, fallback) {
  return await Factory.Get(Encryptkey, key, fallback)
}

async function setEncryptKey(key, value, expiresIn) {
  await Factory.Set(Encryptkey, key, value, expiresIn)
}

async function removeEncryptKey(key) {
  await Factory.Remove(Encryptkey, key)
}

async function getTicket(key, fallback) {
  return await Factory.Get(Ticket, key, fallback)
}

async function setTicket(key, value, expiresIn) {
  await Factory.Set(Ticket, key, value, expiresIn)
}

async function removeTicket(key) {
  await Factory.Remove(Ticket, key)
}

module.exports = {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  getUserAccessToken,
  setUserAccessToken,
  removeUserAccessToken,
  getSessionKey,
  setSessionKey,
  removeSessionKey,
  getEncryptKey,
  setEncryptKey,
  removeEncryptKey,
  getTicket,
  setTicket,
  removeTicket,
  ProviderType,
  PlatformType,
  WeixinServer,
  ErrorCodeType
}
