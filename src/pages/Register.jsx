import React, { useState } from "react";
import Add from "../img/addAvatar.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, storage, db } from "../Firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [err, setErr] = useState(false);

  const navigate = useNavigate();
  const profileImage = (e) => {
    const img = e.target.files[0];
    const lastDot = img.name.lastIndexOf(".");

    const ext = img.name.substring(lastDot + 1);

    const lowerExt = ext.toLowerCase();

    const ImgExtenison = ["png", "jpeg", "jpg"];
    if (ImgExtenison.includes(lowerExt)) {
      setNotImage(false);
      setFile(e.target.files[0]);
    } else {
      setFile("");
      setNotImage(true);
    }
  };
  const [file, setFile] = useState("");

  const [notImage, setNotImage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;

    try {
      //Create user
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const uploadFile = async () => {
        //Create a unique image name
        const name = new Date().getTime() + file.name;

        const storageRef = ref(storage, "UserProfileImage/" + name);

        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.then(() => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            //Update profile
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });

            //create user on firestore

            await setDoc(doc(collection(db, "users"), res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
            });

            //create empty user chats on firestore
            await setDoc(doc(collection(db, "userChats"), res.user.uid), {});

            navigate("/login");
          });
        });
      };
      file && uploadFile();

      //create user on firestore
      await setDoc(doc(collection(db, "users"), res.user.uid), {
        uid: res.user.uid,
        displayName,
        email,
        photoURL: "",
      });

      //create empty user chats on firestore
      await setDoc(doc(collection(db, "userChats"), res.user.uid), {});

      navigate("/login");
    } catch (err) {
      setErr(true);
    }
  };
  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">Chat App</span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input type="text" name="" placeholder="display  name" />
          <input type="email" placeholder="email" />
          <input type="password" placeholder="password" autoComplete="off" />
          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            onChange={profileImage}
          />
          <label htmlFor="file">
            <img
              src={file ? URL.createObjectURL(file) : Add}
              alt="img"
              className={file ? "Img" : "NoImg"}
            />
            {file ? "" : <span>Add an avatar</span>}
          </label>
          <div className="imgInfo">
            {notImage && "Your File Must Be a JPG, JPEG, or PNG."}
          </div>
          <button>Sign up</button>
          {err && <span>Something went wrong</span>}
        </form>
        <p>
          You do have an account?{" "}
          <Link to={"/login"} className="link">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Register;
