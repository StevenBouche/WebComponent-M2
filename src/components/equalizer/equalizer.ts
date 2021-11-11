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

    eq60: HTMLElement;
    eq170: HTMLElement;
    eq350: HTMLElement;
    eq1000: HTMLElement;
    eq3500: HTMLElement;
    eq10k: HTMLElement;

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
        this.mapFilter.set(NameFilter.EQ60, new AudioFilter(this._audioContext, 60, 'peaking'));
        this.mapFilter.set(NameFilter.EQ170, new AudioFilter(this._audioContext, 170, 'peaking'));
        this.mapFilter.set(NameFilter.EQ350, new AudioFilter(this._audioContext, 350, 'peaking'));
        this.mapFilter.set(NameFilter.EQ1000, new AudioFilter(this._audioContext, 1000, 'peaking'));
        this.mapFilter.set(NameFilter.EQ3500, new AudioFilter(this._audioContext, 3500, 'peaking'));
        this.mapFilter.set(NameFilter.EQ10K, new AudioFilter(this._audioContext, 10000, 'peaking'));
    }

    listenerActionEqualizer() {
        this.equalizer.eq60.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.EQ60).setGain(value);
        }
        this.equalizer.eq170.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.EQ170).setGain(value);
        }
        this.equalizer.eq350.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.EQ350).setGain(value);
        }
        this.equalizer.eq1000.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.EQ1000).setGain(value);
        }
        this.equalizer.eq3500.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.EQ3500).setGain(value);
        }
        this.equalizer.eq10k.oninput = (event) => {
            const value = Utils.getValueInput(event.target);
            this.mapFilter.get(NameFilter.EQ10K).setGain(value);
        }
    }

}
