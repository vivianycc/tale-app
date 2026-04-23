import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import styled from "styled-components";
import Button from "./Button";
import getCroppedBlob from "../utils/cropImage";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const CropArea = styled.div`
  position: relative;
  flex: 1;
  background: #000;
`;

const Controls = styled.div`
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .zoom-row {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: var(--neutral-700);
  }
  .zoom-row input {
    flex: 1;
  }
  .buttons {
    display: flex;
    gap: 12px;
  }
  .buttons > * {
    flex: 1;
  }
`;

export default function PhotoCropper({ imageSrc, onCancel, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const confirm = async () => {
    if (!croppedAreaPixels) return;
    setBusy(true);
    const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
    setBusy(false);
    onConfirm(blob);
  };

  return (
    <Overlay>
      <CropArea>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </CropArea>
      <Controls>
        <div className="zoom-row">
          <span>縮放</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>
        <div className="buttons">
          <Button label="取消" variant="secondary" onClick={onCancel} />
          <Button label={busy ? "處理中..." : "確認"} onClick={confirm} />
        </div>
      </Controls>
    </Overlay>
  );
}
