export class Utils{

    static getValueInput(target: EventTarget): number{
        return parseFloat((<HTMLInputElement>target).value);
    }

}