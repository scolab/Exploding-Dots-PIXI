import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import ExplodingDots from '../containers/App';
import {BASE} from '../Constants'

storiesOf('Button', module)
    .add('Mecha Freeplay', () => (
        <ExplodingDots base={BASE.ALL_BASE[0]}
            magicWandVisible={true}
        />
    ))
    .add('Mecha Operation', () => (
        <ExplodingDots />
    ))
    .add('Arythmos Operation', () => (
        <ExplodingDots />
    ))
    .add('some emojies as the text', () => (
        <Button>😀 😎 👍 💯</Button>
    ));
