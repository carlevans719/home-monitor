import { createRef } from 'react';

export const navigationRef: any = createRef();

export const navigate = (name, params) => {
  navigationRef.current?.navigate(name, params);
};
