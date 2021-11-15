
import htmlFile from './main.html'
import cssFile from './main.css'
import {
    html,
    css,
    customElement,
    FASTElement,
    attr,
} from "@microsoft/fast-element";
import { provideFASTDesignSystem } from "@microsoft/fast-components";
import './components/audioPlayer';
import './components/playlist/Playlist';
import { AudioPlayer } from './components/audioPlayer';
import { Playlist } from './components/playlist/Playlist';

provideFASTDesignSystem().withShadowRootMode("open")
    
@customElement({
    name: "main-app",
    template: html<Main>`${htmlFile}`,
    styles: css`${cssFile}`
})
export class Main extends FASTElement {

    @attr sourceAudio: string;
    
    private audio: AudioPlayer;
    private animationFrameId: number;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private canvas2: HTMLCanvasElement;
    private ctx2: CanvasRenderingContext2D;
    private canvas3: HTMLCanvasElement;
    private ctx3: CanvasRenderingContext2D;
    private canvas4: HTMLCanvasElement;
    private ctx4: CanvasRenderingContext2D;
    private canvas5: HTMLCanvasElement;
    private ctx5: CanvasRenderingContext2D;
    private canvas6: HTMLCanvasElement;
    private ctx6: CanvasRenderingContext2D;

    private bufferLength: number;
    private dataArray: Uint8Array;

    private bufferLength3: number;
    private dataArray3: Uint8Array;

    private bufferLength4: number;
    private dataArray4: Uint8Array;

    private bufferLength6: number;
    private dataArray6: Uint8Array;

    private analyserOutput: AnalyserNode;
    private analyserInput: AnalyserNode;

    private playlist: Playlist;

    private backgroundColor: string = 'rgb(0, 0, 0)';

    private canvasGradientRound: CanvasGradient
    private canvasGradientFrequency: CanvasGradient
    private canvasGradientRound2: CanvasGradient
    private canvasGradientFrequency2: CanvasGradient

    private test: number = 0;


    connectedCallback() {

        super.connectedCallback();

        this.audio = this.shadowRoot.querySelector("#audio");
        this.playlist = this.shadowRoot.querySelector('#audio-playlist');

        this.playlist.addEventListener('selected', ((event: CustomEvent) => {
            this.audio.setURL(event.detail);
          }) as EventListener);

        this.audio.onplay = (event) => {
            this.analyserOutput = this.audio.analyserOutput;
            this.bufferLength = this.analyserOutput.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.bufferLength3 = this.analyserOutput.frequencyBinCount;
            this.dataArray3 = new Uint8Array(this.bufferLength3);
            this.analyserInput = this.audio.analyserInput;
            this.bufferLength4 = this.analyserInput.frequencyBinCount;
            this.dataArray4 = new Uint8Array(this.bufferLength4);
            this.bufferLength6 = this.analyserInput.frequencyBinCount;
            this.dataArray6 = new Uint8Array(this.bufferLength6);
            this.animationFrameId = this.requestFrame();
        }

        this.audio.onpause = () => {
            this.stopAnnimationFrame();
        }

        this.audio.onended = () => {
            this.stopAnnimationFrame();
        }

         //setting canvas
         this.canvas = this.shadowRoot.querySelector("#myCanvas");
         this.ctx = this.canvas.getContext("2d");

         this.canvas4 = this.shadowRoot.querySelector("#myCanvas4");
         this.ctx4 = this.canvas4.getContext("2d");

         this.canvasGradientFrequency = this.ctx.createLinearGradient(0,0,this.canvas.width, 0);
         this.canvasGradientFrequency.addColorStop(1,'#f00000');
         this.canvasGradientFrequency.addColorStop(0.66,'#ff0000');
         this.canvasGradientFrequency.addColorStop(0.33,'#fff000');
         this.canvasGradientFrequency.addColorStop(0,'#ffff00');

         this.canvasGradientFrequency2 = this.ctx4.createLinearGradient(0,0,this.canvas4.width, 0);
         this.canvasGradientFrequency2.addColorStop(1,'#f00000');
         this.canvasGradientFrequency2.addColorStop(0.66,'#ff0000');
         this.canvasGradientFrequency2.addColorStop(0.33,'#fff000');
         this.canvasGradientFrequency2.addColorStop(0,'#ffff00');

         //setting canvas
         this.canvas2 = this.shadowRoot.querySelector("#myCanvas2");
         this.ctx2 = this.canvas2.getContext("2d");

         //setting canvas
         this.canvas3 = this.shadowRoot.querySelector("#myCanvas3");
         this.ctx3 = this.canvas3.getContext("2d");

         //setting canvas
         this.canvas5 = this.shadowRoot.querySelector("#myCanvas5");
         this.ctx5 = this.canvas5.getContext("2d");

         //setting canvas
         this.canvas6 = this.shadowRoot.querySelector("#myCanvas6");
         this.ctx6 = this.canvas6.getContext("2d");

         // create a vertical gradient of the height of the canvas
         this.canvasGradientRound = this.ctx2.createLinearGradient(0,0,0, this.canvas2.height);
         this.canvasGradientRound.addColorStop(1,'#f00000');
         this.canvasGradientRound.addColorStop(0.66,'#ff0000');
         this.canvasGradientRound.addColorStop(0.33,'#ffff00');
         this.canvasGradientRound.addColorStop(0,'#ffffff');

         // create a vertical gradient of the height of the canvas
         this.canvasGradientRound2 = this.ctx5.createLinearGradient(0,0,0, this.canvas5.height);
         this.canvasGradientRound2.addColorStop(1,'#f00000');
         this.canvasGradientRound2.addColorStop(0.66,'#ff0000');
         this.canvasGradientRound2.addColorStop(0.33,'#ffff00');
         this.canvasGradientRound2.addColorStop(0,'#ffffff');


        if(this.sourceAudio !== undefined){
            this.playlist.addElement(this.sourceAudio);
            this.playlist.addElement('https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_5MG.mp3');
            this.playlist.addElement('https://mainline.i3s.unice.fr/mooc/guitarRiff1.mp3');
        }
    }

    requestFrame(): number {
        return requestAnimationFrame(() => {
            this.refreshByteFrequency();
            this.animationLoop(this.canvas, this.ctx, this.bufferLength, this.dataArray, this.canvasGradientFrequency);
            this.animationLoop2(this.canvas2, this.ctx2, this.bufferLength, this.dataArray, this.canvasGradientRound);
            this.drawWaveform(this.canvas3, this.ctx3, this.bufferLength3, this.dataArray3);
            this.animationLoop(this.canvas4, this.ctx4, this.bufferLength4, this.dataArray4, this.canvasGradientFrequency2);
            this.animationLoop2(this.canvas5, this.ctx5, this.bufferLength4, this.dataArray4, this.canvasGradientRound2);
            this.drawWaveform(this.canvas6, this.ctx6, this.bufferLength6, this.dataArray6);
            this.audio.volumnAnimationFrame();
            this.animationFrameId = this.requestFrame();
        });
    }

    private refreshByteFrequency(){
        this.analyserOutput.getByteFrequencyData(this.dataArray);
        this.analyserOutput.getByteTimeDomainData(this.dataArray3);
        this.analyserInput.getByteFrequencyData(this.dataArray4);
        this.analyserInput.getByteTimeDomainData(this.dataArray6);
    }

    stopAnnimationFrame() {
        cancelAnimationFrame(this.animationFrameId);
        this.clearCanvasRound(this.canvas2, this.ctx2);
        this.clearFrequencyCanvas(this.canvas, this.ctx);
        this.clearCanvasWave(this.canvas3, this.ctx3);
        this.clearCanvasRound(this.canvas5, this.ctx5);
        this.clearFrequencyCanvas(this.canvas4, this.ctx4);
        this.clearCanvasWave(this.canvas6, this.ctx6);
        this.audio.clearVolumnAnimation();
    }

    clearFrequencyCanvas(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D){
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = this.backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    clearCanvasRound(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D){

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = this.backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        let center_x = canvas.width / 2;
        let center_y = canvas.height / 2;
        let radius = 20;    

        //draw a circle
        context.beginPath();
        context.arc(center_x,center_y,radius,0,2*Math.PI);
        context.stroke();
    }

    animationLoop2(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, bufferLen: number, dataArray: Uint8Array, gradient: CanvasGradient) {
        this.clearCanvasRound(canvas, context);
        let center_x = canvas.width / 2;
        let center_y = canvas.height / 2;
        let radius = 20;    
        for(var i = 0; i < bufferLen; i++){
            //divide a circle into equal parts
            let rads = Math.PI * 2 / bufferLen;
            let bar_height = dataArray[i]*0.25;
            const t = i + this.test;
            // set coordinates
            let x = center_x + Math.cos(rads * t) * (radius);
            let y = center_y + Math.sin(rads * t) * (radius);
            let x_end = center_x + Math.cos(rads * t)*(radius + bar_height);
            let y_end = center_y + Math.sin(rads * t)*(radius + bar_height);
            //draw a bar
            this.drawBar(x, y, x_end, y_end, 2, context, gradient);
        }
        this.test = this.test > bufferLen ? 0 : this.test+1;
    }

    drawBar(x1: number, y1: number, x2: number, y2: number, width: number, context: CanvasRenderingContext2D, gradient: CanvasGradient){
        context.strokeStyle = gradient;
        context.lineWidth = width;
        context.beginPath();
        context.moveTo(x1,y1);
        context.lineTo(x2,y2);
        context.stroke();
    }

    animationLoop(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, bufferLen: number, dataArray: Uint8Array, gradient: CanvasGradient) {
        this.clearFrequencyCanvas(canvas,context);
        let barWidth = canvas.width / bufferLen;
        let barHeight;
        let x = 0;
        // values go from 0 to 256 and the canvas heigt is 100. Let's rescale
        // before drawing. This is the scale factor
        let heightScale = canvas.height / 128;
        for (let i = 0; i < bufferLen; i++) {
            barHeight = dataArray[i];
            context.fillStyle = gradient/*'rgb(' + (barHeight + 100) + ',50,50)'*/;
            barHeight *= heightScale;
            context.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
            // 2 is the number of pixels between bars
            x += barWidth + 1;
        }
    }

    clearCanvasWave(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D){
        context.clearRect(0,0,canvas.width, canvas.height)
        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);
 
        context.lineWidth = 2;
        context.strokeStyle = 'rgb(243, 173, 22)';

        // draw a red line
        context.beginPath();
        context.moveTo(0, canvas.height/2);
        context.lineTo(canvas.width, canvas.height/2);
        context.stroke();
    }

    drawWaveform(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, bufferLen: number, dataArray: Uint8Array) {

        context.fillStyle = 'rgba(0, 0, 0, 0.5)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.save();
        // Get the analyser data
        
        context.lineWidth = 2;
        context.strokeStyle = 'rgb(243, 173, 22)';
      
        // all the waveform is in one single path, first let's
        // clear any previous path that could be in the buffer
        context.beginPath();
        
        var sliceWidth = canvas.width / bufferLen;
        var x = 0;
        
        // values go from 0 to 256 and the canvas heigt is 100. Let's rescale
        // before drawing. This is the scale factor
        //let heightScale = this.canvas3.height/128;
      
        for(var i = 0; i < bufferLen; i++) {
           // dataArray[i] between 0 and 255
           var v = dataArray[i] / 255;
           var y = v * canvas.height;
          
           if(i === 0) {
            context.moveTo(x, y);
           } else {
            context.lineTo(x, y);
           }
      
           x += sliceWidth;
        }
      
        context.lineTo(canvas.width, canvas.height/2);
        
        // draw the path at once
        context.stroke();    
        context.restore();
      }

}