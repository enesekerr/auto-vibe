import { useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: "auto", padding: 20 }}>
      <h2>{isRegister ? "Kayıt Ol" : "Giriş Yap"}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 8, fontSize: 16 }}
        />
        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 8, fontSize: 16 }}
        />
        <button type="submit" style={{ padding: 10, fontSize: 16 }}>
          {isRegister ? "Kayıt Ol" : "Giriş Yap"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p style={{ marginTop: 10 }}>
        {isRegister ? "Zaten hesabın var mı? " : "Hesabın yok mu? "}
        <button
          onClick={() => {
            setError("");
            setIsRegister(!isRegister);
          }}
          style={{ color: "blue", background: "none", border: "none", cursor: "pointer" }}
        >
          {isRegister ? "Giriş Yap" : "Kayıt Ol"}
        </button>
      </p>
    </div>
  );
};

export default Auth;
