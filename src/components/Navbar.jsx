import { signOut } from "firebase/auth";
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../Firebase";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="navbar">
      <span className="logo">Chat App</span>
      <div className="user">
        <img src={currentUser.photoURL} alt="Not Found" />
        <span>{currentUser.displayName}</span>
        <button
          onClick={() => {
            signOut(auth);
          }}
        >
          logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
