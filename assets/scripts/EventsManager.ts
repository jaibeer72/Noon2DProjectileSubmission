import { _decorator, Component, Node  } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('EventsManager')
export class EventsManager extends Component {

    private static _instance: EventsManager = null;
    private events: Map<string, EventTarget> = new Map();

    public static get instance(): EventsManager {
        if (!this._instance) {
            this._instance = new EventsManager();
        }
        return this._instance;
    }
    constructor() {
        super();
        this.initializeEvents();
    }

    private initializeEvents() {
        this.events.set(GameEvents.GAME_START, new EventTarget());
        this.events.set(GameEvents.GAME_PAUSE, new EventTarget());
        this.events.set(GameEvents.GAME_RESUME, new EventTarget());
        this.events.set(GameEvents.GAME_OVER, new EventTarget());
        this.events.set(GameEvents.SCORE_UPDATED, new EventTarget());
        this.events.set(GameEvents.TIMER_UPDATED, new EventTarget());
        this.events.set(GameEvents.GAME_RESTART, new EventTarget());
        this.events.set(GameEvents.TARGET_DESTROYED, new EventTarget());
        this.events.set(GameEvents.OBSTICAL_DESTROYED, new EventTarget());
    }

    public dispatchEvent(eventName: string, detail?: any) {
        if (!this.events.has(eventName)) { return; }

        let event = this.events.get(eventName);
        if(detail){
            event.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
        }else
        {
            event.dispatchEvent(new Event(eventName));
        }
    }

    public addEventListener(eventName: string, callback: EventListener, target?: any) {
        if (!this.events.has(eventName)) { return; }

        let event = this.events.get(eventName);
        event.addEventListener(eventName, callback, target);
    }

    public removeEventListener(eventName: string, callback: EventListener, target?: any) {
        if (!this.events.has(eventName)) { return; }

        let event = this.events.get(eventName);
        event.removeEventListener(eventName, callback, target);
    }
}

export const GameEvents = {
    GAME_START: 'game_start',
    GAME_PAUSE: 'game_pause',
    GAME_RESUME: 'game_resume',
    GAME_OVER: 'game_over',
    SCORE_UPDATED: 'score_updated',
    TIMER_UPDATED: 'timer_updated',
    GAME_RESTART: 'game_restart',
    TARGET_DESTROYED : 'target_destroyed',
    OBSTICAL_DESTROYED : 'obstical_destroyed'
};

