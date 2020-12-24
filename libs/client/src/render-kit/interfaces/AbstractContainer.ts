import { RzPoint } from "../internal";

export interface AbstractContainer {
    addChild(child: any): void;
    removeChild(child: any): void;
    getGlobalPosition(): RzPoint;

    getChildIndex(child: any): number;
    setChildIndex(child: any, newIndex: number): void;
    addChildAt(child: any, newIndex: number): void;
    children?: any[];
}