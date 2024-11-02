import path = require('path');
import rfs = require('rotating-file-stream');
import { MemoryStore, SessionOptions } from 'express-session';
import { secret } from './secret';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = 'VERY_SECRET_KEY!'; // TODO change in prod
const cookieSecret = 'VERY_SECRET_KEY!'; // TODO change in prod

const externalAuth = {
  github: {
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    accessTokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    callbackURL: 'http://localhost:8080/api/auth/external/github/callback',
    scope: 'user:email',
    clientID: secret.github.clientID,
    clientSecret: secret.github.clientSecret
  },
  google: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    accessTokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',// 'https://www.googleapis.com/oauth2/v1/userinfo',//https://openidconnect.googleapis.com/v1/userinfo',
    // callbackURL: 'https://localhost:8080/api/auth/external/google/callback/login' , // 'https://localhost:8443' ,//http://localhost:8080/api/auth/external/google/callback',
    callbackURL: process.env.CALL_BACK_URL_PORT+'/api/auth/external/google/callback/login',
   // callbackURL: 'https://reach.glaubhanta.site/api/auth/external/google/callback/login' , // 'https://localhost:8443' ,//http://localhost:8080/api/auth/external/google/callback',
     // https://reach.glaubhanta.site/api/auth/external/google/callback
    callbackAPPURL:'https://localhost:8000/',
    scope: 'openid email profile',
    clientID: secret.google.clientID,
    clientSecret: secret.google.clientSecret
  }
}

const auth0Config = {
  apiUrl: 'https://dev-5qi53ez9.eu.auth0.com/api/v2/',
  authorizeUrl: 'https://dev-5qi53ez9.eu.auth0.com/authorize',
  accessTokenUrl: 'https://dev-5qi53ez9.eu.auth0.com/oauth/token',
  userInfoUrl: 'https://dev-5qi53ez9.eu.auth0.com/authorize/userinfo',
  callbackURL: 'http://localhost:8080/api/auth0/callback',
  callbackAPPURL:'https://localhost:8000/',
  scope: 'openid email profile',
  clientID: secret.auth0.clientID,
  clientSecret: secret.auth0.clientSecret
}

const bunyanStreamSetting = process.env.LOGS || 'file';
const bunyanStdoutStream = { stream: process.stdout };
const bunyanFileStream = {
  type: 'rotating-file',
  path: path.join(process.cwd(), 'log', 'app'),
  period: '1d',
  count: 3
};

export default {
  jwtSecret,
  externalAuth,
  auth0: auth0Config,
  auth: 'jwt' as 'session' | 'jwt',
  loginThrottle: {
    maxFailures: 3,
    timeWindowInMinutes: 10
  },
  clientUrl: process.env.CALL_BACK_URL_PORT , // 'http://localhost:3000/dev', // 'http://localhost:8080'
  sessionConfig: {
    name: 'session_id',
    secret: cookieSecret,
    saveUninitialized: true,
    resave: false,
    cookie: {
      sameSite: 'lax' as 'lax',
      maxAge: 3600000
    },
    store: new MemoryStore()
  } as SessionOptions,
  morganPattern: 'common',
  morganStream: rfs.createStream('access.log', {
    interval: '1d',
    path: path.join(process.cwd(), 'log')
  }),
  bunyanStream: bunyanStreamSetting === 'stdout' ? bunyanStdoutStream : bunyanFileStream ,
  ATLAS_URI: 'mongodb+srv://fairvinay:Bench_123@cluster0.9ke4d.mongodb.net/?retryWrites=true&w=majority'
}