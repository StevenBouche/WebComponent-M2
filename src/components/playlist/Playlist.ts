import htmlFile from "./Playlist.html";
import cssFile from './Playlist.css'
import {
    html,
    css,
    customElement,
    FASTElement,
    attr,
} from "@microsoft/fast-element";

const template = html<Playlist> `${htmlFile}`;
const styles = css`${cssFile}`;

@customElement({
    name: "audio-playlist",
    template,
    styles,
})
export class Playlist extends FASTElement {
    
    private list: Array<string> = [ ];
    private container: HTMLDivElement;
    private elementSelected: string;
    private input: HTMLInputElement;
    private button: HTMLButtonElement;

    connectedCallback() {
        super.connectedCallback();
        this.container = this.shadowRoot.querySelector("#elements-playlist");
        this.input = this.shadowRoot.querySelector('#input-add-playlist');
        this.button = this.shadowRoot.querySelector('#button-add-playlist');

        this.button.onclick = () => {
            const value = this.input.value;
            this.addElement(value);
        }

        this.render();
    }

    addElement(sourceAudio: string) {
        this.list.push(sourceAudio);
        if(this.list.length===1){
            this.setElementSelected(sourceAudio);
        }
        this.render();
    }

    render(){
        this.container.innerHTML = '';
        for(const element of this.list){
            const div = document.createElement('div');
            const text = document.createElement('span');
            text.innerText = element;
            div.appendChild(text);
            div.onclick = () => { 
                this.setElementSelected(element); 
                this.render();
            }
            if(this.elementSelected === element){
                div.className += 'selected';
            }
            this.container.appendChild(div);
        } 
    }

    setElementSelected(element: string){
        this.elementSelected = element;
        this.dispatchEvent(new CustomEvent("selected", ({detail: element}) as CustomEventInit<string>))
    }
}
