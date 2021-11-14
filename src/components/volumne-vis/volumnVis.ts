import htmlFile from "./volumnVis.html";
import cssFile from './volumnVis.css'
import { css, customElement, FASTElement, html } from "@microsoft/fast-element";

const template = html<VolumnVis> `${htmlFile}`;
const styles = css`${cssFile}`;
const ledColor = [
    "#064dac",
    "#064dac",
    "#064dac",
    "#06ac5b",
    "#15ac06",
    "#4bac06",
    "#80ac06",
    "#acaa06",
    "#ac8b06",
    "#ac5506",
]

@customElement({
    name: "audio-volumn-vis",
    template,
    styles,
})
export class VolumnVis extends FASTElement {
    
    private bufferLength: number;
    private dataArray: Uint8Array;
    analyser: AnalyserNode;
    private fttSize = 2048;
    private sensibility = 5;
    private leds: Array<HTMLDivElement> = [];

    set context(value: AudioContext){
        this.analyser = value.createAnalyser();
        this.analyser.fftSize = this.fttSize;
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
    }

    connectedCallback() {
        super.connectedCallback();
        this.leds = [...this.shadowRoot.querySelectorAll('.led')].reverse() as Array<HTMLDivElement>;
        this.updateLeds()
    }

    refreshVolumn(){
        this.analyser.getByteFrequencyData(this.dataArray);
        this.updateLeds()
    }

    clear() {
        for (let led of this.leds) {
            led.style.boxShadow = "-2px -2px 4px 0px #a7a7a73d, 2px 2px 4px 0px #0a0a0e5e";
        }
    }

    private getVolumne(): number { 
        let total = 0;
        let i = 0
        while (i < this.bufferLength) total += Math.abs(this.dataArray[i++] );
        return Math.sqrt(total / this.bufferLength);
    }

    private updateLeds() {
        const vol = this.getVolumne();
        let range = this.leds.slice(0, Math.round(vol))
        for (let led of this.leds) {
            led.style.boxShadow = "-2px -2px 4px 0px #a7a7a73d, 2px 2px 4px 0px #0a0a0e5e";
        }
        for (var i = 0; i < range.length; i++) {
            range[i].style.boxShadow = `5px 2px 5px 0px #0a0a0e5e inset, -2px -2px 1px 0px #a7a7a73d inset, -2px -2px 30px 0px ${ledColor[i]} inset`;
        }
    }

}