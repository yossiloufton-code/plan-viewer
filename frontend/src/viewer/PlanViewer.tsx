import { useEffect, useMemo, useRef } from "react";
import { useViewer } from "./useViewer";
import { viewerClamp } from "./ViewerContext";

type Props = {
    src: string;
    alt?: string;
    minScale?: number; // e.g. 0.25
    maxScale?: number; // e.g. 5
};

export default function PlanViewer({ src, alt = "Plan", minScale = 0.25, maxScale = 5 }: Props) {
    const {
        transform,
        setTransform,
        setImageSize,
        setViewportSize,
        addLog,
        resetCenter,
        panSessionRef,
    } = useViewer();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

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

    // Once image loads, store its natural size and center it
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

        // cursor position in viewport coordinates
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        // zoom factor (trackpad/mouse friendly)
        const zoomIntensity = 0.0015;
        const delta = -e.deltaY; // positive means zoom in
        const factor = Math.exp(delta * zoomIntensity);

        setTransform((prev) => {
            const oldScale = prev.scale;
            const newScale = viewerClamp(oldScale * factor, minScale, maxScale);

            if (newScale === oldScale) return prev;

            // world coords under cursor before zoom
            const worldX = (cx - prev.tx) / oldScale;
            const worldY = (cy - prev.ty) / oldScale;

            // new translate keeps same world point under cursor
            const newTx = cx - worldX * newScale;
            const newTy = cy - worldY * newScale;

            addLog({
                type: newScale > oldScale ? "zoom_in" : "zoom_out",
                details: `scale ${oldScale.toFixed(3)} → ${newScale.toFixed(3)}`,
            });

            return { scale: newScale, tx: newTx, ty: newTy };
        });
    };

    const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
        // left click only
        if (e.button !== 0) return;

        const el = containerRef.current;
        if (!el) return;

        el.setPointerCapture?.((e as unknown as PointerEvent).pointerId); // harmless if not supported

        panSessionRef.current.active = true;
        panSessionRef.current.startX = e.clientX;
        panSessionRef.current.startY = e.clientY;
        panSessionRef.current.startTx = transform.tx;
        panSessionRef.current.startTy = transform.ty;

        addLog({ type: "pan_start", details: `start tx=${transform.tx.toFixed(1)}, ty=${transform.ty.toFixed(1)}` });
    };

    const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
        if (!panSessionRef.current.active) return;

        const dx = e.clientX - panSessionRef.current.startX;
        const dy = e.clientY - panSessionRef.current.startY;

        setTransform((prev) => ({
            ...prev,
            tx: panSessionRef.current.startTx + dx,
            ty: panSessionRef.current.startTy + dy,
        }));
    };

    const endPan = (clientX?: number, clientY?: number) => {
        if (!panSessionRef.current.active) return;

        panSessionRef.current.active = false;

        const startTx = panSessionRef.current.startTx;
        const startTy = panSessionRef.current.startTy;

        const endTx = transform.tx;
        const endTy = transform.ty;

        const deltaTx = endTx - startTx;
        const deltaTy = endTy - startTy;

        addLog({
            type: "pan_end",
            details: `delta dx=${deltaTx.toFixed(1)}, dy=${deltaTy.toFixed(1)}` + (clientX && clientY ? ` (mouse ${clientX},${clientY})` : ""),
        });
    };

    const handleMouseUp: React.MouseEventHandler<HTMLDivElement> = (e) => {
        endPan(e.clientX, e.clientY);
    };

    const handleMouseLeave: React.MouseEventHandler<HTMLDivElement> = () => {
        endPan();
    };

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
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onDoubleClick={resetCenter}
            style={{
                height: "100%",
                width: "100%",
                overflow: "hidden",
                background: "#0b0b0b",
                position: "relative",
                cursor: panSessionRef.current.active ? "grabbing" : "grab",
            }}
        >
            <img ref={imgRef} src={src} alt={alt} onLoad={onImgLoad} draggable={false} style={transformStyle} />
        </div>
    );
}
