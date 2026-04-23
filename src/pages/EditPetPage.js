import { useState } from "react";
import styled from "styled-components";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { getFirebase } from "../firebase";
import { setDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable } from "firebase/storage";
import { useAuth } from "../hooks/useAuth";
import RadioButton from "../components/RadioButton";
import Button from "../components/Button";
import Input from "../components/Input";
import FileInputButton from "../components/FileInputButton";
import uploadFile from "./uploadFile";
import PhotoCropper from "../components/PhotoCropper";
import { useEffect } from "react";

const StyledPage = styled.div`
  padding: 24px;
  form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .photo-row {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }
  .avatar {
    height: 72px;
    width: 72px;
    border-radius: 100%;
    background-color: var(--neutral-300);
    background-size: contain;
    background-repeat: no-repeat;
  }
`;

export default function CreatePetPage() {
  const location = useLocation();
  const pet = location.state?.pet;
  const [form, setForm] = useState({
    photoUrl: pet?.photoUrl || "",
    name: pet?.name || "",
    species: pet?.species || "",
    breed: pet?.breed || "",
    birthday: pet?.birthday || "",
    neutered: pet?.neutered || "",
    chipNumber: pet?.chipNumber || "",
    sex: pet?.sex || "",
  });

  const [file, setFile] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [rawImageSrc, setRawImageSrc] = useState(null);

  const navigate = useNavigate();

  console.log("pet from location", pet);
  const { firestore, storage } = getFirebase();
  const { user } = useAuth();

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    const picked = e.target.files[0];
    if (!picked) return;
    const reader = new FileReader();
    reader.onload = () => setRawImageSrc(reader.result);
    reader.readAsDataURL(picked);
    e.target.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatePet = async (data) => {
      const petRef = doc(firestore, "users", user.uid, "pets", pet.name);
      setDoc(petRef, { ...data, name: pet.name }, { merge: true });
    };

    updatePet(form);
    navigate("/profile");
  };
  const handleCancel = () => {
    navigate("/profile");
  };

  useEffect(() => {
    if (file && user) {
      const setPhotoUrl = (url) => setForm((prev) => ({ ...prev, photoUrl: url }));
      setUploadProgress(0);
      uploadFile(file, `${user.uid}/${form.name}/profile`, setPhotoUrl, setUploadProgress);
    }
  }, [file]);

  if (!pet) {
    return <Navigate to="/profile" replace />;
  }

  const { name, breed, species, birthday, neutered, chipNumber, sex } = form;
  return (
    <StyledPage>
      <form onSubmit={handleSubmit}>
        <div className="photo-row">
          <div
            className="avatar"
            style={{ backgroundImage: `url(${form.photoUrl})` }}
          ></div>
          <FileInputButton
            label={form.photoUrl ? "更換照片" : "上傳照片"}
            onChange={handleFile}
          />
          {typeof uploadProgress === "number" && (
            <p style={{ fontSize: 14, color: "var(--neutral-500)" }}>上傳中... {uploadProgress}%</p>
          )}
          {uploadProgress === "error" && (
            <p style={{ fontSize: 14, color: "#e00" }}>上傳失敗，可重新選擇照片</p>
          )}
          {uploadProgress === "done" && (
            <p style={{ fontSize: 14, color: "var(--neutral-500)" }}>上傳完成</p>
          )}
        </div>

        <Input
          label="名字"
          name="name"
          value={name}
          placeholder="請輸入名字"
          readOnly
          disabled
        />
        <RadioButton.Group>
          <RadioButton
            label="貓"
            name="species"
            value="cat"
            onChange={handleInput}
            checked={species === "cat"}
            required
          />

          <RadioButton
            label="狗"
            name="species"
            id="dog"
            value="dog"
            checked={species === "dog"}
            onChange={handleInput}
            required
          />
        </RadioButton.Group>

        <Input
          label="品種"
          name="breed"
          value={breed}
          onChange={handleInput}
          placeholder="請輸入品種"
        />

        <RadioButton.Group>
          <RadioButton
            label="公"
            name="sex"
            value="male"
            checked={sex === "male"}
            onChange={handleInput}
            required
          />

          <RadioButton
            label="母"
            name="sex"
            id="female"
            value="female"
            checked={sex === "female"}
            onChange={handleInput}
            required
          />
        </RadioButton.Group>

        <Input
          label="出生日期"
          type="date"
          name="birthday"
          value={birthday}
          onChange={handleInput}
        />
        <RadioButton.Group>
          <RadioButton
            label="已結紮"
            name="neutered"
            value={true}
            checked={!!neutered}
            onChange={handleInput}
          />
          <RadioButton
            label="未結紮"
            name="neutered"
            value={false}
            checked={!!neutered}
            onChange={handleInput}
          />
        </RadioButton.Group>

        <Input
          label="晶片號碼"
          name="chipNumber"
          value={chipNumber}
          onChange={handleInput}
          placeholder="請輸入晶片號碼"
        />

        <Button label="送出" type="submit" />
        <Button label="取消變更" onClick={handleCancel} variant="secondary" />
      </form>
      {rawImageSrc && (
        <PhotoCropper
          imageSrc={rawImageSrc}
          onCancel={() => setRawImageSrc(null)}
          onConfirm={(blob) => {
            setRawImageSrc(null);
            setFile(blob);
          }}
        />
      )}
    </StyledPage>
  );
}
