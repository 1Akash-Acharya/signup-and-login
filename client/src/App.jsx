import React, { useState } from "react";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";

const API_URL = "http://localhost:5000/api/auth";

export default function App() {
  const [mode, setMode] = useState("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [signedInUser, setSignedInUser] = useState(null);

  const isSignup = mode === "signup";

  function switchMode(nextMode) {
    setMode(nextMode);
    setNotice(null);
    setPassword("");
    setSignedInUser(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/${isSignup ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isSignup ? { name, email, password } : { email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Request failed. Please try again.");

      // This demo keeps the token in memory only; refreshing the page clears it.
      setSignedInUser(data.user);
      setNotice({ type: "success", text: data.message });
      setPassword("");
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof TypeError
          ? "Cannot reach the API. Check that MongoDB and the server terminal are running."
          : error.message
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="wordmark" href="#top" aria-label="Account home">ACCOUNT</a>
        <div className="topbar-note">SIGN UP / LOG IN</div>
      </header>

      <section className="auth-layout" id="top">
        <aside className="intro-panel">
          <div className="eyebrow">YOUR ACCOUNT</div>
          <p className="intro-copy">Create an account to get started,or log in if you already have one.</p>
        </aside>

        <section className="form-panel" aria-labelledby="form-title">
          <div className="form-topline"><span>ACCOUNT DETAILS</span></div>
          {signedInUser ? (
            <div className="success-state">
              <div className="success-icon"><Check size={26} strokeWidth={1.8} /></div>
              <p className="section-kicker">YOU'RE ALL SET</p>
              <h2 id="form-title">Welcome, {signedInUser.name.split(" ")[0]}.</h2>
              <p className="form-description">Your account is ready. You're signed in as <strong>{signedInUser.email}</strong>.</p>
              <button className="submit-button" onClick={() => { setSignedInUser(null); setNotice(null); setName(""); setEmail(""); switchMode("signup"); }} type="button">Back to start <ArrowRight size={17} /></button>
            </div>
          ) : (
            <>
              <p className="section-kicker">{isSignup ? "CREATE ACCOUNT" : "WELCOME BACK"}</p>
              <h2 id="form-title">{isSignup ? "Create account" : "Welcome back"}<span className="period">.</span></h2>
              <p className="form-description">{isSignup ? "Enter your details to create an account." : "Enter your email and password to continue."}</p>

              <div className="mode-switch" role="tablist" aria-label="Account action">
                <button type="button" role="tab" aria-selected={isSignup} className={isSignup ? "mode-tab active" : "mode-tab"} onClick={() => switchMode("signup")}>Sign up</button>
                <button type="button" role="tab" aria-selected={!isSignup} className={!isSignup ? "mode-tab active" : "mode-tab"} onClick={() => switchMode("login")}>Log in</button>
              </div>

              <form onSubmit={handleSubmit}>
                {isSignup && <label className="field"><span className="field-label">FULL NAME</span><span className="input-wrap"><UserRound size={17} /><input autoComplete="name" type="text" placeholder="e.g. Alex Morgan" value={name} onChange={e => setName(e.target.value)} minLength={2} maxLength={60} required /></span></label>}
                <label className="field"><span className="field-label">EMAIL ADDRESS</span><span className="input-wrap"><Mail size={17} /><input autoComplete="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></span></label>
                <label className="field"><span className="field-label">PASSWORD</span><span className="input-wrap"><LockKeyhole size={17} /><input autoComplete={isSignup ? "new-password" : "current-password"} type={showPassword ? "text" : "password"} placeholder={isSignup ? "At least 8 characters" : "Enter your password"} value={password} onChange={e => setPassword(e.target.value)} minLength={isSignup ? 8 : undefined} required /><button className="visibility-button" type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>{isSignup && <span className="field-hint">Use 8 characters or more.</span>}</label>

                {notice && <div className={`notice ${notice.type}`} role="status">{notice.text}</div>}
                <button className="submit-button" type="submit" disabled={loading}>{loading ? "Please wait…" : isSignup ? "Create my account" : "Log in to your account"}<ArrowRight size={17} /></button>
              </form>
              <p className="terms-note">Use an email address you can access.</p>
            </>
          )}
          <div className="form-bottom"><span>SECURE ACCOUNT ACCESS</span></div>
        </section>
      </section>
      <footer className="page-footer"><span>ACCOUNT ACCESS</span><span>CREATE ACCOUNT OR LOG IN</span></footer>
    </main>
  );
}
