import { _decorator, CCInteger, Component, Event, instantiate, Node, NodePool, Prefab, randomRange, UITransform, Vec3 } from 'cc';
import { EventsManager, GameEvents } from './EventsManager';
const { ccclass, property } = _decorator;

@ccclass('Spwner')
export class Spwner extends Component {
    @property(Prefab)
    targetPrefab: Prefab = null;

    @property(Prefab)
    obstaclePrefab: Prefab = null;

    @property(Node)
    spawnArea: Node = null;

    @property(CCInteger)
    spawnInterval: number = 1; 

    @property(CCInteger)
    targetPoolSize: number = 5;

    @property(CCInteger)
    obstaclePoolSize: number = 5;


    private spawnTimer: number = 0;

    private targetPool: Node[] = [];
    private obstaclePool: Node[] = [];
    private availableTargetIndexes: number[] = [];
    private availableObstacleIndexes: number[] = [];

     private activeTargets: number = 0;
    private activeObstacles: number = 0;

    onLoad() {
        for (let i = 0; i < this.targetPoolSize; ++i) {
            const target = instantiate(this.targetPrefab);
            target.active = false;
            this.targetPool.push(target);
            this.availableTargetIndexes.push(i);
        }

        for (let i = 0; i < this.obstaclePoolSize; ++i) {
            const obstacle = instantiate(this.obstaclePrefab);
            obstacle.active = false;
            this.obstaclePool.push(obstacle);
            this.availableObstacleIndexes.push(i);
        }

        EventsManager.instance.addEventListener(GameEvents.TARGET_DESTROYED, this.returnToPool, this);
        EventsManager.instance.addEventListener(GameEvents.OBSTICAL_DESTROYED, this.returnToPool, this);
        EventsManager.instance.addEventListener(GameEvents.GAME_OVER, this.resetObjects, this);
        EventsManager.instance.addEventListener(GameEvents.GAME_RESTART, this.resetObjects, this);
    }

    resetObjects=()=> {
        this.activeTargets = 0;
        this.activeObstacles = 0;

        this.targetPool.forEach((target) => {
            target.active = false;
            this.availableObstacleIndexes.push(this.targetPool.indexOf(target));
        });

        this.obstaclePool.forEach((obstacle) => {
            obstacle.active = false;
            this.availableObstacleIndexes.push(this.obstaclePool.indexOf(obstacle));
        });
    }

    start() {
        this.schedule(this.spawnObjects, this.spawnInterval);
    }

    spawnObjects() {
        if (this.activeTargets < this.targetPoolSize) {
            this.spawnTarget();
        }
        if (this.activeObstacles < this.obstaclePoolSize) {
            this.spawnObstacle();
        }
    }

    spawnTarget() {
        if (this.availableTargetIndexes.length > 0) {
            const index = this.availableTargetIndexes.pop();
            const target = this.targetPool[index];
            target.setPosition(this.getRandomPosition());
            target.active = true; 
            this.spawnArea.addChild(target);
            this.activeTargets++;
        } else {
            console.warn('No available targets in the pool.');
        }
    }

    spawnObstacle() {
        if (this.availableObstacleIndexes.length > 0) {
            const index = this.availableObstacleIndexes.pop();
            const obstacle = this.obstaclePool[index];
            obstacle.setPosition(this.getRandomPosition());
            obstacle.active = true; 
            this.spawnArea.addChild(obstacle);
            this.activeObstacles++;
        } else {
            console.warn('No available obstacles in the pool.');
        }
    }

    returnToPool= (event) =>{
        const node = event.detail.node;
        node.active = false;

        if (node.name === this.targetPrefab.name) {
            const index = this.targetPool.indexOf(node);
            if (index !== -1) {
                this.availableTargetIndexes.push(index);
            }else{
                console.warn("Target not found");
            }
            this.activeTargets--;
        } else if (node.name === this.obstaclePrefab.name) {
            const index = this.obstaclePool.indexOf(node);
            if (index !== -1) {
                this.availableObstacleIndexes.push(index);
            }
            this.activeObstacles--;
        }
    }

    getRandomPosition(): Vec3 {
        const areaSize = this.spawnArea.getComponent(UITransform).contentSize;
        const x = randomRange(-areaSize.width / 2, areaSize.width / 2);
        const y = randomRange(-areaSize.height / 2, areaSize.height / 2);
        return new Vec3(x, y, 0);
    }
}


