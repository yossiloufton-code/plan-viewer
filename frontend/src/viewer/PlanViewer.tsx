import { useEffect, useRef } from "react";
import { useViewer } from "./useViewer";
import { viewerClamp } from "./ViewerContext";

type Props = {
    src: string;
    alt?: string;
    minScale?: number;
    maxScale?: number;
};

export default function PlanViewer({ src, alt = "Plan", minScale = 0.25, maxScale = 5 }: Props) {
    const { transform, setTransform, setImageSize, setViewportSize, addLog, resetCenter, panSessionRef } =
        useViewer();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

    // Keep latest transform for endPan logging (avoid stale closure)
    const transformRef = useRef(transform);
    useEffect(() => {
        transformRef.current = transform;
    }, [transform]);

    // Keep viewport size updated
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const ro = new ResizeObserver(() => {
            const rect = el.getBoundingClientRect();
            setViewportSize({ width: rect.width, height: rect.height });
        });

        ro.observe(el);
        return () => ro.disconnect();
    }, [setViewportSize]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const onWheel = (e: WheelEvent) => handleWheelNative(e);

        // critical: passive: false so preventDefault actually blocks page scroll
        el.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            el.removeEventListener("wheel", onWheel as EventListener);
        };
    }, [minScale, maxScale]);


    const onImgLoad = () => {
        const img = imgRef.current;
        const el = containerRef.current;
        if (!img || !el) return;

        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });

        const rect = el.getBoundingClientRect();
        const tx = (rect.width - img.naturalWidth) / 2;
        const ty = (rect.height - img.naturalHeight) / 2;

        setTransform({ scale: 1, tx, ty });
    };

    const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault();

        const el = containerRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        const zoomIntensity = 0.0015;
        const delta = -e.deltaY;
        const factor = Math.exp(delta * zoomIntensity);

        setTransform((prev) => {
            const oldScale = prev.scale;
            const newScale = viewerClamp(oldScale * factor, minScale, maxScale);
            if (newScale === oldScale) return prev;

            const worldX = (cx - prev.tx) / oldScale;
            const worldY = (cy - prev.ty) / oldScale;

            const newTx = cx - worldX * newScale;
            const newTy = cy - worldY * newScale;

            addLog({
                type: newScale > oldScale ? "zoom_in" : "zoom_out",
                details: `scale ${oldScale.toFixed(3)} → ${newScale.toFixed(3)}`,
            });

            return { scale: newScale, tx: newTx, ty: newTy };
        });
    };
    const handleWheelNative = (e: WheelEvent) => {
        // Prevent page scroll while zooming inside viewer
        e.preventDefault();

        const el = containerRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        const zoomIntensity = 0.0015;
        const delta = -e.deltaY;
        const factor = Math.exp(delta * zoomIntensity);

        setTransform((prev) => {
            const oldScale = prev.scale;
            const newScale = viewerClamp(oldScale * factor, minScale, maxScale);
            if (newScale === oldScale) return prev;

            const worldX = (cx - prev.tx) / oldScale;
            const worldY = (cy - prev.ty) / oldScale;

            const newTx = cx - worldX * newScale;
            const newTy = cy - worldY * newScale;

            addLog({
                type: newScale > oldScale ? "zoom_in" : "zoom_out",
                details: `scale ${oldScale.toFixed(3)} → ${newScale.toFixed(3)}`,
            });

            return { scale: newScale, tx: newTx, ty: newTy };
        });
    };


    const endPan = () => {
        if (!panSessionRef.current.active) return;
        panSessionRef.current.active = false;

        const startTx = panSessionRef.current.startTx;
        const startTy = panSessionRef.current.startTy;

        const endTx = transformRef.current.tx;
        const endTy = transformRef.current.ty;

        addLog({
            type: "pan_end",
            details: `delta dx=${(endTx - startTx).toFixed(1)}, dy=${(endTy - startTy).toFixed(1)}`,
        });
    };

    const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
        if (e.button !== 0) return; // left click only
        const el = containerRef.current;
        if (!el) return;

        el.setPointerCapture(e.pointerId);

        panSessionRef.current.active = true;
        panSessionRef.current.startX = e.clientX;
        panSessionRef.current.startY = e.clientY;
        panSessionRef.current.startTx = transformRef.current.tx;
        panSessionRef.current.startTy = transformRef.current.ty;

        addLog({
            type: "pan_start",
            details: `start tx=${transformRef.current.tx.toFixed(1)}, ty=${transformRef.current.ty.toFixed(1)}`,
        });
    };

    const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
        if (!panSessionRef.current.active) return;

        const dx = e.clientX - panSessionRef.current.startX;
        const dy = e.clientY - panSessionRef.current.startY;

        setTransform((prev) => ({
            ...prev,
            tx: panSessionRef.current.startTx + dx,
            ty: panSessionRef.current.startTy + dy,
        }));
    };

    const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = () => endPan();
    const handlePointerCancel: React.PointerEventHandler<HTMLDivElement> = () => endPan();

    const transformStyle: React.CSSProperties = {
        transform: `translate(${transform.tx}px, ${transform.ty}px) scale(${transform.scale})`,
        transformOrigin: "0 0",
        willChange: "transform",
        userSelect: "none",
        pointerEvents: "none",
    };

    return (
        <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onDoubleClick={resetCenter}
            style={{
                height: "100%",
                width: "100%",
                overflow: "hidden",
                background: "#0b0b0b",
                position: "relative",
                cursor: panSessionRef.current.active ? "grabbing" : "grab",
                touchAction: "none",
                overscrollBehavior: "contain",
            }}
        >
            <img ref={imgRef} src={src} alt={alt} onLoad={onImgLoad} draggable={false} style={transformStyle} />
        </div>
    );
}
