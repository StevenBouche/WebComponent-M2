export class Utils{

    static getValueInput(target: EventTarget): number{
        return parseFloat((<HTMLInputElement>target).value);
    }

    static mapRange(value: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
        let val = (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
        if (val < out_min) val = out_min;
        else if (val > out_max) val = out_max;
        return Math.round(val*100)/100;
    }

}