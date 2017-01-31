import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import ExplodingDots from '../containers/App';

storiesOf('Button', module)
  .add('Exploding Dots', () => (
    <ExplodingDots />
  ))
  .add('some emojies as the text', () => (
    <Button>😀 😎 👍 💯</Button>
  ));
