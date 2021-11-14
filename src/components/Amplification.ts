
export type CalculFilterValue = (value: number) => number;

export enum NameFilter {
    BASS,
    MIDDLE,
    TREBLE,
    PRESENCE,
    EQ60,
    EQ170,
    EQ350,
    EQ1000,
    EQ3500,
    EQ10K
}

export class AudioFilter{
    filter: BiquadFilterNode;
    private calculValue: CalculFilterValue;
    constructor(context: AudioContext, frequency: number, type: BiquadFilterType, set: CalculFilterValue = null){
        this.filter = context.createBiquadFilter();
        this.filter.frequency.value = frequency;
        this.filter.type = type;
        this.calculValue = set;
    }
    setGain(value: number){
        this.filter.gain.value = this.calculValue !== null ? this.calculValue(value) : value;
    }
}

export class Amplification {





}