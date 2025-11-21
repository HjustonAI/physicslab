import { useEffect, useRef, useCallback } from "react";

type UpdateCallback = (deltaTime: number) => void;

export const useGameLoop = (callback: UpdateCallback) => {
    const requestRef = useRef<number | null>(null);
    const previousTimeRef = useRef<number | null>(null);

    const animate = useCallback(
        (time: number) => {
            if (previousTimeRef.current !== null) {
                const deltaTime = time - previousTimeRef.current;
                callback(deltaTime);
            }
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        },
        [callback]
    );

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [animate]);
};
