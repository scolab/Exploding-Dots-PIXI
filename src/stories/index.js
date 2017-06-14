import React from 'react';
import url from 'url';
import { storiesOf } from '@kadira/storybook';
import ExplodingDots from '../containers/App.client';
import { OPERATOR_MODE, USAGE_MODE, BASE } from '../Constants';

// FIXME : Found a better and more elegant solution
function handleFullScreenToggle() {
  const currentURL = url.parse(window.parent.location.href, true);
  delete currentURL.search;
  currentURL.query.full = currentURL.query.full ? currentURL.query.full * 1 : 0;
  currentURL.query.full = currentURL.query.full ? 0 : 1;
  window.parent.location.href = url.format(currentURL);
}

storiesOf('Exploding Dots', module)
    .addDecorator(story => (
      <div>
        <button onClick={handleFullScreenToggle}>Fullscreen</button>
        {story()}
      </div>
    ))
    .add('Mecha Freeplay', () => (
      <ExplodingDots
        operator_mode={OPERATOR_MODE.DISPLAY}
        usage_mode={USAGE_MODE.FREEPLAY}
        allBases={'MECHANIA'}
        base={BASE.MECHANIA[0]}
        placeValueSwitchVisible={false}
        placeValueOn={false}
        magicWandVisible={false}
      />
    ))
    .add('Mecha Operation', () => (
      <ExplodingDots
        operator_mode={OPERATOR_MODE.DISPLAY}
        usage_mode={USAGE_MODE.OPERATION}
        allBases={BASE.MECHANIA}
        base={BASE.MECHANIA[0]}
        placeValueSwitchVisible={false}
        placeValueOn={false}
        magicWandVisible={false}
      />
    ))
    .add('Mecha Exercise', () => (
      <ExplodingDots
        operator_mode={OPERATOR_MODE.DISPLAY}
        usage_mode={USAGE_MODE.EXERCISE}
        allBases={BASE.MECHANIA}
        base={BASE.MECHANIA[5]}
        operandA={"1|0|273"}
        placeValueSwitchVisible={false}
        placeValueOn={false}
        magicWandVisible={false}
      />
    ))
    .add('Insighto Freeplay', () => (
      <ExplodingDots
        operator_mode={OPERATOR_MODE.DISPLAY}
        usage_mode={USAGE_MODE.FREEPLAY}
        allBases={BASE.MECHANIA}
        base={BASE.MECHANIA[5]}
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible={false}
      />
    ))
    .add('Insighto Operation', () => (
      <ExplodingDots
        operator_mode={OPERATOR_MODE.DISPLAY}
        usage_mode={USAGE_MODE.OPERATION}
        allBases={BASE.MECHANIA}
        base={BASE.MECHANIA[4]}
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible={false}
      />
    ))
    .add('Arythmos addition Operation', () => (
      <ExplodingDots
        operator_mode={OPERATOR_MODE.ADD}
        usage_mode={USAGE_MODE.OPERATION}
        allBases={BASE.ARITHMOS}
        base={BASE.ARITHMOS[0]}
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
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
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
        wantedResult={{
          positiveDots: [6, 6, 6, 6, 6],
          negativeDots: [0, 0, 0, 0, 0],
          positiveDivider: [0, 0, 0, 0, 0],
          negativeDivider: [0, 0, 0, 0, 0],
        }}
      />
    ))
    .add('Arythmos multiply Operation', () => (
      <ExplodingDots
        operator_mode={OPERATOR_MODE.MULTIPLY}
        usage_mode={USAGE_MODE.OPERATION}
        allBases={BASE.ARITHMOS}
        base={BASE.ARITHMOS[0]}
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
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
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
        wantedResult={{
          positiveDots: [2, 4, 6, 9, 0],
          negativeDots: [0, 0, 0, 0, 0],
          positiveDivider: [0, 0, 0, 0, 0],
          negativeDivider: [0, 0, 0, 0, 0],
        }}
      />
    ))
    .add('Antidotia Operation', () => (
      <ExplodingDots
        operator_mode={OPERATOR_MODE.SUBTRACT}
        usage_mode={USAGE_MODE.OPERATION}
        allBases={BASE.ARITHMOS}
        base={BASE.ARITHMOS[0]}
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
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
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
        wantedResult={{
          positiveDots: [4, 2, 0, 0, 0],
          negativeDots: [0, 0, 0, 2, 4],
          positiveDivider: [0, 0, 0, 0, 0],
          negativeDivider: [0, 0, 0, 0, 0],
        }}
      />
    ))
    .add('Division Operation', () => (
      <ExplodingDots
        operator_mode={OPERATOR_MODE.DIVIDE}
        usage_mode={USAGE_MODE.OPERATION}
        allBases={BASE.ARITHMOS}
        base={BASE.ARITHMOS[0]}
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
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
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
        wantedResult={{
          positiveDots: [0, 0, 0, 0, 2],
          negativeDots: [0, 0, 0, 0, 0],
          positiveDivider: [0, 2, 0, 2, 0],
          negativeDivider: [0, 0, 0, 0, 0],
        }}
      />
    ))
    .add('Algebra Insighto Freeplay', () => (
      <ExplodingDots
        operator_mode={OPERATOR_MODE.DISPLAY}
        usage_mode={USAGE_MODE.FREEPLAY}
        allBases={BASE.ALGEBRA}
        base={BASE.ALGEBRA[0]}
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible={false}
      />
    ))
    .add('Algebra addition Operation', () => (
      <ExplodingDots
        operator_mode={OPERATOR_MODE.ADD}
        usage_mode={USAGE_MODE.OPERATION}
        allBases={BASE.ALGEBRA}
        base={BASE.ALGEBRA[0]}
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
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
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
        wantedResult={{
          positiveDots: [6, 6, 6, 6, 6],
          negativeDots: [0, 0, 0, 0, 0],
          positiveDivider: [0, 0, 0, 0, 0],
          negativeDivider: [0, 0, 0, 0, 0],
        }}
      />
    ))
    .add('Algebra subtract Operation', () => (
      <ExplodingDots
        operator_mode={OPERATOR_MODE.SUBTRACT}
        usage_mode={USAGE_MODE.OPERATION}
        allBases={BASE.ALGEBRA}
        base={BASE.ALGEBRA[0]}
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
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
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
        wantedResult={{
          positiveDots: [4, 2, 0, 0, 0],
          negativeDots: [0, 0, 0, 2, 4],
          positiveDivider: [0, 0, 0, 0, 0],
          negativeDivider: [0, 0, 0, 0, 0],
        }}
      />
    ))
    .add('Algebra multiply Operation', () => (
      <ExplodingDots
        operator_mode={OPERATOR_MODE.MULTIPLY}
        usage_mode={USAGE_MODE.OPERATION}
        allBases={BASE.ALGEBRA}
        base={BASE.ALGEBRA[0]}
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
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
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
        wantedResult={{
          positiveDots: [2, 4, 6, 9, 0],
          negativeDots: [0, 0, 0, 0, 0],
          positiveDivider: [0, 0, 0, 0, 0],
          negativeDivider: [0, 0, 0, 0, 0],
        }}
      />
    ))
    .add('Algebra divide Operation', () => (
      <ExplodingDots
        operator_mode={OPERATOR_MODE.DIVIDE}
        usage_mode={USAGE_MODE.OPERATION}
        allBases={BASE.ALGEBRA}
        base={BASE.ALGEBRA[0]}
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
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
        placeValueSwitchVisible
        placeValueOn
        magicWandVisible
        wantedResult={{
          positiveDots: [1, 0, 1, 0, 1],
          negativeDots: [0, 0, 0, 0, 0],
          positiveDivider: [0, 4, 0, 2, 0],
          negativeDivider: [0, 0, 0, 0, 0],
        }}
      />
    ))
    ;

