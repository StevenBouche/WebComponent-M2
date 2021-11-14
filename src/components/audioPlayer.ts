import './../libs/webaudio-controls';
import './booster/booster';
import './equalizer/equalizer';
import './volumne-vis/volumnVis'
import htmlFile from "./audioPlayer.html";
import cssFile from './audioPlayer.css'
import { SvgCollection } from './svg/svg.collection';

import {
    html,
    css,
    customElement,
    FASTElement,
    attr,
} from "@microsoft/fast-element";
import { provideFASTDesignSystem } from '@microsoft/fast-components';
import { AudioFilter, NameFilter } from './Amplification';
import { Booster } from './booster/booster';
import { Equalizer } from './equalizer/equalizer';
import './processor/volumneProcessor'
import { VolumnVis } from './volumne-vis/volumnVis';
import { Utils } from './utils';

provideFASTDesignSystem().withShadowRootMode("open")

const template = html<AudioPlayer> `${htmlFile}`;
const styles = css`${cssFile}`;

interface StateInput {
    current: number;
    min: number;
    max: number;
    step: number;
}

class AudioBinding {

    audioProgressContainer: HTMLDivElement;
    audioBalanceContainer: HTMLDivElement;
    audioSpeedContainer: HTMLDivElement;
    slider: HTMLInputElement;
    sliderBalance: HTMLInputElement;
    sliderSpeed: HTMLInputElement;

    duration: HTMLSpanElement;
    currentTime: HTMLSpanElement;

    play: HTMLButtonElement;
    back: HTMLButtonElement;
    forward: HTMLButtonElement;
    
    volumn: HTMLInputElement;

    booster: Booster;
    equalizer: Equalizer;

    title: HTMLInputElement;

    volumnLeft: VolumnVis;
    volumnRight: VolumnVis;
    
    constructor(shadowRoot: ShadowRoot){
        this.duration = shadowRoot.getElementById('duration')
        this.currentTime = shadowRoot.getElementById('currentTime')
        this.slider = shadowRoot.querySelector("#progress-slider")
        this.play = shadowRoot.querySelector('#play')
        this.back = shadowRoot.querySelector('#reduce10')
        this.forward = shadowRoot.querySelector('#avance10')
        this.audioProgressContainer = shadowRoot.querySelector('#audio-player-container');
        this.volumn = shadowRoot.querySelector('#volumeKnob');
        this.booster = shadowRoot.querySelector("#audio-booster");
        this.equalizer = shadowRoot.querySelector("#audio-equalizer");
        this.title = shadowRoot.querySelector("#title-audio-player");
        this.volumnLeft = shadowRoot.querySelector("#audio-volumn-left");
        this.volumnRight = shadowRoot.querySelector("#audio-volumn-right");
        this.sliderBalance = shadowRoot.querySelector('#balance-slider');
        this.sliderSpeed = shadowRoot.querySelector('#speed-slider');
        this.audioBalanceContainer = shadowRoot.querySelector('#audio-slider-balance');
        this.audioSpeedContainer = shadowRoot.querySelector('#audio-slider-speed');
    }   

    updateAudioDuration(duration: number): void {
        this.duration.textContent = this.calculateTime(duration);
        this.slider.max = `${Math.floor(duration)}`
    }

    updateCurrentTime(current: number) {
        this.currentTime.textContent = this.calculateTime(current);
        this.slider.value = `${Math.floor(current)}`;
    }

    calculateTime(secs: number): string {
        const minutes = Math.floor(secs / 60);
        const seconds = Math.floor(secs % 60);
        const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${minutes}:${returnedSeconds}`;
    }

    updateValueVolumn(stateVolumn: StateInput){
        this.volumn.min = String(stateVolumn.min);
        this.volumn.max = String(stateVolumn.max);
        this.volumn.value = String(stateVolumn.current);
        this.volumn.step = String(stateVolumn.step);
    }

    updateValueBalance(state: StateInput){
        this.sliderBalance.min = String(state.min);
        this.sliderBalance.max = String(state.max);
        this.sliderBalance.value = String(state.current);
        this.sliderBalance.step = String(state.step);
    }

    updateValueSpeed(state: StateInput){
        this.sliderSpeed.min = String(state.min);
        this.sliderSpeed.max = String(state.max);
        this.sliderSpeed.value = String(state.current);
        this.sliderSpeed.step = String(state.step);
    }

    refreshSliderBalance() {
        this.audioBalanceContainer.style.setProperty('--current-width', `${this.sliderBalance.value}%`);
    }

    refreshSliderSpeed() {
        this.audioSpeedContainer.style.setProperty('--current-width', `${this.sliderSpeed.value}%`);
    }
}

@customElement({
    name: "audio-player",
    template,
    styles,
})
export class AudioPlayer extends FASTElement {
   
    private audioPlayer: HTMLAudioElement;

    private binding: AudioBinding;

    private statePlayer: boolean = false;

    private stateVolumn: StateInput = { current: 0.5, max: 1, step: 0.1, min: 0 }
    private stateBalance: StateInput = { current: 50, max: 100, step: 1, min: 0 }
    private stateSpeed: StateInput = { current: 50, max: 100, step: 1, min: 0 }

    private audioCtx: AudioContext;
    private analyserNodeOutput: AnalyserNode;
    private analyserNodeInput: AnalyserNode;

    private firstPlay: boolean = true;

    private stereoPane: StereoPannerNode;

    get media(): HTMLMediaElement{
        return this.audioPlayer;
    }

    get analyserInput(): AnalyserNode {
        return this.analyserNodeInput;
    }

    get analyserOutput(): AnalyserNode {
        return this.analyserNodeOutput;
    }

    connectedCallback() {
        super.connectedCallback();
        this.binding = new AudioBinding(this.shadowRoot)
        this.audioPlayer =  this.shadowRoot.querySelector("#myPlayer");
        this.initValueVolumn();
        this.initValueSliderBalanceSpeed();
        this.initButtonIcon();
        this.listenerAudio();
        this.listenerSlider();
        this.listenerActionAudio();
    }

    private initValueSliderBalanceSpeed() {
        this.binding.updateValueBalance(this.stateBalance)
        this.binding.updateValueSpeed(this.stateSpeed)
        this.binding.refreshSliderBalance();
        this.binding.refreshSliderSpeed();
        this.setSpeed();
    }

    private initValueVolumn() {
        this.binding.updateValueVolumn(this.stateVolumn);
        this.audioPlayer.volume = this.stateVolumn.current;
    }

    setURL(detail: string) {
        this.binding.title.innerText = detail;
        this.audioPlayer.src = detail;
    }

    volumnAnimationFrame(): void{
        this.binding.volumnLeft.refreshVolumn();
        this.binding.volumnRight.refreshVolumn();
    }

    clearVolumnAnimation() {
        this.binding.volumnLeft.clear();
        this.binding.volumnRight.clear();
    }

    private initButtonIcon() {
        console.log(SvgCollection.play)
        this.binding.play.innerHTML = this.statePlayer ? SvgCollection.pause : SvgCollection.play;
        this.binding.back.innerHTML = SvgCollection.back;
        this.binding.forward.innerHTML = SvgCollection.forward;
    }

    private listenerAudio(): void {

        this.audioPlayer.onloadedmetadata = () => {
            let duration = this.audioPlayer.duration
            this.binding.updateAudioDuration(duration)
        }
        this.audioPlayer.ontimeupdate = () => {
            this.binding.updateCurrentTime(this.audioPlayer.currentTime);
            this.binding.audioProgressContainer.style.setProperty('--current-width', `${(this.audioPlayer.currentTime / Number(this.binding.slider.max)) * 100}%`);
        }
        this.audioPlayer.onpause = () => { 
            this.onStopAudio(); 
            this.dispatchEvent(new Event("pause"));
        }
        this.audioPlayer.onprogress = () => { 
            this.displayBufferedAmount(); 
        }
        this.audioPlayer.onended = () => { 
            this.onStopAudio(); 
            this.dispatchEvent(new Event("ended"));
        }
        this.audioPlayer.onplay = () => {
            this.buildAudioGraph();
            this.displayBufferedAmount();
            this.onPlayAudio();
            this.dispatchEvent(new Event("play"))
        }
        this.audioPlayer.onabort = () => {
            this.onStopAudio(); 
        }
    }

    private buildAudioGraph() {

        if(!this.firstPlay){
            return;
        }

        //AudioContext
        this.audioCtx = new AudioContext({sampleRate: 48000})
        
        //Set context into booster and equalizer
        this.binding.booster.audioContext = this.audioCtx;
        this.binding.equalizer.audioContext = this.audioCtx;

        //get the first node of graph
        let playerNode = this.audioCtx.createMediaElementSource(this.audioPlayer);

        //create input and output analyser
        this.analyserNodeOutput = this.audioCtx.createAnalyser();
        this.analyserNodeOutput.fftSize = 2048;
        this.analyserNodeInput = this.audioCtx.createAnalyser();
        this.analyserNodeInput.fftSize = 2048; 

        //merge filters booster and equalizer
        const elements: Array<AudioNode> = [
            ... this.binding.booster.filters, 
            ...this.binding.equalizer.filters
        ];
        
        playerNode.connect(this.binding.booster.inputGain)
        this.binding.booster.inputGain.connect(this.analyserNodeInput);

        let currentNode: AudioNode = this.analyserNodeInput;

        for (const value of elements) {
            currentNode.connect(value);
            currentNode = value;
        }

        currentNode.connect(this.binding.booster.outputGain);
        currentNode = this.binding.booster.outputGain;

        this.stereoPane = this.audioCtx.createStereoPanner();
        currentNode.connect(this.stereoPane);
        this.stereoPane.connect(this.analyserNodeOutput);
        this.analyserNodeOutput.connect(this.audioCtx.destination);

        //SPLITTER VOLUMN
        this.binding.volumnLeft.context = this.audioCtx;
        this.binding.volumnRight.context = this.audioCtx;
        const splitter = this.audioCtx.createChannelSplitter();
        this.stereoPane.connect(splitter);
        splitter.connect(this.binding.volumnLeft.analyser,0,0);
        splitter.connect(this.binding.volumnRight.analyser,1,0);

        this.setBalance();

        this.firstPlay = false;
    }

    private listenerSlider(): void {
        this.binding.slider.oninput = () => {
            let value = Number(this.binding.slider.value);
            this.binding.updateCurrentTime(value);
            this.audioPlayer.currentTime = value;
        }

        this.binding.sliderBalance.oninput = () => {
            this.binding.refreshSliderBalance();
            this.setBalance();
        }

        this.binding.sliderSpeed.oninput = () => {
            this.binding.refreshSliderSpeed();
            this.setSpeed();
        }
    }

    private setBalance(){
        if(this.stereoPane === undefined) return;
        this.stereoPane.pan.value = Utils.mapRange(
            Number(this.binding.sliderBalance.value), 
            Number(this.binding.sliderBalance.min),
            Number(this.binding.sliderBalance.max),
            -1,
            1
        );
    }

    private setSpeed(){
        this.audioPlayer.playbackRate = Utils.mapRange(
            Number(this.binding.sliderSpeed.value), 
            Number(this.binding.sliderSpeed.min),
            Number(this.binding.sliderSpeed.max),
            0,
            2
        );
    }

    private listenerActionAudio(): void{
        this.binding.play.onclick = () => this.play();
        this.binding.back.onclick = () => this.modifyTime(-10);
        this.binding.forward.onclick = () =>  this.modifyTime(10);
        this.binding.volumn.oninput = (event) => this.modifyVolumn(event.target);
    }

    private displayBufferedAmount(): void {
        if(this.audioPlayer.buffered.length > 0){
            const bufferedAmount = Math.floor(this.audioPlayer.buffered.end(this.audioPlayer.buffered.length - 1));
            this.binding.audioProgressContainer.style.setProperty('--buffered-width', `${(bufferedAmount / Number(this.binding.slider.max)) * 100}%`);
        }  
    }

    private onPlayAudio() {
        this.statePlayer = true;
        this.updateImagePlay();
    }

    private onStopAudio() {
        this.statePlayer = false;
        this.updateImagePlay();
    }

    private play(){
        if(this.statePlayer) this.audioPlayer.pause();
        else this.audioPlayer.play();
    }

    private updateImagePlay(): void {
        this.binding.play.innerHTML = this.statePlayer ? SvgCollection.pause : SvgCollection.play;
    }

    private modifyTime(value: number){
        let newValue = this.audioPlayer.currentTime + value;
        this.audioPlayer.currentTime = newValue < 0 ? 0 : newValue;
    }

    private modifyVolumn(target: EventTarget) {
        this.audioPlayer.volume = this.getValueInput(target);
    }

    private speed(target: EventTarget){
        console.log("speed")
        this.audioPlayer.playbackRate = parseFloat((<HTMLInputElement>target).value);
    }

    private getValueInput(target: EventTarget): number{
        return parseFloat((<HTMLInputElement>target).value);
    }
}

