import { _decorator, Component, director, Graphics, math, Node, NodeEventType, RigidBody2D, UITransform, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Ball')
export class Ball extends Component {

    @property(RigidBody2D)
    rigidBody: RigidBody2D = null;

    @property(Graphics)
    trajectoryLine : Graphics = null;

    @property(Number)
    strengthScaleFactor : number = 1.0;

    @property(Number)
    gravityScale : number = 1.0;


    private isDragging : boolean = false;
    private touchStartPoint : Vec2 = Vec2.ZERO;
    private touchEndPoint : Vec2 = Vec2.ZERO; 
    private bezzierSteps: number = 50;



    protected onLoad(): void {
        director.getScene().getChildByName('Canvas').on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        director.getScene().getChildByName('Canvas').on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        director.getScene().getChildByName('Canvas').on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    
    start() {
        this.rigidBody = this.getComponent(RigidBody2D);
    }



    onTouchStart(event: any) {

        if(this.isDragging) return; // already touch started

        // making sure that the touch event only starts when the touch is on the ball node
        let touchPos = event.getUILocation();
        let ballPos : Vec2 = new Vec2 (this.node.getWorldPosition().x, this.node.getWorldPosition().y);
        let ballSize = this.node.getComponent(UITransform).contentSize; // Get Component TODO : Cache this value


        // LOL AABB Collision Detection TODO : let's make a helper function for this if time presents
        if (touchPos.x > ballPos.x - ballSize.width / 2 && touchPos.x < ballPos.x + ballSize.width / 2 &&
            touchPos.y > ballPos.y - ballSize.height / 2 && touchPos.y < ballPos.y + ballSize.height / 2) {
            console.log("Touch Start");
            this.isDragging = true;
            this.touchStartPoint = ballPos;
        }

    }

    onTouchMove(event: any) {
        if(!this.isDragging) return; 

        console.log("Touch move");

        this.touchEndPoint = event.getUILocation();

        let force = this.computeForce(this.touchStartPoint, this.touchEndPoint);

        this.drawTrajectoryLine(this.node.getPosition(), force , (-1 * this.gravityScale) , this.bezzierSteps)
    }

    onTouchEnd(event: any) {
        if(!this.isDragging) return; 


        console.log("Touch touchEnd");

        this.isDragging = false;
        this.touchEndPoint = event.getUILocation();

        let force = this.computeForce(this.touchStartPoint, this.touchEndPoint);

        console.log(force);

        this.rigidBody.applyLinearImpulseToCenter(force,true);
        this.trajectoryLine.clear();
    }

    drawTrajectoryLine(startPos: Vec3, force: Vec2, gravity: number, bezzierSteps: number) {
        this.trajectoryLine.clear();

        let velocity = force.clone(); 
        let midPoint = new Vec3(
            startPos.x + velocity.x, 
            startPos.y + velocity.y, // Adding 50 to create a nice arc
            0
        );
        let endPoint = new Vec3(
            startPos.x + velocity.x,
            startPos.y + velocity.y + gravity * 2, 
            0
        );

        // Move to start
        this.trajectoryLine.moveTo(startPos.x, startPos.y);

        // Draw Bézier curve
        this.trajectoryLine.bezierCurveTo(
            midPoint.x, midPoint.y, 
            midPoint.x, midPoint.y, 
            endPoint.x, endPoint.y
        );

        this.trajectoryLine.stroke();
    }
    computeForce(touchStartPoint: Vec2, touchEndPoint: Vec2) : Vec2 {
        let direction = touchStartPoint.subtract(touchEndPoint).normalize();
        let strength = touchStartPoint.subtract(touchEndPoint).length() * this.strengthScaleFactor;

        return direction.multiplyScalar(strength);
    }
}


