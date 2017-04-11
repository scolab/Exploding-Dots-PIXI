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
            operandA={'12345'}
            operandB={'2'}
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
            operandA={'54321'}
            operandB={'12345'}
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
            operandA={'22222'}
            operandB={'11'}
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
    .add('Algebra addition Exercise', () => (
        <ExplodingDots
            operator_mode={OPERATOR_MODE.ADDITION}
            usage_mode={USAGE_MODE.EXERCISE}
            allBases={BASE.ALGEBRA}
            base={BASE.ALGEBRA[0]}
            operandA={'x4+2x3+3x2+4x+5'}
            operandB={'5x4+4x3+3x2+2x+1'}
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
            operandA={'5x4+4x3+3x2+2x+1'}
            operandB={'3'}
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
        />
    ))
    ;

