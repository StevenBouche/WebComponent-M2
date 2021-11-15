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
    input: HTMLInputElement;
    output: HTMLInputElement;
    drive: HTMLInputElement;
    bass: HTMLInputElement;
    middle: HTMLInputElement;
    treble: HTMLInputElement;
    reverb: HTMLInputElement;
    presence: HTMLInputElement;
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

    connectedCallback(): void {
        super.connectedCallback();
        this.booster = new BoosterBinding(this.shadowRoot);
        this.listenerActionBooster();
    }

    buildFilters(): void {
        this.inputGain = this._audioContext.createGain();
        this.inputGain.gain.value = Number(this.booster.input.value);
        this.outputGain = this._audioContext.createGain();
        this.outputGain.gain.value = Number(this.booster.output.value);
        this.mapFilter.set(NameFilter.BASS, new AudioFilter(this._audioContext, 100, 'lowshelf', Number(this.booster.bass.value), value => value * 3));
        this.mapFilter.set(NameFilter.MIDDLE, new AudioFilter(this._audioContext, 1700, 'peaking', Number(this.booster.middle.value),value => value-5 * 2));
        this.mapFilter.set(NameFilter.TREBLE, new AudioFilter(this._audioContext, 6500, 'highshelf', Number(this.booster.treble.value),value => value * 5));
        this.mapFilter.set(NameFilter.PRESENCE, new AudioFilter(this._audioContext, 3900, 'peaking', Number(this.booster.presence.value),value => value * 2));
    }

    listenerActionBooster(): void {
        this.booster.input.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            if(this.inputGain !== undefined)
                this.inputGain.gain.value = value / 10;
        }
        this.booster.output.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            if(this.outputGain !== undefined)
                this.outputGain.gain.value = value / 10;
        }
        this.booster.bass.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.BASS)?.setGain(value);
        }
        this.booster.middle.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.MIDDLE)?.setGain(value);
        }
        this.booster.treble.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.TREBLE)?.setGain(value);
        }
        this.booster.presence.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.PRESENCE)?.setGain(value);
        }
    }
    
}
