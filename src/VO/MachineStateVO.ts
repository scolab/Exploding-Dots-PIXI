
import { IMachineState} from '../reducers/DotsReducer';

export class MachineStateVO implements IMachineState {
  public operandA: string;
  public operandB: string;
  public activityStarted: boolean;
  public allBases: any[];
  public base: Array<number | string>;
  public baseSelectorVisible: boolean;
  public cdnBaseUrl: string;
  public errorMessage: string;
  public loginVisible: boolean;
  public magicWandIsActive: boolean;
  public magicWandVisible: boolean;
  public muted: boolean;
  public operator_mode: string;
  public placeValueOn: boolean;
  public placeValueSwitchVisible: boolean;
  public resetAction: (name) => any;
  public resetVisible: boolean;
  public startActivity: boolean;
  public successAction: (name) => any;
  public title: string;
  public usage_mode: string;
  public userMessage: string;
  public wantedResult: IWantedResult;
  public zones: number;
}