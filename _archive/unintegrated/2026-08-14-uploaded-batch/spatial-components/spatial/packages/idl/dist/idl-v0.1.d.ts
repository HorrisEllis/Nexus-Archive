export type Norm = number;
export interface IntimacySignature {
    attachmentStability: Norm;
    closenessTolerance: Norm;
    dependencyResponse: Norm;
    emotionalDisclosureRate: Norm;
    relationalConsistency: Norm;
    autonomyDrive: Norm;
}
export interface IntimacyAxes {
    structureChaos: {
        structure: Norm;
        chaos: Norm;
    };
    devotion: {
        persistenceInAttachment: Norm;
        repairTendency: Norm;
        relationalMemoryStrength: Norm;
    };
    permeability: {
        emotionalOpenness: Norm;
        vulnerabilitySpeed: Norm;
        boundaryFlexibility: Norm;
    };
    regulation: {
        emotionalRecoverySpeed: Norm;
        conflictDeescalation: Norm;
        selfStabilization: Norm;
    };
}
export interface IntimacyWaveState {
    timestamp: number;
    closenessPressure: Norm;
    conflictPressure: Norm;
    uncertaintyPressure: Norm;
    attachmentActivation: Norm;
    withdrawalDrive: Norm;
    overattachmentDrive: Norm;
}
export interface IntimacyTrajectory {
    history: IntimacyWaveState[];
}
export interface IntimacySystem {
    signature: IntimacySignature;
    axes: IntimacyAxes;
    trajectory: IntimacyTrajectory;
}
export declare function computeStructureChaos(a: IntimacyAxes["structureChaos"]): {
    structure: number;
    chaos: number;
};
export declare function computeDevotion(d: IntimacyAxes["devotion"]): number;
export declare function computePermeability(p: IntimacyAxes["permeability"]): number;
export declare function computeRegulation(r: IntimacyAxes["regulation"]): number;
export declare function stepIntimacyState(prev: IntimacyWaveState, axes: IntimacyAxes): IntimacyWaveState;
export declare function computeWave(system: IntimacySystem): IntimacyTrajectory;
export declare function computeCoupling(a: IntimacySystem, b: IntimacySystem): {
    stabilityScore: number;
    frictionScore: number;
    interpretation: string;
};
