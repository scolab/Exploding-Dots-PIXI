import * as React from 'react';

// tslint:disable
declare module 'react' {
  interface DOMAttributes<T> {
    [propName: string]: {}
  }
}
