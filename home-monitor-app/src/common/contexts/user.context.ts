import React from 'react';

export interface IUserData {
  username?: string,
  password?: string,
  pushToken?: string
};

export type SetUserData = (newUserData: Partial<IUserData>) => void;

export interface IContext {
  userData: IUserData,
  setUserData: SetUserData
};

const setUserData: SetUserData = () => {};

const context: IContext = {
  userData: {},
  setUserData,
};

export default React.createContext(context);
