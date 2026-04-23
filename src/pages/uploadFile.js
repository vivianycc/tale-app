import { getFirebase } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const { storage } = getFirebase();

export default function uploadFile(file, path, setUrl, onProgress) {
  let fileExt = file.type.substring(
    file.type.lastIndexOf("/") + 1,
    file.type.length
  );

  const storageRef = ref(storage, `${path}.${fileExt}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = Math.round(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );
      if (onProgress) onProgress(progress);
    },
    (error) => {
      console.error("uploadFile error:", error);
      if (onProgress) onProgress("error");
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        setUrl(downloadURL);
        if (onProgress) onProgress("done");
      });
    }
  );
}
