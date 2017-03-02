import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import ExplodingDots from '../containers/App';
import {BASE} from '../Constants'
import {OPERATOR_MODE, USAGE_MODE} from '../Constants';

storiesOf('Exploding Dots', module)
    .add('Mecha Freeplay', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.DISPLAY}
            usage_mode={USAGE_MODE.FREEPLAY}
            allBases={BASE.MECHA}
            base={BASE.MECHA[2]}
            placeValueSwitchVisible={false}
            placeValueOn={true}
            magicWandVisible={false}
        />
    ))
    .add('Mecha Operation', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.DISPLAY}
            usage_mode={USAGE_MODE.OPERATION}
            allBases={BASE.MECHA}
            base={BASE.MECHA[0]}
            placeValueSwitchVisible={false}
            placeValueOn={false}
            magicWandVisible={false}
        />
    ))
    .add('Insighto Freeplay', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.DISPLAY}
            usage_mode={USAGE_MODE.FREEPLAY}
            allBases={BASE.MECHA}
            base={BASE.MECHA[5]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={false}
        />
    ))
    .add('Insighto Operation', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.DISPLAY}
            usage_mode={USAGE_MODE.OPERATION}
            allBases={BASE.MECHA}
            base={BASE.MECHA[5]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={false}
        />
    ))
    .add('Arythmos addition Operation', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.ADDITION}
            usage_mode={USAGE_MODE.OPERATION}
            allBases={BASE.ARITHMOS}
            base={BASE.ARITHMOS[0]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
        />
    ))
    .add('Arythmos addition EXERCISE', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.ADDITION}
            usage_mode={USAGE_MODE.EXERCISE}
            allBases={BASE.ARITHMOS}
            base={BASE.ARITHMOS[0]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
        />
    ))
    .add('Arythmos multiply Operation', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.MULTIPLY}
            usage_mode={USAGE_MODE.OPERATION}
            allBases={BASE.ARITHMOS}
            base={BASE.ARITHMOS[0]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
        />
    ))
    .add('Arythmos multiply EXERCISE', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.MULTIPLY}
            usage_mode={USAGE_MODE.EXERCISE}
            allBases={BASE.ARITHMOS}
            base={BASE.ARITHMOS[0]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
        />
    ))
    .add('Antidotia Operation', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.SUBTRACT}
            usage_mode={USAGE_MODE.OPERATION}
            allBases={BASE.ARITHMOS}
            base={BASE.ARITHMOS[0]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
        />
    ))
    .add('Antidotia EXERCISE', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.SUBTRACT}
            usage_mode={USAGE_MODE.EXERCISE}
            allBases={BASE.ARITHMOS}
            base={BASE.ARITHMOS[0]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
        />
    ));
