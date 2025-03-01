import { _decorator, CCFloat, Component, director, Graphics, math, Node, NodeEventType, RigidBody2D, UITransform, Vec2, Vec3 } from 'cc';
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


    private isDragging : boolean = false;
    private touchStartPoint : Vec3 = Vec3.ZERO;
    private touchEndPoint : Vec3 = Vec3.ZERO; 
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
        let ballPos : Vec3 = this.node.getWorldPosition();
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

        let force = this.computeForce(this.touchStartPoint,  this.touchEndPoint);

        this.drawTrajectoryLine(this.touchStartPoint, force , (-1 * this.gravityScale) , this.bezzierSteps)
    }

    onTouchEnd(event: any) {
        if(!this.isDragging) return; 


        console.log("Touch touchEnd");

        this.isDragging = false;
        this.touchEndPoint = event.getUILocation();

        let force = this.computeForce(this.touchStartPoint, this.touchEndPoint);

        //console.log(force);

        this.rigidBody.applyLinearImpulseToCenter(force.toVec2(),true);
        this.trajectoryLine.clear();
    }

    drawTrajectoryLine(startPos: Vec3, force: Vec3, gravity: number, bezzierSteps: number) {
        this.trajectoryLine.clear();


        let velocity = force.clone(); 
        let midPoint = new Vec3(
            startPos.x + velocity.x, 
            startPos.y + velocity.y, // Adding 50 to create a nice arc
            0
        );
        let endPoint = new Vec3(
            startPos.x + velocity.x,
            startPos.y + velocity.y + gravity, 
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
    computeForce(touchStartPoint: Vec3, touchEndPoint: Vec3): Vec3 {
        let tsp = touchStartPoint.clone(); // WHY DOES SUBTRACTING CHANGE THE ORIGINAL VALUE
        let direction = tsp.subtract(touchEndPoint).normalize();
        return direction.multiplyScalar(this.strengthScaleFactor);
    }
}


