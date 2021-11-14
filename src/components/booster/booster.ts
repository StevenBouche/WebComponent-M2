import htmlFile from "./booster.html";
import cssFile from './booster.css'
import {
    html,
    css,
    customElement,
    FASTElement,
} from "@microsoft/fast-element";
import { AudioFilter, NameFilter } from "../Amplification";
import { Utils } from "../utils";

const template = html<Booster> `${htmlFile}`;
const styles = css`${cssFile}`;

class BoosterBinding {

    input: HTMLElement;
    output: HTMLElement;
    drive: HTMLElement;
    bass: HTMLElement;
    middle: HTMLElement;
    treble: HTMLElement;
    reverb: HTMLElement;
    presence: HTMLElement;


    constructor(shadowRoot: ShadowRoot){
        this.input = shadowRoot.querySelector('#input-booster')
        this.output = shadowRoot.querySelector('#output-booster')
        this.drive = shadowRoot.querySelector("#drive-booster")
        this.bass = shadowRoot.querySelector('#bass-booster')
        this.middle = shadowRoot.querySelector('#middle-booster')
        this.treble = shadowRoot.querySelector('#treble-booster')
        this.presence = shadowRoot.querySelector('#presence-booster');
    }   
}

@customElement({
    name: "audio-booster",
    template,
    styles,
})
export class Booster extends FASTElement {

    
    private minBooster = 0;
    private stepBooster = 0.1;
    private maxBooster = 10;
    
    private booster: BoosterBinding;
    private mapFilter: Map<NameFilter, AudioFilter> = new Map();
    private _audioContext: AudioContext;
    inputGain: GainNode;
    outputGain: GainNode;

    get filters(): Array<BiquadFilterNode> {
        return[...this.mapFilter.values()].map(element => element.filter);
    }

    set audioContext(value: AudioContext) {
        this._audioContext = value;
        this.buildFilters();
    }

    connectedCallback() {
        super.connectedCallback();
        this.booster = new BoosterBinding(this.shadowRoot)
        this.listenerActionBooster();
    }

    buildFilters() {
        this.inputGain = this._audioContext.createGain();
        this.outputGain = this._audioContext.createGain();
        this.mapFilter.set(NameFilter.BASS, new AudioFilter(this._audioContext, 100, 'lowshelf', value => value * 3));
        this.mapFilter.set(NameFilter.MIDDLE, new AudioFilter(this._audioContext, 1700, 'peaking', value => value-5 * 2));
        this.mapFilter.set(NameFilter.TREBLE, new AudioFilter(this._audioContext, 6500, 'highshelf', value => value * 5));
        this.mapFilter.set(NameFilter.PRESENCE, new AudioFilter(this._audioContext, 3900, 'peaking', value => value * 2));
    }

    listenerActionBooster() {
        this.booster.input.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.inputGain.gain.value = value / 10;
        }
        this.booster.output.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.outputGain.gain.value = value / 10;
        }
        this.booster.bass.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.BASS).setGain(value);
        }
        this.booster.middle.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.MIDDLE).setGain(value);
        }
        this.booster.treble.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.TREBLE).setGain(value);
        }
        this.booster.presence.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.PRESENCE).setGain(value);
        }
    }
    
}
