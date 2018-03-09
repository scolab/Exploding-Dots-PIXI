// IMPORTANT
// ---------
// This is an auto generated file with React CDK.
// Do not modify this file.

// import { configure } from '@kadira/storybook';
import { configure, addDecorator } from '@storybook/react';
import backgroundColor from 'react-storybook-decorator-background';

addDecorator(backgroundColor(['#bce3d5']));

function loadStories() {
  require('../src/stories/index.tsx');
}

configure(loadStories, module);
