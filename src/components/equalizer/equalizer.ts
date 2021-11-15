import htmlFile from "./equalizer.html";
import cssFile from './equalizer.css'
import {
    html,
    css,
    customElement,
    FASTElement,
    attr,
} from "@microsoft/fast-element";
import { AudioFilter, NameFilter } from "../Amplification";
import { Utils } from "../utils";

const template = html<Equalizer> `${htmlFile}`;
const styles = css`${cssFile}`;

class EqualizerBinding {
    eq60: HTMLInputElement;
    eq170: HTMLInputElement;
    eq350: HTMLInputElement;
    eq1000: HTMLInputElement;
    eq3500: HTMLInputElement;
    eq10k: HTMLInputElement;
    constructor(shadowRoot: ShadowRoot){
        this.eq60 = shadowRoot.querySelector('#eq-60')
        this.eq170 = shadowRoot.querySelector('#eq-170')
        this.eq350 = shadowRoot.querySelector("#eq-350")
        this.eq1000 = shadowRoot.querySelector('#eq-1000')
        this.eq3500 = shadowRoot.querySelector('#eq-3500')
        this.eq10k = shadowRoot.querySelector('#eq-10k')
    }
}

@customElement({
    name: "audio-equalizer",
    template,
    styles,
})
export class Equalizer extends FASTElement {

    private equalizer: EqualizerBinding;
    private mapFilter: Map<NameFilter, AudioFilter> = new Map();
    private _audioContext: AudioContext;

    get filters(): Array<BiquadFilterNode> {
        return[...this.mapFilter.values()].map(element => element.filter);
    }

    set audioContext(value: AudioContext) {
        this._audioContext = value;
        this.buildFilters();
    }

    connectedCallback() {
        super.connectedCallback();
        this.equalizer = new EqualizerBinding(this.shadowRoot)
        this.listenerActionEqualizer();
    }

    buildFilters() {
        this.mapFilter.set(NameFilter.EQ60, new AudioFilter(this._audioContext, 60, 'peaking', Number(this.equalizer.eq60.value)));
        this.mapFilter.set(NameFilter.EQ170, new AudioFilter(this._audioContext, 170, 'peaking', Number(this.equalizer.eq170.value)));
        this.mapFilter.set(NameFilter.EQ350, new AudioFilter(this._audioContext, 350, 'peaking', Number(this.equalizer.eq350.value)));
        this.mapFilter.set(NameFilter.EQ1000, new AudioFilter(this._audioContext, 1000, 'peaking', Number(this.equalizer.eq1000.value)));
        this.mapFilter.set(NameFilter.EQ3500, new AudioFilter(this._audioContext, 3500, 'peaking', Number(this.equalizer.eq3500.value)));
        this.mapFilter.set(NameFilter.EQ10K, new AudioFilter(this._audioContext, 10000, 'peaking', Number(this.equalizer.eq10k.value)));
    }

    listenerActionEqualizer() {
        this.equalizer.eq60.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.EQ60)?.setGain(value);
        }
        this.equalizer.eq170.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.EQ170)?.setGain(value);
        }
        this.equalizer.eq350.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.EQ350)?.setGain(value);
        }
        this.equalizer.eq1000.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.EQ1000)?.setGain(value);
        }
        this.equalizer.eq3500.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.EQ3500)?.setGain(value);
        }
        this.equalizer.eq10k.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.EQ10K)?.setGain(value);
        }
    }
}
