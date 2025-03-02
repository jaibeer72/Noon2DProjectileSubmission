import { _decorator, CCInteger, CircleCollider2D, Collider2D, Color, Component, Contact2DType, IPhysics2DContact, Node, ParticleSystem2D } from 'cc';
import { EventsManager, GameEvents } from './EventsManager';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('Target')
export class Target extends Component {
    @property(ParticleSystem2D)
    hitEffect: ParticleSystem2D = null;
    
    @property(CCInteger)
    lifetime = 2;

    protected collider: CircleCollider2D = null;

    protected isBeingDeatroyec : boolean = false;
    protected isClaimed : boolean = false;


    onLoad() {
        this.collider = this.getComponent(CircleCollider2D);
    }

    protected onEnable(): void {
        this.scheduleOnce(this.selfDestruct, this.lifetime);
        this.hitEffect.node.active = false;
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
        this.isBeingDeatroyec = false;
        this.isClaimed = false;
    }

    protected onDisable(): void {
        this.unschedule(this.selfDestruct); 
        if (this.collider) {
            this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact) {

        console.log(otherCollider.node.name);
        
        if(otherCollider.node.name != "Ball") return; // Check if the collision is with the ball
        if(this.isClaimed) return; // Check if the target is already claimed
        if (this.hitEffect) {
            this.hitEffect.playOnLoad = true;
            this.hitEffect.node.active = true;
            this.hitEffect.color = Color.BLUE; 
        }
        this.isClaimed = true;

        EventsManager.instance.dispatchEvent(GameEvents.SCORE_UPDATED, { score: (GameManager.instance.getScore() + 1) });

        if(!this.isBeingDeatroyec){
            this.scheduleOnce(() => {
                EventsManager.instance.dispatchEvent(GameEvents.TARGET_DESTROYED, { node: this.node });
            }, this.hitEffect.duration); // Adjust the delay as needed
            this.isBeingDeatroyec = true;
        }
    }

    selfDestruct() {
        if (this.hitEffect) {
            this.hitEffect.resetSystem();
            this.hitEffect.node.active = true;
        }
        if(!this.isBeingDeatroyec){
            this.scheduleOnce(() => {
                EventsManager.instance.dispatchEvent(GameEvents.TARGET_DESTROYED, { node: this.node });
            }, this.hitEffect.duration); // Adjust the delay as needed
            this.isBeingDeatroyec = true;
        }
    }
}


