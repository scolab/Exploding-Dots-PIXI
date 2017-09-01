// IMPORTANT
// ---------
// This is an auto generated file with React CDK.
// Do not modify this file.

// import { configure } from '@kadira/storybook';
import { configure, addDecorator } from '@kadira/storybook';
import backgroundColor from 'react-storybook-decorator-background';

addDecorator(backgroundColor(['#F5F5F5']));

function loadStories() {
  require('../src/stories/index.tsx');
}

configure(loadStories, module);
