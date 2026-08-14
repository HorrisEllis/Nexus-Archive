import { IntimacySystem, IntimacyAxes } from "./idl-v0.1";
export type LearningRate = number;
export interface AdaptiveAxes extends IntimacyAxes {
    learningRates: {
        structureChaos: LearningRate;
        devotion: LearningRate;
        permeability: LearningRate;
        regulation: LearningRate;
    };
}
export interface InteractionEvent {
    timestamp: number;
    intimacyPressure: number;
    conflict: number;
    closeness: number;
    rupture: number;
}
export declare function updateAxesFromInteraction(axes: AdaptiveAxes, event: InteractionEvent, partnerSignal: Partial<IntimacyAxes>): AdaptiveAxes;
export interface InteractionMemory {
    events: InteractionEvent[];
    decayFactor: number;
}
export declare function applyMemoryDecay(memory: InteractionMemory): InteractionMemory;
export declare function stepAdaptiveSystem(system: IntimacySystem, memory: InteractionMemory, latestEvent: InteractionEvent): IntimacySystem;
export declare function computeRelationshipField(systems: IntimacySystem[]): Record<string, Record<string, number>>;
