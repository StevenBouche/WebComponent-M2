
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

    private bufferLength: number;
    private dataArray: Uint8Array;

    private bufferLength3: number;
    private dataArray3: Uint8Array;

    private analyser: AnalyserNode;

    private playlist: Playlist;

    connectedCallback() {

        super.connectedCallback();

        this.audio = this.shadowRoot.querySelector("#audio");
        this.playlist = this.shadowRoot.querySelector('#audio-playlist');

        this.playlist.addEventListener('selected', ((event: CustomEvent) => {
            this.audio.setURL(event.detail);
          }) as EventListener);

        this.audio.onplay = (event) => {
            this.analyser = this.audio.analyser;

            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);

            this.bufferLength3 = this.analyser.frequencyBinCount;
            this.dataArray3 = new Uint8Array(this.bufferLength);

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
 
         //setting canvas
         this.canvas2 = this.shadowRoot.querySelector("#myCanvas2");
         this.ctx2 = this.canvas2.getContext("2d");

         //setting canvas
         this.canvas3 = this.shadowRoot.querySelector("#myCanvas3");
         this.ctx3 = this.canvas3.getContext("2d");

         if(this.sourceAudio !== undefined){
            this.playlist.addElement(this.sourceAudio);
        }
    }

    requestFrame(): number {
        return requestAnimationFrame(() => {
            this.refreshByteFrequency();
            this.animationLoop();
            this.animationLoop2();
            this.drawWaveform();
            this.animationFrameId = this.requestFrame();
        });
    }

    private refreshByteFrequency(){
        // Get the analyser data
        this.analyser.getByteFrequencyData(this.dataArray);
        this.analyser.getByteTimeDomainData(this.dataArray3);
    }

    stopAnnimationFrame() {
        cancelAnimationFrame(this.animationFrameId);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animationLoop2() {

        this.ctx2.clearRect(0, 0, this.canvas2.width, this.canvas2.height);
        this.ctx2.fillStyle = 'rgb(0, 0, 0)';
        this.ctx2.fillRect(0, 0, this.canvas2.width, this.canvas2.height);

        let center_x = this.canvas2.width / 2;
        let center_y = this.canvas2.height / 2;
        let radius = 20;    

        //draw a circle
        this.ctx2.beginPath();
        this.ctx2.arc(center_x,center_y,radius,0,2*Math.PI);
        this.ctx2.stroke();

        for(var i = 0; i < this.bufferLength; i++){

            //divide a circle into equal parts
            let rads = Math.PI * 2 / this.bufferLength;
            
            let bar_height = this.dataArray[i]*0.2;
            
            // set coordinates
            let x = center_x + Math.cos(rads * i) * (radius);
            let y = center_y + Math.sin(rads * i) * (radius);
            let x_end = center_x + Math.cos(rads * i)*(radius + bar_height);
            let y_end = center_y + Math.sin(rads * i)*(radius + bar_height);
            //draw a bar
            this.drawBar(x, y, x_end, y_end, 3, this.dataArray[i]);

        }

    }

    drawBar(x1, y1, x2, y2, width,frequency){
        var lineColor = "rgb(" + frequency + ", " + frequency + ", " + 205 + ")";
        this.ctx2.strokeStyle = lineColor;
        this.ctx2.lineWidth = width;
        this.ctx2.beginPath();
        this.ctx2.moveTo(x1,y1);
        this.ctx2.lineTo(x2,y2);
        this.ctx2.stroke();
    }

    animationLoop() {
        // 1 on efface le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgb(0, 0, 0)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // 2 on dessine les objets
        //this.ctx.fillRect(10+Math.random()*20, 10, 100, 100);
        
        let barWidth = this.canvas.width / this.bufferLength;
        let barHeight;
        let x = 0;
    
        // values go from 0 to 256 and the canvas heigt is 100. Let's rescale
        // before drawing. This is the scale factor
        let heightScale = this.canvas.height / 128;
    
        for (let i = 0; i < this.bufferLength; i++) {
            barHeight = this.dataArray[i];
    
            this.ctx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
            barHeight *= heightScale;
            this.ctx.fillRect(x, this.canvas.height - barHeight / 2, barWidth, barHeight / 2);
    
            // 2 is the number of pixels between bars
            x += barWidth + 1;
        }
        // 3 on deplace les objets
    }

    drawWaveform() {

        this.ctx3.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx3.fillRect(0, 0, this.canvas3.width, this.canvas3.height);

        this.ctx3.save();
        // Get the analyser data
        
        this.ctx3.lineWidth = 2;
        this.ctx3.strokeStyle = 'lightBlue';
      
        // all the waveform is in one single path, first let's
        // clear any previous path that could be in the buffer
        this.ctx3.beginPath();
        
        var sliceWidth = this.canvas3.width / this.bufferLength3;
        var x = 0;
        
            // values go from 0 to 256 and the canvas heigt is 100. Let's rescale
            // before drawing. This is the scale factor
            let heightScale = this.canvas3.height/128;
      
        for(var i = 0; i < this.bufferLength; i++) {
           // dataArray[i] between 0 and 255
           var v = this.dataArray3[i] / 255;
           var y = v * this.canvas3.height;
          
           if(i === 0) {
            this.ctx3.moveTo(x, y);
           } else {
            this.ctx3.lineTo(x, y);
           }
      
           x += sliceWidth;
        }
      
        this.ctx3.lineTo(this.canvas3.width, this.canvas3.height/2);
        
        // draw the path at once
        this.ctx3.stroke();    
        this.ctx3.restore();
      }

}