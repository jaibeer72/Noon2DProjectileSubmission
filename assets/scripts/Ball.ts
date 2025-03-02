import { _decorator, CCFloat, CCInteger, Component, director, Graphics, math, Node, NodeEventType, physics, PhysicsSystem, PhysicsSystem2D, RigidBody2D, UITransform, Vec2, Vec3 } from 'cc';
import { EventsManager, GameEvents } from './EventsManager';
import { GameState } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('Ball')
export class Ball extends Component {

    @property(RigidBody2D)
    rigidBody: RigidBody2D = null;

    @property(Graphics)
    trajectoryLine : Graphics = null;

    @property(CCFloat)
    strengthScaleFactor = 1.0;

    @property(CCFloat)
    gravityScale = 1.0;

    @property(CCInteger)
    private bezzierSteps = 100;

    private isDragging : boolean = false;
    private touchStartPoint : Vec3 = Vec3.ZERO;
    private touchEndPoint : Vec3 = Vec3.ZERO; 
    private touchUIStartPoint : Vec2 = Vec2.ZERO; 
    private ballStartPosition : Vec3 = Vec3.ZERO;



    protected onEnable(): void {
        director.getScene().getChildByName('Canvas').on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        director.getScene().getChildByName('Canvas').on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        director.getScene().getChildByName('Canvas').on(Node.EventType.TOUCH_END, this.onTouchEnd, this);

        EventsManager.instance.addEventListener(GameEvents.GAME_START, this.onGameStart, this);
    }

    protected onLoad(): void {
        this.rigidBody = this.getComponent(RigidBody2D);
        this.ballStartPosition = this.node.getPosition();
    }

    protected onDisable(): void {
        EventsManager.instance.removeEventListener(GameEvents.GAME_START, this.onGameStart, this);
    }

    onGameStart= (event) => {

        if(event.detail && event.detail.from === GameState.PAUSED){
            return;
        }
            
        this.node.setPosition(this.ballStartPosition);
        this.rigidBody.linearVelocity = Vec2.ZERO;
    }


    onTouchStart(event: any) {

        if(this.isDragging) return; // already touch started

        // making sure that the touch event only starts when the touch is on the ball node
        let touchPos = event.getUILocation();
        let ballPos : Vec3 = this.node.getWorldPosition();
        let ballSize = this.node.getComponent(UITransform).contentSize; // Get Component TODO : Cache this value


        // LOL AABB Collision Detection TODO : let's make a helper function for this if time presents
        if (touchPos.x > ballPos.x - ballSize.width / 2 && touchPos.x < ballPos.x + ballSize.width / 2 &&
            touchPos.y > ballPos.y - ballSize.height / 2 && touchPos.y < ballPos.y + ballSize.height / 2) {
            this.isDragging = true;
            this.touchStartPoint = ballPos;
            this.touchUIStartPoint = touchPos; 
        }

    }

    onTouchMove(event: any) {
        if(!this.isDragging) return; 


        this.touchEndPoint = event.getUILocation();

        let force = this.computeForce(this.touchUIStartPoint.toVec3(),  this.touchEndPoint);

        this.drawTrajectory(this.touchStartPoint, force , (-10 * this.gravityScale) , this.bezzierSteps)
    }

    onTouchEnd(event: any) {
        if(!this.isDragging) return; 



        this.isDragging = false;
        this.touchEndPoint = event.getUILocation();

        let force = this.computeForce(this.touchStartPoint, this.touchEndPoint);

        this.rigidBody.applyLinearImpulseToCenter(force.toVec2(),true);
        this.trajectoryLine.clear();
    }

    drawTrajectory(startPosition: Vec3, force: Vec3, gravity: number, steps: number) {
        this.trajectoryLine.clear();

        let velocity = force.clone(); 
        let prevPoint = Vec2.ZERO; 

        this.trajectoryLine.moveTo(0, 0);

        for (let i = 0; i < steps; i++) {
            let t = i * 0.1;
            let x = prevPoint.x + velocity.x * t;
            let y = prevPoint.y + velocity.y * t + 0.5 * gravity * t * t;

            let nextPoint = new Vec3(x, y, 0);
            this.trajectoryLine.lineTo(nextPoint.x, nextPoint.y);
        }
        this.trajectoryLine.stroke();
    }


    computeForce(touchStartPoint: Vec3, touchEndPoint: Vec3): Vec3 {
        let tsp = touchStartPoint.clone(); 
        let direction = tsp.subtract(touchEndPoint).normalize();

        return direction.multiplyScalar(this.strengthScaleFactor);
    }
}


