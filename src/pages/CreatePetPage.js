import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { usePets } from "../hooks/usePets";
import { useAuth } from "../hooks/useAuth";
import Input from "../components/Input";
import RadioButton from "../components/RadioButton";
import Button from "../components/Button";
import FileInputButton from "../components/FileInputButton";
import PhotoCropper from "../components/PhotoCropper";
import uploadFile from "./uploadFile";

const StyledPage = styled.div`
  display: flex;
  align-items: center;
  height: 100vh;
  max-width: 450px;
  margin: 0 auto;
  padding: 32px;
  h1 {
    margin-bottom: 80px;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
  }
  .upload-avatar {
    height: 100px;
    width: 100px;
    border-radius: 100%;
    background-color: var(--neutral-200);
  }
`;

const Step0 = ({ handleChange, formData: { name, species } }) => {
  return (
    <>
      <Input
        label="名字"
        name="name"
        value={name}
        onChange={handleChange}
        placeholder="請輸入名字"
        required
      />
      <RadioButton.Group>
        <RadioButton
          label="貓"
          name="species"
          value="cat"
          onChange={handleChange}
          checked={species === "cat"}
          required
        />

        <RadioButton
          label="狗"
          name="species"
          id="dog"
          value="dog"
          checked={species === "dog"}
          onChange={handleChange}
          required
        />
      </RadioButton.Group>
    </>
  );
};

const Step1 = ({ handleChange, formData: { sex, birthday } }) => {
  return (
    <>
      <RadioButton.Group>
        <RadioButton
          label="公"
          name="sex"
          value="male"
          checked={sex === "male"}
          onChange={handleChange}
          required
        />

        <RadioButton
          label="母"
          name="sex"
          id="female"
          value="female"
          checked={sex === "female"}
          onChange={handleChange}
          required
        />
      </RadioButton.Group>

      <Input
        label="出生日期"
        type="date"
        name="birthday"
        value={birthday}
        onChange={handleChange}
      />
    </>
  );
};

const Step2 = ({ handleFile, photoUrl, uploadProgress }) => {
  const uploading = typeof uploadProgress === "number";
  const uploadFailed = uploadProgress === "error";

  return (
    <>
      <div
        className="upload-avatar"
        style={{
          backgroundImage: `url(${photoUrl})`,
          backgroundSize: "contain",
        }}
      />
      <FileInputButton
        label={photoUrl ? "更換照片" : "上傳照片"}
        onChange={handleFile}
      />
      {uploading && <p style={{ fontSize: 14, color: "var(--neutral-500)" }}>上傳中... {uploadProgress}%</p>}
      {uploadFailed && <p style={{ fontSize: 14, color: "#e00" }}>上傳失敗，可跳過或重新選擇照片</p>}
      {uploadProgress === "done" && <p style={{ fontSize: 14, color: "var(--neutral-500)" }}>上傳完成</p>}
    </>
  );
};

const LastStep = () => {
  return <div>已完成！</div>;
};

export default function CreateFirstPetPage() {
  const [form, setForm] = useState({
    name: "",
    sex: "",
    birthday: "",
    species: "",
    photoUrl: "",
  });
  const [file, setFile] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);
  const [rawImageSrc, setRawImageSrc] = useState(null);

  const [step, setStep] = useState(0);

  const { user } = useAuth();
  const { createPet } = usePets(user.uid);

  const navigate = useNavigate();

  const goToNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const goToPrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleChange = (e) => {
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
    createPet(form);
    goToNextStep();
  };

  useEffect(() => {
    if (file) {
      const path = `${user.uid}/${form.name}/profile`;
      const setUrl = (url) => setForm((prev) => ({ ...prev, photoUrl: url }));
      setUploadProgress(0);
      uploadFile(file, path, setUrl, setUploadProgress);
    }
  }, [file]);

  const stepList = [
    <Step0 formData={form} handleChange={handleChange} />,
    <Step1 formData={form} handleChange={handleChange} />,
    <Step2
      handleFile={handleFile}
      photoUrl={form.photoUrl}
      uploadProgress={uploadProgress}
    />,
    <LastStep />,
  ];

  const lastStep = stepList.length - 1;
  const formCompleted = lastStep - 1;

  return (
    <StyledPage>
      <form onSubmit={handleSubmit}>
        <h1>建立寵物資料</h1>
        {stepList[step]}
        {step !== 0 && step !== lastStep && (
          <Button label="上一步" onClick={goToPrevStep} variant="secondary" />
        )}
        {step === lastStep && (
          <Button label="開始使用" onClick={() => navigate("/")} />
        )}
        {step === formCompleted && (
          <>
            <Button label="送出" type="submit" />
            <Button label="跳過" variant="secondary" onClick={() => { createPet(form); goToNextStep(); }} />
          </>
        )}
        {step < formCompleted && (
          <Button label="下一步" onClick={goToNextStep} />
        )}
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
