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
            allBases={'MECHA'}
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
    .add('Mecha Exercise', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.DISPLAY}
            usage_mode={USAGE_MODE.EXERCISE}
            allBases={BASE.ARITHMOS}
            base={BASE.ARITHMOS[0]}
            operandA={'12345'}
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
            operator_mode={OPERATOR_MODE.ADD}
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
            operator_mode={OPERATOR_MODE.ADD}
            usage_mode={USAGE_MODE.EXERCISE}
            allBases={BASE.ARITHMOS}
            base={BASE.ARITHMOS[0]}
            operandA={'12345'}
            operandB={'54321'}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
            wantedResult={{
                positiveDots:[6,6,6,6,6],
                negativeDots:[0,0,0,0,0],
                positiveDivider:[0,0,0,0,0],
                negativeDivider:[0,0,0,0,0]
            }}
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
            operandA={'12345'}
            operandB={'2'}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
            wantedResult={{
                positiveDots:[2,4,6,9,0],
                negativeDots:[0,0,0,0,0],
                positiveDivider:[0,0,0,0,0],
                negativeDivider:[0,0,0,0,0]
            }}
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
            operandA={'54321'}
            operandB={'12345'}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
            wantedResult={{
                positiveDots:[4,2,0,0,0],
                negativeDots:[0,0,0,2,4],
                positiveDivider:[0,0,0,0,0],
                negativeDivider:[0,0,0,0,0]
            }}
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
            operandA={'22222'}
            operandB={'11'}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
            wantedResult={{
                positiveDots:[0,0,0,0,2],
                negativeDots:[0,0,0,0,0],
                positiveDivider:[0,0,0,2,0],
                negativeDivider:[0,0,0,0,0]
            }}
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
            operator_mode={OPERATOR_MODE.ADD}
            usage_mode={USAGE_MODE.OPERATION}
            allBases={BASE.ALGEBRA}
            base={BASE.ALGEBRA[0]}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
        />
    ))
    .add('Algebra addition Exercise', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.ADD}
            usage_mode={USAGE_MODE.EXERCISE}
            allBases={BASE.ALGEBRA}
            base={BASE.ALGEBRA[0]}
            operandA={'x4+2x3+3x2+4x+5'}
            operandB={'5x4+4x3+3x2+2x+1'}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
            wantedResult={{
                positiveDots:[6,6,6,6,6],
                negativeDots:[0,0,0,0,0],
                positiveDivider:[0,0,0,0,0],
                negativeDivider:[0,0,0,0,0]
            }}
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
    .add('Algebra subtract Exercise', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.SUBTRACT}
            usage_mode={USAGE_MODE.EXERCISE}
            allBases={BASE.ALGEBRA}
            base={BASE.ALGEBRA[0]}
            operandA={'5x4+4x3+3x2+2x+1'}
            operandB={'x4+2x3+3x2+4x+5'}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
            wantedResult={{
                positiveDots:[4,2,0,0,0],
                negativeDots:[0,0,0,2,4],
                positiveDivider:[0,0,0,0,0],
                negativeDivider:[0,0,0,0,0]
            }}
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
    .add('Algebra multiply Exercise', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.MULTIPLY}
            usage_mode={USAGE_MODE.EXERCISE}
            allBases={BASE.ALGEBRA}
            base={BASE.ALGEBRA[0]}
            operandA={'x4+2x3+3x2+4x+5'}
            operandB={'2'}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
            wantedResult={{
                positiveDots:[2,4,6,9,0],
                negativeDots:[0,0,0,0,0],
                positiveDivider:[0,0,0,0,0],
                negativeDivider:[0,0,0,0,0]
            }}
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
    .add('Algebra divide Exercise', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.DIVIDE}
            usage_mode={USAGE_MODE.EXERCISE}
            allBases={BASE.ALGEBRA}
            base={BASE.ALGEBRA[0]}
            operandA={'5x4+4x3+3x2+2x+1'}
            operandB={'x+1'}
            placeValueSwitchVisible={true}
            placeValueOn={true}
            magicWandVisible={true}
            wantedResult={{
                positiveDots:[1,0,1,0,1],
                negativeDots:[0,0,0,0,0],
                positiveDivider:[0,4,0,2,0],
                negativeDivider:[0,0,0,0,0]
            }}
        />
    ))
    ;

