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
  GAME_WIDTH = 1024,
  GAME_HEIGHT = 377,
  GAME_HEIGHT_DIVIDE = 500,
}

export type IOPERAND_POS  = 'RIGHT' | 'LEFT';

export enum OPERAND_POS {
  RIGHT = 'RIGHT',
  LEFT = 'LEFT',
}

export enum POSITION_INFO {
  DOT_RAYON = 12,
}

export enum BOX_INFO {
  BOX_WIDTH = 160,
  BOX_HEIGHT = 232,
  HALF_BOX_HEIGHT = 115,
  BOX_Y = 70,
  LEFT_GUTTER = 66,
  GUTTER_WIDTH = 23,
}

export enum MAX_DOT {
  ONLY_POSITIVE = 150,
  MIX = 75,
}

export enum ERROR_MESSAGE {
  INVALID_ENTRY = 'Entrée invalide dans les opérands',
  NO_ENOUGH_DOTS = 'Pas assez de points disponibles pour cette opération',
  ONE_BOX_AT_A_TIME = 'Une case à la fois pour les base avec un dénominateur autre que 1',
  POSITIVE_NEGATIVE_DRAG = 'Impossible de déplacer un point entre les zone positive et négative',
  BASE_X_DRAG = 'Base inconnue, on ne peut pas déplacer des points entre les zones',
  NO_OPPOSITE_DOTS = 'Aucun point à annuler',
  NO_GREATER_ZONE = 'La machine ne va pas dans des nombres plus grand',
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
