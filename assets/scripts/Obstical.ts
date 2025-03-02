import { _decorator, CCInteger, Component, Node } from 'cc';
import { EventsManager, GameEvents } from './EventsManager';
const { ccclass, property } = _decorator;

@ccclass('Obstical')
export class Obstical extends Component {
        @property(CCInteger)
        lifetime = 2;

        protected onEnable(): void {
            this.scheduleOnce(this.selfDestruct, this.lifetime);
        }

        protected selfDestruct() {
            EventsManager.instance.dispatchEvent(GameEvents.OBSTICAL_DESTROYED, { node: this.node });
        }
}


