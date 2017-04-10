import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import ExplodingDots from '../containers/App';
import {BASE} from '../Constants'
import {OPERATOR_MODE, USAGE_MODE} from '../Constants';
import url from 'url';

// FIXME : Found a better and more elegant solution
function handleFullScreenToggle() {
    let currentURL = url.parse(window.parent.location.href, true);
    delete currentURL.search;

    currentURL.query.full = currentURL.query.full ? currentURL.query.full * 1 : 0;
    currentURL.query.full = currentURL.query.full ? 0 : 1;

    window.parent.location.href = url.format(currentURL);
}

storiesOf('Exploding Dots', module)
    .addDecorator((story) => (
        <div>
            <button onClick={handleFullScreenToggle}>Fullscreen</button>
            {story()}
        </div>
    ))
    .add('Mecha Freeplay', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.DISPLAY}
            usage_mode={USAGE_MODE.FREEPLAY}
            allBases={BASE.MECHA}
            base={BASE.MECHA[0]}
            placeValueSwitchVisible={false}
            placeValueOn={false}
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
            base={BASE.MECHA[4]}
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
            operandA={'12345'}
            operandB={'54321'}
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
    )).add('Division Operation', () => (
    <ExplodingDots
        operator_mode={OPERATOR_MODE.DIVIDE}
        usage_mode={USAGE_MODE.OPERATION}
        allBases={BASE.ARITHMOS}
        base={BASE.ARITHMOS[0]}
        placeValueSwitchVisible={true}
        placeValueOn={true}
        magicWandVisible={true}
    />
    ))
    .add('Division EXERCISE', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.DIVIDE}
            usage_mode={USAGE_MODE.EXERCISE}
            allBases={BASE.ARITHMOS}
            base={BASE.ARITHMOS[0]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
        />
    ))
    .add('Algebra Insighto Freeplay', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.DISPLAY}
            usage_mode={USAGE_MODE.FREEPLAY}
            allBases={BASE.ALGEBRA}
            base={BASE.ALGEBRA[0]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={false}
        />
    ))
    .add('Algebra addition Operation', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.ADDITION}
            usage_mode={USAGE_MODE.OPERATION}
            allBases={BASE.ALGEBRA}
            base={BASE.ALGEBRA[0]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
        />
    ))
    .add('Algebra subtract Operation', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.SUBTRACT}
            usage_mode={USAGE_MODE.OPERATION}
            allBases={BASE.ALGEBRA}
            base={BASE.ALGEBRA[0]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
        />
    ))
    .add('Algebra multiply Operation', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.MULTIPLY}
            usage_mode={USAGE_MODE.OPERATION}
            allBases={BASE.ALGEBRA}
            base={BASE.ALGEBRA[0]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
        />
    ))
    .add('Algebra divide Operation', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.DIVIDE}
            usage_mode={USAGE_MODE.OPERATION}
            allBases={BASE.ALGEBRA}
            base={BASE.ALGEBRA[0]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
        />
    ))
    ;

