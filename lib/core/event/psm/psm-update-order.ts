import {CoreEvent} from "../core-event";

export class PsmUpdateOrder extends CoreEvent {

  psmResource: string;

  psmMoveAfter: string;

}
