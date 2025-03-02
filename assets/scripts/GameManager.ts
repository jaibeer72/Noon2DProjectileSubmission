import { _decorator, CCInteger, Component, Label, Node, RichText } from 'cc';
import { EventsManager, GameEvents } from './EventsManager';
const { ccclass, property } = _decorator;

export enum GameState {
    MAIN_MENU,
    PLAYING,
    PAUSED,
    GAME_OVER
}

@ccclass('GameManager')
export class GameManager extends Component {
    @property(RichText)
    scoreLabel: RichText = null;

    @property(RichText)
    timerLabel: RichText = null;

    @property(Node)
    uiManager: Node = null;

    @property(CCInteger)
    gameTime: number = 10;


    private score: number = 0;
    private timeRemaining: number = 10; // 30 seconds for one game round
    public gameState: GameState = GameState.MAIN_MENU;

    //singleton Instance for easier access
    private static _instance: GameManager = null;
    public static get instance(): GameManager {
        if (!this._instance) {
            this._instance = new GameManager();
        }
        return this._instance;
    }

    constructor() {
        super();
    }

    protected onEnable(): void {
        EventsManager.instance.addEventListener(GameEvents.SCORE_UPDATED, this.onScoreUpdated, this);
        EventsManager.instance.addEventListener(GameEvents.GAME_START, this.onGameStart, this);
        EventsManager.instance.addEventListener(GameEvents.GAME_PAUSE, this.onGamePause, this);
        this.initalizeations();
    }

    private initalizeations() {
        this.scoreLabel.string = `Score: ${this.score}`;
        this.timeRemaining = this.gameTime;
        this.timerLabel.string = `Time: ${this.gameTime}`;
    }

    protected onDestroy(): void {
        EventsManager.instance.removeEventListener(GameEvents.SCORE_UPDATED, this.onScoreUpdated, this);
    }

    protected onDisable(): void {
        EventsManager.instance.removeEventListener(GameEvents.SCORE_UPDATED, this.onScoreUpdated, this);
    }

    onScoreUpdated(event: any) {
        this.score = event.detail.score;
        this.scoreLabel.string = `Score: ${this.score}`;

        console.log(`Score Updated: ${this.score}`);
    }

    updateTimer(updateTimer: any, arg1: number) {
        if (this.gameState === GameState.PLAYING) {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                this.timerLabel.string = `Time: ${this.timeRemaining}`;
            } else {
                console.log('updateTimer');
                this.endGame();
            }
        }
    }

    onGamePause=()=> {
        if (this.gameState === GameState.PAUSED) return;
        this.gameState = GameState.PAUSED;
        this.unschedule(this.updateTimer);
    }

    endGame = ()=> {
        if(this.gameState === GameState.GAME_OVER) return;
        this.gameState = GameState.GAME_OVER;
        EventsManager.instance.dispatchEvent(GameEvents.GAME_OVER);

        // Reset Values
        this.score = 0;
        this.timeRemaining = this.gameTime;
        this.timerLabel.string = `Time: ${this.gameTime}`;

        this.unschedule(this.updateTimer);
    }

    onGameStart = () =>  {
        console.log('Game Start');
        this.schedule(this.updateTimer, 1, Infinity, 0);
        this.gameState = GameState.PLAYING;
    }

}


