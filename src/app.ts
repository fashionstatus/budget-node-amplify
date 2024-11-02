
import cors from 'cors';
import morgan from 'morgan';

import express from "express";
import {  Application, Request,  Response , NextFunction} from "express";
import {IncomingHttpHeaders} from 'http';
import session  = require('express-session');
import * as csrf from 'csurf';

import routes from './routes';
import config from './config';
import errorHandler from './utils/error-handler';
import serveIndex from './utils/serve-index';
import logger from './utils/logger';
import { User } from './models/user';
import fs  from   'fs';
import https from 'https'
import http from 'http'
import path from 'path'
import 'localstorage-polyfill'

global.localStorage = localStorage;
declare module 'express-session' {
  interface SessionData { user: User | null | undefined }
}


if (typeof localStorage === "undefined" || localStorage === null) {
   const LocalStorage = require('node-localstorage').LocalStorage;
   localStorage = new LocalStorage('./scratch');
}

localStorage.setItem('myFirstKey', 'myFirstValue');
console.log(localStorage.getItem('myFirstKey'));

const privateKey  = fs.readFileSync(path.resolve(__dirname, 'ssl.key/serveractual.key'), 'utf8'); // ./budget-node/src/
const certificate = fs.readFileSync(path.resolve(__dirname,'ssl.crt/serveractual.crt'), 'utf8'); // ./budget-node/
const credentials = {key: privateKey, cert: certificate};
const app: Application = express();

// const httpServer = http.createServer( app);
const ip = '0.0.0.0'; // '192.168.32.1';
app.use(session(config.sessionConfig));
app.use(morgan(config.morganPattern, { stream: config.morganStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(passport.initialize());
const originsWhitelist = [
  'https://192.168.1.4:8000','https://192.168.1.4:8080','http://localhost:3000',
   'https://192.168.1.7','https://192.168.1.2','https://192.168.1.3','https://192.168.1.5','https://192.168.1.6',
   'https://budget-client-407513.el.r.appspot.com', 'https://glaubhanta.site','https://www.glaubhanta.site'
];
const options: cors.CorsOptions = {
   origin:  originsWhitelist ,
  credentials:true,
  methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH','OPTIONS']
}
const crsOpt = cors(options);
app.options('*',crsOpt); // for pre-flight request for delete request's
app.use(crsOpt);
app.all('*', function(req: Request,  res: Response, next: NextFunction) {

        const origin :string = req.headers.origin !=undefined ? req.headers.origin :( req.headers.host !=undefined ? req.headers.host  :"") ;
        console.log("req.headers "+JSON.stringify(req.headers));
        let validReqOrigin = false;
        originsWhitelist.forEach((validHost, index) => {
            if((validHost.indexOf(origin) >-1 )|| ( /^http:\/\/localhost:\d+$/.test(origin)) ){
              validReqOrigin = true;
            }
        });
        if(validReqOrigin) {
	   res.header("Access-Control-Allow-Origin",origin);
           console.log("CORS allowed "+origin);
	  // console.log("CORS request body "+JSON.stringify(req['body']));
        }
        else { console.log("CORS not allowed "+origin);
	 }
        res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
	next();
    });

app.use(errorHandler());
app.use(logger.initialize());
app.use(routes);


export default app;