import { useState, useCallback, useRef, useEffect } from "react";
import { useGameLoop } from "@/hooks/useGameLoop";
import { Point } from "@/types/physics";

interface ProjectileState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    isFlying: boolean;
    path: Point[];
}

interface PhysicsParams {
    velocity: number;
    angle: number;
    gravity: number;
    startPos: Point;
}

export function useProjectilePhysics(params: PhysicsParams) {
    const [simState, setSimState] = useState<ProjectileState>({
        x: params.startPos.x,
        y: params.startPos.y,
        vx: 0,
        vy: 0,
        isFlying: false,
        path: [],
    });

    // Data History for Oscilloscopes
    const [heightData, setHeightData] = useState<number[]>([]);
    const [velocityData, setVelocityData] = useState<number[]>([]);

    const stateRef = useRef(simState);
    useEffect(() => {
        stateRef.current = simState;
    }, [simState]);

    // Update simState when startPos changes (if not flying)
    useEffect(() => {
        if (!simState.isFlying) {
            setSimState(prev => ({
                ...prev,
                x: params.startPos.x,
                y: params.startPos.y,
                path: []
            }));
        }
    }, [params.startPos, simState.isFlying]);

    const update = useCallback((deltaTime: number) => {
        if (!stateRef.current.isFlying) return;

        setSimState((prev) => {
            const dt = deltaTime / 100; // Time scaling
            let { x, y, vx, vy } = prev;
            const { path } = prev;

            // Apply Gravity
            vy += params.gravity * dt;

            // Update Position
            x += vx * dt;
            y += vy * dt;

            // Ground Collision (Simple floor at startPos.y)
            if (y > params.startPos.y) {
                y = params.startPos.y;
                return { ...prev, x, y, isFlying: false, path: [...path, { x, y }] };
            }

            // Record Data
            const currentHeight = Math.max(0, params.startPos.y - y);
            const currentVy = -vy;

            setHeightData(prevData => {
                const newData = [...prevData, currentHeight];
                if (newData.length > 100) newData.shift();
                return newData;
            });

            setVelocityData(prevData => {
                const newData = [...prevData, currentVy];
                if (newData.length > 100) newData.shift();
                return newData;
            });

            return { ...prev, x, y, vx, vy, path: [...path, { x, y }] };
        });
    }, [params.gravity, params.startPos.y]);

    useGameLoop(update);

    const fire = useCallback(() => {
        const rad = (params.angle * Math.PI) / 180;
        const vx = params.velocity * Math.cos(rad);
        const vy = -params.velocity * Math.sin(rad);

        setHeightData([]);
        setVelocityData([]);

        setSimState({
            x: params.startPos.x,
            y: params.startPos.y,
            vx,
            vy,
            isFlying: true,
            path: [{ x: params.startPos.x, y: params.startPos.y }],
        });
    }, [params.angle, params.velocity, params.startPos]);

    const reset = useCallback(() => {
        setSimState({
            x: params.startPos.x,
            y: params.startPos.y,
            vx: 0,
            vy: 0,
            isFlying: false,
            path: [],
        });
        setHeightData([]);
        setVelocityData([]);
    }, [params.startPos]);

    return {
        simState,
        heightData,
        velocityData,
        fire,
        reset
    };
}
