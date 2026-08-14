import { IntimacySystem } from "./idl-v0.1";
export interface ResonanceVector {
    structureAlignment: number;
    permeabilityAlignment: number;
    regulationSync: number;
    devotionCoupling: number;
    temporalPhaseSync: number;
}
export interface ResonanceResult {
    resonanceScore: number;
    stabilityIndex: number;
    frictionIndex: number;
    driftConvergence: number;
    oscillationMismatch: number;
    vector: ResonanceVector;
    classification: "harmonic_stability" | "growth_friction" | "asynchronous_drift" | "volatile_coupling" | "low_interaction_field";
}
export declare function computeResonance(A: IntimacySystem, B: IntimacySystem): ResonanceResult;
