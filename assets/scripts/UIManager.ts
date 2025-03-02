import { _decorator, Component, Node ,director, sys} from 'cc';
import { EventsManager, GameEvents } from './EventsManager';
import { GameManager, GameState } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('UIManager')
export class UIManager extends Component {
    
    @property(Node)
    gameNode : Node = null;

    @property(Node)
    mainMenuNode : Node = null;

    @property(Node)
    hudNode : Node = null;

    @property(Node)
    gameOverNode : Node = null;

    // UI Callbacks

    protected onLoad(): void {
        this.gameNode.active = false;
        this.mainMenuNode.active = true;
        this.hudNode.active = false;
        this.gameOverNode.active = false;

        EventsManager.instance.addEventListener(GameEvents.GAME_OVER, this.onGameOver, this);
    }

    public onClickPlayGame(){
        this.gameNode.active = true;
        this.mainMenuNode.active = false;
        this.hudNode.active = true;
        EventsManager.instance.dispatchEvent(GameEvents.GAME_START, {from: GameManager.instance.gameState});
        director.resume();
    }

    public onClickPauseGame(){
        this.gameNode.active = false;
        this.mainMenuNode.active = true;
        this.hudNode.active = false;
        this.gameOverNode.active = false;
        EventsManager.instance.dispatchEvent(GameEvents.GAME_PAUSE);
        GameManager.instance.gameState = GameState.PAUSED;
        director.pause();
    }

    public onClickExitGame(){
        if (sys.isNative) {
            director.end();
        } else if (sys.isBrowser) {
            window.close();
        }
    }

    public onClickRestartGame(){
        this.gameNode.active = true;
        this.mainMenuNode.active = false;
        this.hudNode.active = true;
        this.gameOverNode.active = false;
        EventsManager.instance.dispatchEvent(GameEvents.GAME_START);
        director.resume();
    }

    private onGameOver=() =>{
        this.gameNode.active = false;
        this.mainMenuNode.active = false;
        this.hudNode.active = false;
        this.gameOverNode.active = true;
    }
}


