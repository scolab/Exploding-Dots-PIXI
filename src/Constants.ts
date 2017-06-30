export const BASE = {
  MECHANIA: [[1, 2], [1, 3], [1, 4], [1, 5], [1, 9], [1, 10], [1, 12], [2, 3]],
  ARITHMOS: [[1, 10]],
  ALGEBRA: [[1, 'X']],
  BASE_X: 'X',
};

export type IOPERATOR_MODE = 'DISPLAY' | 'ADD' | 'SUBTRACT' | 'MULTIPLY' | 'DIVIDE';

export const OPERATOR_MODE = {
  DISPLAY: 'DISPLAY',
  ADD: 'ADD',
  SUBTRACT: 'SUBTRACT',
  MULTIPLY: 'MULTIPLY',
  DIVIDE: 'DIVIDE',
};

export type IUSAGE_MODE = 'FREEPLAY' | 'OPERATION' | 'EXERCISE';

export const USAGE_MODE = {
  FREEPLAY: 'FREEPLAY',
  OPERATION: 'OPERATION',
  EXERCISE: 'EXERCISE',
};

export const SETTINGS = {
  GAME_WIDTH: 1024,
  GAME_HEIGHT: 377,
  GAME_HEIGHT_DIVIDE: 500,
};

export const OPERAND_POS = {
  RIGHT: 'RIGHT',
  LEFT: 'LEFT',
};

export const POSITION_INFO = {
  DOT_RAYON: 12,
};

export const BOX_INFO = {
  BOX_WIDTH: 160,
  BOX_HEIGHT: 232,
  HALF_BOX_HEIGHT: 115,
  BOX_Y: 70,
  LEFT_GUTTER: 66,
  GUTTER_WIDTH: 23,
};

export const MAX_DOT = {
  ONLY_POSITIVE: 150,
  MIX: 75,
};

export const ERROR_MESSAGE = {
  INVALID_ENTRY: 'Invalid entry in the operand',
  NO_ENOUGH_DOTS: 'Pas assez de points disponibles pour cette opération',
  ONE_BOX_AT_A_TIME: 'Une case à la fois pour les base avec un dénominateur autre que 1',
  POSITIVE_NEGATIVE_DRAG: 'Impossible de déplacer un point entre les zone positive et négative',
  BASE_X_DRAG: 'Base inconnue, on ne peut pas déplacer des points entre les zones',
  NO_OPPOSITE_DOTS: 'Aucun point à annuler',
  NO_GREATER_ZONE: 'La machine ne va pas dans des nombres plus grand',
};

export const TEXT_COPY = {
  THE_CODE_FOR: 'The code for',
  PUT: 'Put',
  IS: 'is',
  DOTS_COUNT: 'dots in the machine',
};

export type ISPRITE_COLOR = 'RED' | 'BLUE';

export const SPRITE_COLOR = {
  RED: 'RED',
  BLUE: 'BLUE',
};

export const DOT_ACTIONS = {
  NEW_DOT_FROM_CLICK: 'NEW_DOT_FROM_CLICK',
  NEW_DOT_ANTIDOT_FROM_CLICK: 'NEW_DOT_ANTIDOT_FROM_CLICK',
};

export const MOVE_IMPOSSIBLE = {
  POSITIVE_TO_NEGATIVE: 'POSITIVE_TO_NEGATIVE',
  BASE_X: 'BASE_X',
  NOT_ENOUGH_DOTS: 'NOT_ENOUGH_DOTS',
  MORE_THAN_ONE_BASE: 'MORE_THAN_ONE_BASE',
};
