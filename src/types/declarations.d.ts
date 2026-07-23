declare module 'passport-apple' {
  import { Strategy as PassportStrategy } from 'passport';
  export class Strategy extends PassportStrategy {
    constructor(options: any, verify?: (...args: any[]) => void);
  }
  export type VerifyCallback = (error: any, user?: Express.User, info?: any) => void;
}

declare module 'passport-google-oauth20' {
  import { Strategy as PassportStrategy } from 'passport';
  export class Strategy extends PassportStrategy {
    constructor(options: any, verify?: (...args: any[]) => void);
  }
  export type VerifyCallback = (error: any, user?: Express.User, info?: any) => void;
}

declare module 'passport-jwt' {
  import { Strategy as PassportStrategy } from 'passport';
  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken(): any;
    fromHeader(name: string): any;
    fromBodyField(field: string): any;
    fromUrlQueryParameter(param: string): any;
  };
  export class Strategy extends PassportStrategy {
    constructor(options: any, verify?: (...args: any[]) => void);
  }
}

declare module 'passport-local' {
  import { Strategy as PassportStrategy } from 'passport';
  export class Strategy extends PassportStrategy {
    constructor(options?: any, verify?: (...args: any[]) => void);
  }
}

declare module 'cookie-parser' {
  import { RequestHandler } from 'express';
  function cookieParser(secret?: string, options?: any): RequestHandler;
  export = cookieParser;
}
