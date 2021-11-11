import './../libs/webaudio-controls';
import './booster/booster';
import './equalizer/equalizer';
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

provideFASTDesignSystem().withShadowRootMode("open")

const template = html<AudioPlayer> `${htmlFile}`;
const styles = css`${cssFile}`;

class AudioBinding {

    audioProgressContainer: HTMLDivElement;

    duration: HTMLSpanElement;
    currentTime: HTMLSpanElement;

    play: HTMLButtonElement;
    back: HTMLButtonElement;
    forward: HTMLButtonElement;
    slider: HTMLInputElement;
    volumn: HTMLInputElement;

    booster: Booster;
    equalizer: Equalizer;

    title: HTMLInputElement;

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
    private currentVolumn: number = 0;
    private maxVolumn: number = 1;
    private stepVolumn: number = 0.01;
    private minVolumn: number = 0;


    private audioCtx: AudioContext;
    private analyserNode: AnalyserNode;

    private firstPlay: boolean = true;

    get media(): HTMLMediaElement{
        return this.audioPlayer;
    }

    get analyser(): AnalyserNode {
        return this.analyserNode;
    }

    connectedCallback() {

        super.connectedCallback();

        this.binding = new AudioBinding(this.shadowRoot)

        //setting audio player
        this.audioPlayer =  this.shadowRoot.querySelector("#myPlayer");
        //this.audioPlayer.src = this.sourceAudio;

        //setting audio context
        this.binding.volumn.min = String(this.minVolumn);
        this.binding.volumn.max = String(this.maxVolumn);
        this.binding.volumn.value = String(this.currentVolumn);
        this.binding.volumn.step = String(this.stepVolumn);

        this.initButtonIcon();
        this.listenerAudio();
        this.listenerSlider();
        this.listenerActionAudio();

    }

    setURL(detail: string) {
        //this.audioPlayer.pause();
        //this.audioPlayer.currentTime = 0;
        this.binding.title.innerText = detail;
        this.audioPlayer.src = detail;
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
            console.log("abord")
            this.onStopAudio(); 
        }
    }

    private buildAudioGraph() {

        if(!this.firstPlay){
            return;
        }

        this.audioCtx = new AudioContext({sampleRate: 48000})
        
        this.binding.booster.audioContext = this.audioCtx;
        this.binding.equalizer.audioContext = this.audioCtx;

        let playerNode = this.audioCtx.createMediaElementSource(this.audioPlayer);

        // Create an analyser node
        this.analyserNode = this.audioCtx.createAnalyser();
        this.analyserNode.fftSize = 2048; // Try changing for lower values: 512, 256, 128, 64...
        const elements: Array<AudioNode> = [... this.binding.booster.filters, ...this.binding.equalizer.filters];
        
        let currentNode: AudioNode = playerNode;

        for (const value of elements) {
            currentNode.connect(value);
            currentNode = value;
        }

        currentNode.connect(this.analyserNode);
        this.analyserNode.connect(this.audioCtx.destination);

        this.firstPlay = false;
    }

    private listenerSlider(): void {
        this.binding.slider.oninput = () => {
            let value = Number(this.binding.slider.value);
            this.binding.updateCurrentTime(value);
            this.audioPlayer.currentTime = value;
        }
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

