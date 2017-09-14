import ColorMatrixFilter = PIXI.filters.ColorMatrixFilter;
import _arrayShuffle from 'lodash/_arrayShuffle';

export const BASE: any = {
  MECHANIA: [[1, 2], [1, 3], [1, 4], [1, 5], [1, 9], [1, 10], [1, 12], [2, 3]],
  ARITHMOS: [[1, 10]],
  ALGEBRA: [[1, 'X']],
  BASE_X: 'X',
};

export type IOPERATOR_MODE = 'DISPLAY' | 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE';

export enum OPERATOR_MODE {
  DISPLAY = 'DISPLAY',
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
}

export type IUSAGE_MODE = 'FREEPLAY' | 'OPERATION' | 'EXERCISE';

export enum USAGE_MODE {
  FREEPLAY = 'FREEPLAY',
  OPERATION = 'OPERATION',
  EXERCISE = 'EXERCISE',
}

export enum SETTINGS {
  GAME_WIDTH = 950,
  GAME_HEIGHT = 325,
  GAME_HEIGHT_DIVIDE = 430,
}

export type IOPERAND_POS  = 'RIGHT' | 'LEFT';

export enum OPERAND_POS {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
}

export enum POSITION_INFO {
  DOT_RAYON = 16,
}

export enum BOX_INFO {
  BOX_WIDTH = 156,
  BOX_HEIGHT = 238,
  HALF_BOX_HEIGHT = 115,
  BOX_Y = 40,
  LEFT_GUTTER = 66,
  GUTTER_WIDTH = 10,
}

export enum MAX_DOT {
  ONLY_POSITIVE = 150,
  MIX = 75,
}

export enum ERROR_MESSAGE {
  INVALID_ENTRY = 'invalidEntry',
  NO_ENOUGH_DOTS = 'noEnoughDots',
  ONE_BOX_AT_A_TIME = 'oneBoxAtATimeMachine',
  POSITIVE_NEGATIVE_DRAG = 'positiveNegativeDrag',
  BASE_X_DRAG = 'baseXDrag',
  NO_OPPOSITE_DOTS = 'noOppositeDots',
  NO_GREATER_ZONE = 'noGreaterZone',
}

export enum TEXT_COPY {
  THE_CODE_FOR = 'The code for',
  PUT = 'Put',
  IS = 'is',
  DOTS_COUNT = 'dots in the machine',
}

export type ISPRITE_COLOR = 'RED' | 'BLUE';

export enum SPRITE_COLOR {
  RED = 'RED',
  BLUE = 'BLUE',
}

export enum DOT_ACTIONS {
  NEW_DOT_FROM_CLICK = 'NEW_DOT_FROM_CLICK',
  NEW_DOT_ANTIDOT_FROM_CLICK = 'NEW_DOT_ANTIDOT_FROM_CLICK',
  NEW_DOT_FROM_MOVE = 'NEW_DOT_FROM_MOVE',
}

export enum MOVE_IMPOSSIBLE {
  POSITIVE_TO_NEGATIVE = 'POSITIVE_TO_NEGATIVE',
  BASE_X = 'BASE_X',
  NOT_ENOUGH_DOTS = 'NOT_ENOUGH_DOTS',
  MORE_THAN_ONE_BASE = 'MORE_THAN_ONE_BASE',
}

export enum TWEEN_TIME {
  MOVE_FROM_EDGE_INTO_BOX = 0.2,
  DOT_BACK_INTO_PLACE = 0.3,
  MOVE_DOT_TO_NEW_ZONE = 0.4,
  EXPLODE_DOT = 0.4,
  DIVISION_DOT_SELECT_SCALE = 0.1,
  DIVISION_DOT_MOVE = 0.2,
  DIVISION_BALANCE_DIVIDER = 0.5,
  DIVIDER_BOX_BACK_INTO_PLACE = 0.3,
  DIVIDER_BOX_REST_TIME = 0.2,
  PROXIMITY_MANAGER_WORKING_TIME = 5,
}

const GREEN_FILTER: ColorMatrixFilter = new ColorMatrixFilter();
GREEN_FILTER.matrix = [0, 0, 0, 0, 0,
                       0, 1, 0, 0, 0,
                       0, 0, 0, 0, 0,
                       0, 0, 0, 0.5, 0];

const ORANGE_FILTER: ColorMatrixFilter = new ColorMatrixFilter();
ORANGE_FILTER.matrix = [0.9, 0, 0, 0, 0,
                      0, .51, 0, 0, 0,
                      0, 0, 0.07, 0, 0,
                      0, 0, 0, 0.5, 0];

const PURPLE_FILTER: ColorMatrixFilter = new ColorMatrixFilter();
PURPLE_FILTER.matrix = [1, 0, 0, 0, 0,
                        0, 0, 0, 0, 0,
                        0, 0, 1, 0, 0,
                        0, 0, 0, 0.5, 0];

const YELLOW_FILTER: ColorMatrixFilter = new ColorMatrixFilter();
YELLOW_FILTER.matrix = [1, 0, 0, 0, 0,
                        0, 1, 0, 0, 0,
                        0, 0, 0, 0, 0,
                        0, 0, 0, 0.5, 0];

const ACQUA_FILTER: ColorMatrixFilter = new ColorMatrixFilter();
ACQUA_FILTER.matrix = [.16, 0, 0, 0, 0,
                       0, .81, 0, 0, 0,
                       0, 0, .78, 0, 0,
                       0, 0, 0, 0.5, 0];

let COLOR_FILTERS: ColorMatrixFilter[] = [GREEN_FILTER, ORANGE_FILTER, PURPLE_FILTER, YELLOW_FILTER, ACQUA_FILTER];

export const getAColorFilter = (): ColorMatrixFilter => {
  /*if (COLOR_FILTERS.length === 0) {
    COLOR_FILTERS = [GREEN_FILTER, ORANGE_FILTER, PURPLE_FILTER, YELLOW_FILTER, ACQUA_FILTER];
    COLOR_FILTERS = _arrayShuffle(COLOR_FILTERS);
  }
  return COLOR_FILTERS.pop() as ColorMatrixFilter;*/
  const FILTER: ColorMatrixFilter = new ColorMatrixFilter();
  FILTER.matrix = [Math.random(), 0, 0, 0, 0,
                  0, Math.random(), 0, 0, 0,
                  0, 0, Math.random(), 0, 0,
                  0, 0, 0, 0.2, 0];
  return FILTER;
};
