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


    private timeRemaining: number = 10; // 30 seconds for one game round
    private score: number = 0;
    public gameState: GameState = GameState.MAIN_MENU;

    private static _instance: GameManager = null;
    public static get instance(): GameManager {
        return this._instance;
    }

    onLoad() {
        if (GameManager._instance === null) {
            GameManager._instance = this;
        } else {
            this.destroy();
            return;
        }
    }


    public getScore() {
        return this.score;
    }

    public setScore(score: number) {
        this.score = score;
    }

    protected onEnable(): void {
        EventsManager.instance.addEventListener(GameEvents.SCORE_UPDATED, this.onScoreUpdated, this);
        EventsManager.instance.addEventListener(GameEvents.GAME_START, this.onGameStart, this);
        EventsManager.instance.addEventListener(GameEvents.GAME_PAUSE, this.onGamePause, this);
        EventsManager.instance.addEventListener(GameEvents.GAME_RESTART, this.endGame, this);
        this.initalizeations();
    }

    private initalizeations() {
        this.scoreLabel.string = `Score: ${this.getScore()}`;
        this.timeRemaining = this.gameTime;
        this.timerLabel.string = `Time: ${this.gameTime}`;
    }


    protected onDisable(): void {
        EventsManager.instance.removeEventListener(GameEvents.SCORE_UPDATED, this.onScoreUpdated, this);
    }

    onScoreUpdated= (event: any) =>{
        console.log(event.detail.score);
        this.setScore(event.detail.score);

        console.log("ScoreAfterUpdate"+this.getScore());
        this.scoreLabel.string = `Score: ${this.getScore()}`;
    }

    updateTimer(updateTimer: any, arg1: number) {
        if (this.gameState === GameState.PLAYING) {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                this.timerLabel.string = `Time: ${this.timeRemaining}`;
            } else {
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
        console.log('Game Over');
        if(this.gameState === GameState.GAME_OVER) return;
        this.gameState = GameState.GAME_OVER;
        EventsManager.instance.dispatchEvent(GameEvents.GAME_OVER);

        // Reset Values
        this.setScore(0);
        this.scoreLabel.string = `Score: ${this.getScore()}`;
        
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


