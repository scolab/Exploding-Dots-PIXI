
import { IMachineState} from '../reducers/DotsReducer';

export class MachineStateVO implements IMachineState {
  public operandA: string;
  public operandB: string;
  public startActivity: boolean;
  public activityStarted: boolean;
  public errorMessage: string;
  public zones: number;
}
