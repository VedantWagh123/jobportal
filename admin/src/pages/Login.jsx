import { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, Shield, Monitor, BarChart2, ScanFace, Move } from 'lucide-react';
import IndiaMapRaw from '@svg-maps/india';
const IndiaMapData = IndiaMapRaw.locations ? IndiaMapRaw : IndiaMapRaw.default;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  .lp * { font-family:'Inter',system-ui,sans-serif; box-sizing:border-box; }

  /* ── Animations ── */
  @keyframes lp-fadeUp  { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes lp-bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes lp-fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes lp-scanLine {
    0% { top: 0%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
  }

  /* ── Custom India Map ── */
  .lp-india-map {
    width: 100%; height: 100%;
    filter: drop-shadow(0 0 16px rgba(59,130,246,0.25));
    overflow: visible;
  }
  .lp-state {
    fill: rgba(15, 23, 42, 0.4);
    stroke: rgba(125, 211, 252, 0.35);
    stroke-width: 1;
    transition: all 0.3s ease;
    cursor: crosshair;
  }
  .lp-state:hover {
    fill: rgba(59, 130, 246, 0.5);
    stroke: #fff;
    stroke-width: 1.5;
    filter: drop-shadow(0 0 8px #7dd3fc);
  }
  @keyframes lp-pulse-node {
    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; box-shadow: 0 0 0 0 rgba(125,211,252,0.8); }
    70% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; box-shadow: 0 0 0 12px rgba(125,211,252,0); }
    100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; box-shadow: 0 0 0 0 rgba(125,211,252,0); }
  }
  .lp-node {
    position: absolute; width: 5px; height: 5px; background: #fff; border-radius: 50%;
    animation: lp-pulse-node 2.5s infinite;
    pointer-events: none;
    z-index: 10;
  }

  /* Bird flap: wings open & close smoothly */
  @keyframes lp-bob1 {
    0%,100% { transform: translate(0px, 0px) rotate(-3deg); opacity:.85; }
    30%     { transform: translate(6px, -12px) rotate(2deg);  opacity:1; }
    70%     { transform: translate(-4px, -6px) rotate(-1deg); opacity:.9; }
  }
  @keyframes lp-bob2 {
    0%,100% { transform: translate(0px, 0px) rotate(3deg);   opacity:.7; }
    40%     { transform: translate(-8px,-14px) rotate(-2deg); opacity:.95; }
    75%     { transform: translate(5px, -5px)  rotate(1deg);  opacity:.8; }
  }
  @keyframes lp-bob3 {
    0%,100% { transform: translate(0px, 0px) rotate(-1deg);  opacity:.6; }
    35%     { transform: translate(10px,-10px) rotate(4deg);  opacity:.85; }
    65%     { transform: translate(-3px, -8px) rotate(-3deg); opacity:.7; }
  }
  @keyframes lp-bob4 {
    0%,100% { transform: translate(0px, 0px) rotate(2deg);   opacity:.5; }
    45%     { transform: translate(-6px,-16px) rotate(-3deg); opacity:.75; }
    80%     { transform: translate(4px, -4px)  rotate(0deg);  opacity:.6; }
  }
  @keyframes lp-wave    { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-22px)} }
  @keyframes lp-pulse   { 0%,100%{opacity:.07} 50%{opacity:.13} }
  @keyframes lp-spin    { to{transform:rotate(360deg)} }

  /* ── Night Sky: Twinkling Stars ── */
  @keyframes lp-twinkle1 {
    0%,100% { opacity:.15; transform:scale(1); }
    50%     { opacity:1;   transform:scale(1.6); }
  }
  @keyframes lp-twinkle2 {
    0%,100% { opacity:.35; transform:scale(1); }
    40%     { opacity:.1;  transform:scale(.7); }
    80%     { opacity:.9;  transform:scale(1.4); }
  }
  @keyframes lp-twinkle3 {
    0%,100% { opacity:.6; transform:scale(1.2); }
    55%     { opacity:.1; transform:scale(.8); }
  }
  /* ── Realistic Shooting Star ── */
  .lp-meteor-container {
    position: fixed;
    z-index: 1;
    pointer-events: none;
  }
  .lp-meteor {
    position: absolute;
    top: 0; right: 0; /* Head at the right */
    height: 1px;
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%);
    box-shadow: 0 0 4px rgba(255,255,255,0.8);
    opacity: 0;
  }
  .lp-meteor::before {
    content: '';
    position: absolute;
    right: 0; /* Head glow at the right */
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 3px;
    background: #fff;
    border-radius: 50%;
    box-shadow: 0 0 12px 3px #fff, 0 0 20px 5px rgba(147, 197, 253, 0.9);
  }

  @keyframes lp-meteor-shoot1 {
    0%   { transform: translateX(0); width: 0; opacity: 0; }
    5%   { opacity: 1; width: 180px; }
    20%  { transform: translateX(600px); width: 0; opacity: 0; }
    100% { transform: translateX(600px); width: 0; opacity: 0; }
  }
  @keyframes lp-meteor-shoot2 {
    0%   { transform: translateX(0); width: 0; opacity: 0; }
    6%   { opacity: 1; width: 140px; }
    22%  { transform: translateX(450px); width: 0; opacity: 0; }
    100% { transform: translateX(450px); width: 0; opacity: 0; }
  }
  @keyframes lp-meteor-shoot3 {
    0%   { transform: translateX(0); width: 0; opacity: 0; }
    7%   { opacity: 1; width: 240px; }
    25%  { transform: translateX(800px); width: 0; opacity: 0; }
    100% { transform: translateX(800px); width: 0; opacity: 0; }
  }

  /* star classes */
  .lp-s1  { animation: lp-twinkle1 3.2s ease-in-out infinite; }
  .lp-s2  { animation: lp-twinkle2 2.4s ease-in-out infinite .6s; }
  .lp-s3  { animation: lp-twinkle3 4.1s ease-in-out infinite 1.2s; }
  .lp-s4  { animation: lp-twinkle1 2.8s ease-in-out infinite 1.8s; }
  .lp-s5  { animation: lp-twinkle2 3.6s ease-in-out infinite .3s; }
  .lp-s6  { animation: lp-twinkle3 2.2s ease-in-out infinite 2.4s; }
  .lp-s7  { animation: lp-twinkle1 4.5s ease-in-out infinite .9s; }
  .lp-s8  { animation: lp-twinkle2 3.0s ease-in-out infinite 1.5s; }
  .lp-s9  { animation: lp-twinkle3 2.7s ease-in-out infinite 2.1s; }
  .lp-s10 { animation: lp-twinkle1 3.8s ease-in-out infinite .4s; }
  .lp-s11 { animation: lp-twinkle2 2.5s ease-in-out infinite 2.8s; }
  .lp-s12 { animation: lp-twinkle3 4.2s ease-in-out infinite 0.7s; }
  .lp-s13 { animation: lp-twinkle1 3.4s ease-in-out infinite 1.1s; }
  .lp-s14 { animation: lp-twinkle2 2.9s ease-in-out infinite 3.0s; }
  .lp-s15 { animation: lp-twinkle3 3.7s ease-in-out infinite 1.6s; }

  /* shooting star classes — fast, realistic, cinematic */
  .lp-m1 { animation: lp-meteor-shoot1 10s ease-in infinite 2s; }
  .lp-m2 { animation: lp-meteor-shoot2 14s ease-in infinite 7s; }
  .lp-m3 { animation: lp-meteor-shoot3 17s ease-in infinite 12s; }

  /* Bird animation classes — smooth, slow, staggered */
  .lp-b1  { animation: lp-bob1  7s  ease-in-out infinite 0s; }
  .lp-b2  { animation: lp-bob2  9s  ease-in-out infinite 1.2s; }
  .lp-b3  { animation: lp-bob3  8s  ease-in-out infinite 2.5s; }
  .lp-b4  { animation: lp-bob4  10s ease-in-out infinite 0.6s; }
  .lp-b5  { animation: lp-bob1  6s  ease-in-out infinite 3.8s; }
  .lp-b6  { animation: lp-bob2  11s ease-in-out infinite 1.8s; }
  .lp-b7  { animation: lp-bob3  7.5s ease-in-out infinite 4.5s; }
  .lp-b8  { animation: lp-bob4  8.5s ease-in-out infinite 2.1s; }
  .lp-b9  { animation: lp-bob1  9.5s ease-in-out infinite 5.2s; }
  .lp-b10 { animation: lp-bob2  6.5s ease-in-out infinite 0.3s; }
  .lp-b11 { animation: lp-bob3  10.5s ease-in-out infinite 3.1s; }
  .lp-b12 { animation: lp-bob4  7.8s ease-in-out infinite 6s; }
  .lp-fadeUp  { animation:lp-fadeUp .65s cubic-bezier(.22,1,.36,1) both; }
  .lp-fadeUp2 { animation:lp-fadeUp .65s cubic-bezier(.22,1,.36,1) .1s both; }
  .lp-wave    { animation:lp-wave 9s ease-in-out infinite; }
  .lp-pulse   { animation:lp-pulse 7s ease-in-out infinite; }
  .lp-chakra  { animation:lp-chakra 100s linear infinite; }
  .lp-spinner { animation:lp-spin 1s linear infinite; }

  .lp-input {
    width:100%; height:48px; padding:0 14px 0 42px;
    border:1.5px solid rgba(255,255,255,.35);
    border-radius:10px; font-size:14px; color:#fff;
    background:rgba(255,255,255,.12);
    outline:none; backdrop-filter:blur(6px);
    transition:border-color .2s,box-shadow .2s,background .2s;
    font-family:'Inter',system-ui,sans-serif;
  }
  .lp-input::placeholder { color:rgba(255,255,255,.5); }
  .lp-input:focus {
    border-color:rgba(255,255,255,.75);
    background:rgba(255,255,255,.18);
    box-shadow:0 0 0 3px rgba(255,255,255,.15);
  }

  /* ── Sign In Button ── */
  .lp-btn {
    width:100%; height:50px; border:none; border-radius:10px;
    background:linear-gradient(135deg,#3b82f6,#2563eb);
    color:#fff; font-size:15px; font-weight:700; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
    box-shadow:0 4px 20px rgba(37,99,235,.55);
    transition:transform .14s,box-shadow .18s;
    font-family:'Inter',system-ui,sans-serif;
  }
  .lp-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 24px rgba(37,99,235,.65); }
  .lp-btn:active:not(:disabled){ transform:translateY(0); }
  .lp-btn:disabled { opacity:.7; cursor:not-allowed; }

  /* ── Secure Banner ── */
  .lp-secure {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 14px; border-radius:12px;
    background:rgba(255,255,255,.12); backdrop-filter:blur(6px);
    border:1.5px solid rgba(255,255,255,.25); cursor:pointer;
    transition:background .18s,border-color .18s, transform .2s;
  }
  .lp-secure:hover { background:rgba(255,255,255,.18); border-color:rgba(255,255,255,.4); transform: scale(1.02); }

  /* ── Responsive ── */
  @media(max-width:900px) { .lp-left { display:none !important; } }
  @media(max-width:600px) {
    .lp-page-inner { padding:20px 16px 24px !important; align-items:flex-start !important; padding-top:32px !important; }
    .lp-card-wrap  { padding:24px 18px !important; border-radius:16px !important; }
    .lp-left       { display:none !important; }
  }
`;

const Login = () => {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    
    // Biometric Scan State
    const [scanActive, setScanActive] = useState(false);
    const [scanError, setScanError] = useState('');
    const [scanRetryCount, setScanRetryCount] = useState(0);
    const [scanBlockedUntil, setScanBlockedUntil] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const { login } = useContext(AuthContext);
    const navigate  = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setLoading(true);
        try { await login(email, password); navigate('/'); }
        catch (err) { setError(err.response?.data?.message || 'Invalid email or password. Please try again.'); }
        finally { setLoading(false); }
    };

    // Timer Effect for Blocking
    useEffect(() => {
        if (!scanBlockedUntil) return;
        const interval = setInterval(() => {
            const left = Math.ceil((scanBlockedUntil - Date.now()) / 1000);
            if (left <= 0) {
                setScanBlockedUntil(null);
                setScanRetryCount(0);
                setTimeLeft(0);
                clearInterval(interval);
            } else {
                setTimeLeft(left);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [scanBlockedUntil]);

    const startScanProcess = () => {
        if (scanBlockedUntil && Date.now() < scanBlockedUntil) return;
        setScanError('');
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(s => {
                streamRef.current = s;
                if (videoRef.current) videoRef.current.srcObject = s;
                setTimeout(() => {
                    setScanError('Biometric Signature Not Found. Access Denied.');
                    setScanRetryCount(prev => {
                        const newCount = prev + 1;
                        if (newCount >= 3) {
                            setScanBlockedUntil(Date.now() + 30000);
                            setTimeLeft(30);
                        }
                        return newCount;
                    });
                }, 3500);
            })
            .catch(err => {
                setScanError('Camera Access Denied or Unavailable.');
            });
    };

    useEffect(() => {
        if (scanActive && !scanBlockedUntil && scanRetryCount === 0 && !scanError) {
            startScanProcess();
        } else if (!scanActive) {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
        }
        return () => {
            if (!scanActive && streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = null;
            }
        };
    }, [scanActive]);

    const handlePointerDown = (e) => {
        if (['INPUT', 'BUTTON', 'A', 'LABEL', 'SVG', 'path'].includes(e.target.tagName)) return;
        if (e.target.closest('button') || e.target.closest('a')) return;
        setIsDragging(true);
        dragStartPos.current = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
    };

    useEffect(() => {
        const handlePointerMove = (e) => {
            if (!isDragging) return;
            setDragOffset({
                x: e.clientX - dragStartPos.current.x,
                y: e.clientY - dragStartPos.current.y
            });
        };
        const handlePointerUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener('pointermove', handlePointerMove);
            window.addEventListener('pointerup', handlePointerUp);
        }
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging]);

    const handleMouseMove = (e) => {
        if (isDragging) return; // Disable parallax while dragging for smoothness
        const x = (window.innerWidth / 2 - e.clientX) / 40;
        const y = (window.innerHeight / 2 - e.clientY) / 40;
        setMousePos({ x, y });
    };

    return (
        <>
            <style>{CSS}</style>

            {/* ── BIOMETRIC SCAN OVERLAY ── */}
            {scanActive && (() => {
                const isBlocked = !!scanBlockedUntil;
                const isErrorState = !!scanError || isBlocked;
                
                return (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 99999,
                    background: 'rgba(6, 14, 50, 0.95)', backdropFilter: 'blur(20px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column', animation: 'lp-fadeIn 0.3s ease'
                }}>
                    <div style={{
                        position: 'relative', width: '400px', height: '400px', /* Size increased */
                        border: isErrorState ? '3px solid #ef4444' : '3px solid rgba(110,231,183,0.5)', 
                        borderRadius: '50%',
                        overflow: 'hidden', 
                        boxShadow: isErrorState ? '0 0 60px rgba(239,68,68,0.4), inset 0 0 40px rgba(239,68,68,0.3)' 
                                                : '0 0 60px rgba(110,231,183,0.3), inset 0 0 40px rgba(110,231,183,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#0a192f', transition: 'all 0.3s'
                    }}>
                        {/* Dummy Face Fallback (Appears if video is black or fails) */}
                        <img 
                            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
                            alt="Dummy User" 
                            style={{
                                position: 'absolute', width: '60%', height: '60%', 
                                opacity: 0.15, filter: 'brightness(0) invert(1)'
                            }}
                        />

                        <video ref={videoRef} autoPlay playsInline muted style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%', objectFit: 'cover',
                            transform: 'scaleX(-1)', opacity: isErrorState ? 0.3 : 0.85,
                            zIndex: 1
                        }} />
                        
                        {/* Sci-Fi Grid Overlay */}
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 2,
                            background: `
                                linear-gradient(rgba(110,231,183,0.15) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(110,231,183,0.15) 1px, transparent 1px)
                            `,
                            backgroundSize: '24px 24px',
                            opacity: isErrorState ? 0 : 1, transition: 'opacity 0.3s'
                        }} />

                        {/* Scanner Reticle Crosshair */}
                        {!isErrorState && (
                            <div style={{
                                position: 'absolute', zIndex: 3, width: '220px', height: '220px', /* Reticle increased */
                                border: '1px solid rgba(110,231,183,0.2)', borderRadius: '20px'
                            }}>
                                <div style={{position:'absolute',top:'-5px',left:'-5px',width:'25px',height:'25px',borderTop:'3px solid #6ee7b7',borderLeft:'3px solid #6ee7b7'}} />
                                <div style={{position:'absolute',top:'-5px',right:'-5px',width:'25px',height:'25px',borderTop:'3px solid #6ee7b7',borderRight:'3px solid #6ee7b7'}} />
                                <div style={{position:'absolute',bottom:'-5px',left:'-5px',width:'25px',height:'25px',borderBottom:'3px solid #6ee7b7',borderLeft:'3px solid #6ee7b7'}} />
                                <div style={{position:'absolute',bottom:'-5px',right:'-5px',width:'25px',height:'25px',borderBottom:'3px solid #6ee7b7',borderRight:'3px solid #6ee7b7'}} />
                            </div>
                        )}
                        
                        {!isErrorState && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', zIndex: 4,
                                background: '#6ee7b7', boxShadow: '0 0 20px 6px rgba(110,231,183,0.7)',
                                animation: 'lp-scanLine 2.5s ease-in-out infinite'
                            }} />
                        )}
                        {isErrorState && (
                            <div style={{position: 'absolute', inset: 0, zIndex: 4, background: 'rgba(239,68,68,0.2)'}} />
                        )}
                    </div>

                    <h3 style={{
                        marginTop: '36px', fontSize: '22px', fontWeight: 800,
                        color: isErrorState ? '#ef4444' : '#6ee7b7',
                        letterSpacing: '1px', textTransform: 'uppercase',
                        textShadow: isErrorState ? '0 0 16px rgba(239,68,68,0.5)' : '0 0 16px rgba(110,231,183,0.5)'
                    }}>
                        {isBlocked ? 'TOO MANY FAILED ATTEMPTS' : (scanError ? 'VERIFICATION FAILED' : 'SCANNING BIOMETRICS...')}
                    </h3>
                    
                    {scanError && !isBlocked && (
                        <p style={{
                            marginTop: '12px', fontSize: '15px', color: '#fca5a5',
                            background: 'rgba(239,68,68,0.15)', padding: '10px 20px',
                            borderRadius: '8px', border: '1px solid rgba(239,68,68,0.4)',
                            fontWeight: 600
                        }}>
                            {scanError} (Attempt {scanRetryCount} of 3)
                        </p>
                    )}

                    {isBlocked && (
                        <p style={{
                            marginTop: '12px', fontSize: '16px', color: '#fca5a5',
                            background: 'rgba(239,68,68,0.15)', padding: '14px 28px',
                            borderRadius: '8px', border: '1px solid rgba(239,68,68,0.5)',
                            fontWeight: 700, letterSpacing: '1px'
                        }}>
                            Security Lockdown. Retry in 00:{timeLeft.toString().padStart(2, '0')}
                        </p>
                    )}

                    <div style={{display: 'flex', gap: '16px', marginTop: '40px'}}>
                        <button 
                            onClick={() => {
                                setScanActive(false);
                                setScanError('');
                            }}
                            style={{
                                padding: '14px 40px', borderRadius: '100px',
                                background: isErrorState ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.1)', 
                                color: isErrorState ? '#fca5a5' : '#fff', 
                                border: isErrorState ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.2)',
                                cursor: 'pointer', fontWeight: 800, transition: 'all 0.2s', fontSize: '15px'
                            }}
                        >
                            CLOSE
                        </button>
                        
                        {scanError && !isBlocked && (
                            <button 
                                onClick={startScanProcess}
                                style={{
                                    padding: '14px 40px', borderRadius: '100px',
                                    background: 'rgba(110,231,183,0.15)', 
                                    color: '#6ee7b7', 
                                    border: '1px solid rgba(110,231,183,0.4)',
                                    cursor: 'pointer', fontWeight: 800, transition: 'all 0.2s', fontSize: '15px'
                                }}
                            >
                                RETRY SCAN
                            </button>
                        )}
                    </div>
                </div>
                );
            })()}
                {/* Form starts right away below styles */}

            {/* ══ ROOT — Full viewport ══════════════════════════════════════════ */}
            <div className="lp" onMouseMove={handleMouseMove} style={{
                height:'100vh', maxHeight:'100vh', display:'flex', flexDirection:'column',
                position:'relative', overflow:'hidden',
            }}>

                {/* ── LAYER 1: Full-page background photo ── */}
                <div style={{
                    position:'fixed', inset:0, zIndex:0,
                    backgroundImage:'url("https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&q=90&auto=format&fit=crop")',
                    backgroundSize:'cover',
                    backgroundPosition:'center top',
                    backgroundRepeat:'no-repeat',
                }}/>

                {/* ── LAYER 2: Pitch Black / Deep Night overlay ── */}
                <div style={{
                    position:'fixed', inset:0, zIndex:1,
                    background:`
                        radial-gradient(ellipse 80% 50% at 25% 5%,  rgba(2,5,20,0.85) 0%, transparent 70%),
                        radial-gradient(ellipse 60% 45% at 75% 85%, rgba(0,0,5,0.98)  0%, transparent 70%),
                        linear-gradient(175deg, rgba(0,1,5,0.95) 0%, rgba(1,3,10,0.90) 40%, rgba(0,0,0,1) 100%)
                    `,
                }}/>

                {/* ── LAYER 3a: Warm golden/amber atmospheric glow (center-top) ── */}
                <div style={{
                    position:'fixed', top:'-80px', left:'35%', zIndex:1,
                    width:'600px', height:'420px', borderRadius:'50%',
                    background:'radial-gradient(ellipse, rgba(251,191,36,.09) 0%, rgba(251,146,60,.06) 40%, transparent 70%)',
                    pointerEvents:'none', transform:'translateX(-50%)',
                }}/>

                {/* ── LAYER 3b: Electric blue glow (top-left) ── */}
                <div style={{
                    position:'fixed', top:'-100px', left:'-100px', zIndex:1,
                    width:'550px', height:'550px', borderRadius:'50%',
                    background:'radial-gradient(circle, rgba(30,58,138,.35) 0%, transparent 70%)',
                    pointerEvents:'none',
                }}/>

                {/* ── HALF MOON (Patla Chand) ── */}
                <div style={{
                    position:'fixed', top:'4%', right:'18%', zIndex:1, pointerEvents:'none',
                    width:'60px', height:'60px', borderRadius:'50%',
                    boxShadow:'-4px 6px 0 0px #f8fafc',
                    filter:'drop-shadow(0 0 10px rgba(255,255,255,.6)) drop-shadow(0 0 20px rgba(255,255,255,.3))',
                    transform: 'rotate(-15deg)'
                }}/>

                {/* ── LAYER 3c: Violet glow (bottom-right) ── */}
                <div style={{
                    position:'fixed', bottom:'-80px', right:'-80px', zIndex:1,
                    width:'500px', height:'500px', borderRadius:'50%',
                    background:'radial-gradient(circle, rgba(139,92,246,.10) 0%, transparent 70%)',
                    pointerEvents:'none',
                }}/>

                {/* ── FOG (Dhundh) Layer ── */}
                <div style={{
                    position:'fixed', bottom:0, left:0, width:'100%', height:'350px', zIndex:1,
                    background:'linear-gradient(to top, rgba(148,163,184,0.18) 0%, rgba(148,163,184,0.05) 45%, transparent 100%)',
                    pointerEvents:'none', filter:'blur(20px)',
                }}/>



                {/* ── LAYER 5: Tricolor wave ribbons (bottom) ── */}
                <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className="lp-wave"
                    style={{position:'fixed',bottom:0,left:0,width:'100%',height:'170px',zIndex:1,pointerEvents:'none'}}>
                    <path d="M0,60 C360,20 720,100 1440,40 L1440,88 C720,138 360,55 0,110Z" fill="#f97316" opacity=".22"/>
                    <path d="M0,80 C400,48 850,118 1440,60 L1440,115 C850,158 400,82 0,132Z" fill="#e2e8f0" opacity=".12"/>
                    <path d="M0,100 C380,72 900,130 1440,82 L1440,140 C900,168 380,115 0,155Z" fill="#16a34a" opacity=".18"/>
                </svg>

                {/* ══ NIGHT SKY: Dense Twinkling Stars ══ */}
                {[
                  // [top%, left%, size, className]
                  ['3%','8%',   2.5,'lp-s1'],  ['6%','15%',  1.5,'lp-s2'],  ['2%','25%',  2,'lp-s3'],
                  ['5%','33%',  1,'lp-s4'],    ['8%','42%',  3,'lp-s5'],    ['4%','55%',  1.5,'lp-s6'],
                  ['1%','63%',  1,'lp-s7'],    ['7%','72%',  2.5,'lp-s8'],  ['3%','80%',  1,'lp-s9'],
                  ['9%','88%',  2,'lp-s10'],   ['12%','10%', 1.5,'lp-s11'], ['14%','28%', 2.5,'lp-s12'],
                  ['11%','47%', 1,'lp-s13'],   ['13%','66%', 2,'lp-s14'],   ['10%','82%', 1.5,'lp-s15'],
                  
                  // Additional small background stars
                  ['22%','5%',  1,'lp-s2'],    ['18%','22%', 1,'lp-s5'],    ['20%','35%', 1.5,'lp-s7'],
                  ['25%','52%', 1,'lp-s1'],    ['17%','60%', 1,'lp-s4'],    ['28%','75%', 2,'lp-s6'],
                  ['16%','92%', 1.5,'lp-s9'],  ['23%','85%', 1,'lp-s12'],   ['2%','48%',  1,'lp-s11'],
                  ['1%','95%',  1.5,'lp-s3'],  ['32%','15%', 1,'lp-s15'],   ['30%','90%', 1.5,'lp-s8'],
                ].map(([top,left,size,cls],i) => (
                    <div key={i} className={cls} style={{
                        position:'fixed', top, left, zIndex:1, pointerEvents:'none',
                        width:size+'px', height:size+'px', borderRadius:'50%',
                        background:'#fff',
                        boxShadow:`0 0 ${size*2.5}px ${size}px rgba(255,255,255,.5)`,
                    }}/>
                ))}

                {/* ══ REALISTIC SHOOTING STARS ══ */}
                {/* Shooting star 1 — top-left area */}
                <div className="lp-meteor-container" style={{ top: '5%', left: '15%', transform: 'rotate(25deg)' }}>
                    <div className="lp-meteor lp-m1" />
                </div>

                {/* Shooting star 2 — center area */}
                <div className="lp-meteor-container" style={{ top: '8%', left: '45%', transform: 'rotate(30deg)' }}>
                    <div className="lp-meteor lp-m2" />
                </div>

                {/* Shooting star 3 — right area */}
                <div className="lp-meteor-container" style={{ top: '2%', left: '70%', transform: 'rotate(20deg)' }}>
                    <div className="lp-meteor lp-m3" />
                </div>

                {/* ══ BIRDS — 12 white birds, scattered across full sky ══ */}
                {/* Top-center area */}
                <div className="lp-b1" style={{position:'fixed',top:'7%',left:'52%',zIndex:2,pointerEvents:'none'}}>
                    <svg viewBox="0 0 44 20" width="44" height="20">
                        <path d="M2,10 Q11,2 22,10 Q33,2 42,10" fill="none" stroke="rgba(255,255,255,.8)" strokeWidth="2.2" strokeLinecap="round"/>
                    </svg>
                </div>
                {/* Top-right group */}
                <div className="lp-b2" style={{position:'fixed',top:'5%',left:'68%',zIndex:2,pointerEvents:'none'}}>
                    <svg viewBox="0 0 30 14" width="30" height="14">
                        <path d="M1,7 Q8,1 15,7 Q22,1 29,7" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>
                <div className="lp-b3" style={{position:'fixed',top:'9%',left:'74%',zIndex:2,pointerEvents:'none'}}>
                    <svg viewBox="0 0 20 10" width="20" height="10">
                        <path d="M1,5 Q5,1 10,5 Q15,1 19,5" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                </div>
                {/* Top-left area */}
                <div className="lp-b4" style={{position:'fixed',top:'11%',left:'30%',zIndex:2,pointerEvents:'none'}}>
                    <svg viewBox="0 0 26 12" width="26" height="12">
                        <path d="M1,6 Q7,1 13,6 Q19,1 25,6" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.9" strokeLinecap="round"/>
                    </svg>
                </div>
                <div className="lp-b5" style={{position:'fixed',top:'4%',left:'38%',zIndex:2,pointerEvents:'none'}}>
                    <svg viewBox="0 0 16 8" width="16" height="8">
                        <path d="M1,4 Q4,1 8,4 Q12,1 15,4" fill="none" stroke="rgba(255,255,255,.45)" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                </div>
                {/* Mid-upper area */}
                <div className="lp-b6" style={{position:'fixed',top:'14%',left:'58%',zIndex:2,pointerEvents:'none'}}>
                    <svg viewBox="0 0 36 16" width="36" height="16">
                        <path d="M2,8 Q9,1 18,8 Q27,1 34,8" fill="none" stroke="rgba(255,255,255,.65)" strokeWidth="2.1" strokeLinecap="round"/>
                    </svg>
                </div>
                <div className="lp-b7" style={{position:'fixed',top:'18%',left:'44%',zIndex:2,pointerEvents:'none'}}>
                    <svg viewBox="0 0 22 10" width="22" height="10">
                        <path d="M1,5 Q6,1 11,5 Q16,1 21,5" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                </div>
                {/* Far right area */}
                <div className="lp-b8" style={{position:'fixed',top:'6%',left:'82%',zIndex:2,pointerEvents:'none'}}>
                    <svg viewBox="0 0 18 8" width="18" height="8">
                        <path d="M1,4 Q5,1 9,4 Q13,1 17,4" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </div>
                <div className="lp-b9" style={{position:'fixed',top:'12%',left:'78%',zIndex:2,pointerEvents:'none'}}>
                    <svg viewBox="0 0 28 13" width="28" height="13">
                        <path d="M1,7 Q7,1 14,7 Q21,1 27,7" fill="none" stroke="rgba(255,255,255,.58)" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>
                {/* Far left area */}
                <div className="lp-b10" style={{position:'fixed',top:'8%',left:'18%',zIndex:2,pointerEvents:'none'}}>
                    <svg viewBox="0 0 32 14" width="32" height="14">
                        <path d="M2,7 Q8,1 16,7 Q24,1 30,7" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>
                <div className="lp-b11" style={{position:'fixed',top:'15%',left:'22%',zIndex:2,pointerEvents:'none'}}>
                    <svg viewBox="0 0 14 7" width="14" height="7">
                        <path d="M1,4 Q4,1 7,4 Q10,1 13,4" fill="none" stroke="rgba(255,255,255,.38)" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </div>
                {/* Center-top lone bird */}
                <div className="lp-b12" style={{position:'fixed',top:'2%',left:'48%',zIndex:2,pointerEvents:'none'}}>
                    <svg viewBox="0 0 38 17" width="38" height="17">
                        <path d="M2,9 Q10,1 19,9 Q28,1 36,9" fill="none" stroke="rgba(255,255,255,.72)" strokeWidth="2.3" strokeLinecap="round"/>
                    </svg>
                </div>

                {/* ══ MAIN CONTENT ══════════════════════════════════════════════ */}
                <div className="lp-page-inner" style={{
                    flex:1, position:'relative', zIndex:2,
                    display:'flex', alignItems:'flex-start', justifyContent:'space-between',
                    padding:'clamp(40px,6vh,80px) clamp(24px,4vw,60px) 60px',
                    gap:'40px',
                    maxWidth:'1600px', margin:'0 auto', width:'100%',
                }}>

                    {/* ──── LEFT: Branding ─────────────────────────────────── */}
                    <div className="lp-left lp-fadeUp" style={{
                        flex:'0 0 auto', maxWidth:'420px',
                        paddingTop:'clamp(8px,3vh,40px)',
                    }}>
                        {/* NATIONAL PORTAL label */}
                        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'24px'}}>
                            <span style={{fontSize:'11px',fontWeight:700,letterSpacing:'3.5px',
                                color:'rgba(255,255,255,.65)',textTransform:'uppercase'}}>National Portal</span>
                            <div style={{width:'44px',height:'2.5px',
                                background:'linear-gradient(to right,#ff9933,#138808)',borderRadius:'2px'}}/>
                        </div>

                        <h1 style={{fontSize:'clamp(34px,4vw,54px)',fontWeight:900,
                            lineHeight:1.08,color:'#f8fafc',margin:'0 0 2px',letterSpacing:'-0.8px',
                            textShadow:'0 0 40px rgba(147,197,253,.3), 0 2px 16px rgba(0,0,0,.5)'}}>
                            Viksit Bharat
                        </h1>
                        <h1 style={{fontSize:'clamp(34px,4vw,54px)',fontWeight:900,
                            lineHeight:1.08,color:'#7dd3fc',margin:'0 0 26px',letterSpacing:'-0.8px',
                            textShadow:'0 0 40px rgba(125,211,252,.45), 0 2px 16px rgba(0,0,0,.4)'}}>
                            Skilled Bharat
                        </h1>

                        <p style={{fontSize:'15px',color:'rgba(255,255,255,.7)',lineHeight:1.75,
                            margin:'0 0 48px',maxWidth:'340px',fontWeight:400}}>
                            A unified platform for employment, skilling and workforce intelligence across India.
                        </p>

                        {/* Feature icons */}
                        <div style={{display:'flex',gap:'36px',flexWrap:'wrap'}}>
                            {[
                                {Icon:Monitor,   label:'Monitor', sub:'Workforce Data',    color:'#93c5fd',bg:'rgba(147,197,253,.12)'},
                                {Icon:BarChart2, label:'Manage',  sub:'System Operations', color:'#a5b4fc',bg:'rgba(165,180,252,.12)'},
                                {Icon:Shield,    label:'Ensure',  sub:'Secure Governance', color:'#6ee7b7',bg:'rgba(110,231,183,.12)'},
                            ].map(({Icon,label,sub,color,bg},i)=>(
                                <div key={i} style={{textAlign:'center'}}>
                                    <div style={{width:48,height:48,borderRadius:14,background:bg,
                                        border:`1.5px solid ${color}30`,
                                        display:'flex',alignItems:'center',justifyContent:'center',
                                        color,margin:'0 auto 10px',backdropFilter:'blur(8px)'}}>
                                        <Icon size={22} strokeWidth={1.8}/>
                                    </div>
                                    <div style={{fontSize:'13px',fontWeight:700,color:'#fff',marginBottom:'2px'}}>{label}</div>
                                    <div style={{fontSize:'11px',color:'rgba(255,255,255,.5)',fontWeight:500}}>{sub}</div>
                                </div>
                            ))}
                        </div>

                        {/* ── INTERACTIVE DIGITAL INDIA MAP ── */}
                        <div style={{
                            marginTop: '-10px', /* Thoda upar shift kiya jaisa aapne bola */
                            marginLeft: '-100px',
                            width: '100%', maxWidth: '750px',
                            height: '650px',
                            position: 'relative',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}>
                            {IndiaMapData && IndiaMapData.locations && (
                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                    <svg viewBox={IndiaMapData.viewBox} className="lp-india-map">
                                        {IndiaMapData.locations.map(loc => (
                                            <path key={loc.id} id={loc.id} d={loc.path} className="lp-state" />
                                        ))}
                                    </svg>
                                    
                                    {/* Glowing Digital Nodes (Cities) - Bada diye gaye hain */}
                                    <div className="lp-node" style={{top: '30%', left: '33%', animationDelay: '0s'}} />    {/* Delhi */}
                                    <div className="lp-node" style={{top: '60%', left: '26%', animationDelay: '0.4s'}} />  {/* Mumbai */}
                                    <div className="lp-node" style={{top: '73%', left: '37%', animationDelay: '0.8s'}} />  {/* Bangalore */}
                                    <div className="lp-node" style={{top: '70%', left: '42%', animationDelay: '1.2s'}} />  {/* Chennai */}
                                    <div className="lp-node" style={{top: '52%', left: '72%', animationDelay: '1.6s'}} />  {/* Kolkata */}
                                    <div className="lp-node" style={{top: '56%', left: '37%', animationDelay: '0.2s'}} />  {/* Hyderabad */}
                                    <div className="lp-node" style={{top: '46%', left: '23%', animationDelay: '0.6s'}} />  {/* Ahmedabad */}
                                    <div className="lp-node" style={{top: '35%', left: '26%', animationDelay: '0.3s'}} />  {/* Jaipur */}
                                    <div className="lp-node" style={{top: '35%', left: '45%', animationDelay: '0.9s'}} />  {/* Lucknow */}
                                    <div className="lp-node" style={{top: '85%', left: '33%', animationDelay: '1.4s'}} />  {/* Kochi */}
                                    <div className="lp-node" style={{top: '41%', left: '62%', animationDelay: '0.7s'}} />  {/* Patna */}
                                    <div className="lp-node" style={{top: '38%', left: '87%', animationDelay: '1.1s'}} />  {/* Guwahati */}
                                    <div className="lp-node" style={{top: '63%', left: '29%', animationDelay: '0.5s'}} />  {/* Pune */}
                                    <div className="lp-node" style={{top: '60%', left: '52%', animationDelay: '1.5s'}} />  {/* Vizag */}
                                    <div className="lp-node" style={{top: '20%', left: '26%', animationDelay: '0.1s'}} />  {/* Srinagar */}
                                    <div className="lp-node" style={{top: '52%', left: '42%', animationDelay: '1.8s'}} />  {/* Nagpur */}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ──── RIGHT: Login Card ───────────────────────────── */}
                    <div className="lp-fadeUp2" style={{
                        flex:'0 0 auto',
                        position: 'relative',
                        width:'100%', maxWidth:'370px', /* Original se kafi chhota (pehle 460px tha) */
                        marginTop:'12vh', marginRight:'6vw', /* Right aur down shift */
                        paddingTop:'0',
                        transform: `perspective(1200px) rotateX(${mousePos.y * 0.5}deg) rotateY(${-mousePos.x * 0.5}deg) translate3d(${dragOffset.x + (-mousePos.x * 1.5)}px, ${dragOffset.y + (-mousePos.y * 1.5)}px, 0)`,
                        transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                        willChange: 'transform',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none', 
                        WebkitUserSelect: 'none',
                        zIndex: 10,
                        touchAction: 'none'
                    }}
                    onPointerDown={handlePointerDown}>
                        
                        {/* Drag Hint UI */}
                        <div style={{
                            position:'absolute', top:'-30px', right:'15px',
                            background:'rgba(255,255,255,.15)', backdropFilter:'blur(6px)',
                            padding:'5px 12px', borderRadius:'20px',
                            display:'flex', alignItems:'center', gap:'6px',
                            color:'#f8fafc', fontSize:'11.5px', fontWeight:600,
                            border:'1px solid rgba(255,255,255,.3)',
                            animation:'lp-bounce 2.5s infinite',
                            pointerEvents:'none',
                            boxShadow:'0 4px 12px rgba(0,0,0,0.2)'
                        }}>
                            <Move size={13} style={{opacity: 0.8}} /> Click & Drag to Move
                        </div>

                        <div className="lp-card-wrap" style={{
                            background:'rgba(6,14,50,0.62)',
                            backdropFilter:'blur(28px) saturate(180%) brightness(110%)',
                            WebkitBackdropFilter:'blur(28px) saturate(180%) brightness(110%)',
                            borderRadius:'24px',
                            border:'1px solid rgba(255,255,255,.22)',
                            boxShadow:`
                                0 32px 80px rgba(0,0,0,.55),
                                0 8px 32px rgba(0,0,0,.3),
                                inset 0 1.5px 0 rgba(255,255,255,.15),
                                inset 0 -1px 0 rgba(255,255,255,.04),
                                0 0 0 1px rgba(59,130,246,.12)
                            `,
                            padding:'36px 32px',
                        }}>
                            {/* Emblem */}
                            <div style={{textAlign:'center',marginBottom:'22px'}}>
                                <img
                                    src="/ashoka_emblem.png"
                                    alt="Government Emblem"
                                    style={{width:56,height:56,objectFit:'contain',display:'block',
                                        margin:'0 auto 16px',filter:'brightness(0) invert(1)',opacity:.9}}
                                    onError={e=>{
                                        e.target.src='https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/120px-Emblem_of_India.svg.png';
                                        e.target.style.filter='brightness(0) invert(1)';
                                    }}
                                />
                                <h2 style={{fontSize:'24px',fontWeight:800,color:'#f8fafc',
                                    margin:'0 0 6px',letterSpacing:'-0.4px',
                                    textShadow:'0 0 30px rgba(147,197,253,.3), 0 1px 8px rgba(0,0,0,.4)'}}>
                                    Super <span style={{color:'#7dd3fc',textShadow:'0 0 20px rgba(125,211,252,.6)'}}>Admin</span> Portal
                                </h2>
                                <p style={{fontSize:'13.5px',color:'rgba(255,255,255,.6)',fontWeight:400,margin:0}}>
                                    Sign in to manage the intelligence platform
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{
                                    display:'flex',alignItems:'flex-start',gap:'8px',
                                    background:'rgba(239,68,68,.15)',border:'1px solid rgba(239,68,68,.4)',
                                    borderRadius:'10px',padding:'10px 14px',
                                    color:'#fca5a5',fontSize:'13px',fontWeight:500,marginBottom:'18px',
                                }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" style={{flexShrink:0,marginTop:'1px'}}>
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="12" y1="8" x2="12" y2="12"/>
                                        <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/>
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'18px'}}>

                                {/* Email */}
                                <div>
                                    <label style={{display:'block',fontSize:'13px',fontWeight:600,
                                        color:'rgba(255,255,255,.8)',marginBottom:'7px'}}>
                                        Email Address
                                    </label>
                                    <div style={{position:'relative'}}>
                                        <Mail size={16} style={{
                                            position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',
                                            color:'rgba(255,255,255,.45)',pointerEvents:'none',
                                        }}/>
                                        <input type="email" required className="lp-input"
                                            value={email} onChange={e=>setEmail(e.target.value)}
                                            placeholder="superadmin@jobportal.com" autoComplete="email"/>
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label style={{display:'block',fontSize:'13px',fontWeight:600,
                                        color:'rgba(255,255,255,.8)',marginBottom:'7px'}}>
                                        Password
                                    </label>
                                    <div style={{position:'relative'}}>
                                        <Lock size={16} style={{
                                            position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',
                                            color:'rgba(255,255,255,.45)',pointerEvents:'none',
                                        }}/>
                                        <input type={showPass?'text':'password'} required className="lp-input"
                                            style={{paddingRight:'44px'}}
                                            value={password} onChange={e=>setPassword(e.target.value)}
                                            placeholder="••••••••••" autoComplete="current-password"/>
                                        <button type="button" onClick={()=>setShowPass(!showPass)}
                                            style={{
                                                position:'absolute',right:13,top:'50%',transform:'translateY(-50%)',
                                                background:'none',border:'none',cursor:'pointer',
                                                color:'rgba(255,255,255,.5)',display:'flex',alignItems:'center',
                                                padding:0,transition:'color .15s',
                                            }}
                                            onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,.85)'}
                                            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,.5)'}>
                                            {showPass?<EyeOff size={17}/>:<Eye size={17}/>}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember + Forgot */}
                                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                                    <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',userSelect:'none'}}>
                                        <input type="checkbox" checked={remember}
                                            onChange={e=>setRemember(e.target.checked)}
                                            style={{width:16,height:16,accentColor:'#3b82f6',cursor:'pointer'}}/>
                                        <span style={{fontSize:'13px',color:'rgba(255,255,255,.75)',fontWeight:500}}>Remember me</span>
                                    </label>
                                    <a href="#forgot" onClick={e=>e.preventDefault()}
                                        style={{fontSize:'13px',color:'#93c5fd',fontWeight:600,textDecoration:'none'}}
                                        onMouseEnter={e=>e.currentTarget.style.textDecoration='underline'}
                                        onMouseLeave={e=>e.currentTarget.style.textDecoration='none'}>
                                        Forgot password?
                                    </a>
                                </div>

                                {/* Sign In */}
                                <button type="submit" className="lp-btn" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                                                stroke="currentColor" strokeWidth="2.5" className="lp-spinner">
                                                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                            </svg>
                                            Authenticating...
                                        </>
                                    ):(
                                        <><LogIn size={17}/> Sign In</>
                                    )}
                                </button>

                                {/* OR */}
                                <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                                    <div style={{flex:1,height:'1px',background:'rgba(255,255,255,.18)'}}/>
                                    <span style={{fontSize:'12px',color:'rgba(255,255,255,.4)',fontWeight:500}}>or</span>
                                    <div style={{flex:1,height:'1px',background:'rgba(255,255,255,.18)'}}/>
                                </div>

                                {/* Secure Access */}
                                <div 
                                    className="lp-secure" 
                                    onClick={() => {
                                        if (scanBlockedUntil) return; // Completely disable button during block
                                        setScanActive(true);
                                    }}
                                    style={{
                                        cursor: scanBlockedUntil ? 'not-allowed' : 'pointer',
                                        opacity: scanBlockedUntil ? 0.7 : 1,
                                        borderColor: scanBlockedUntil ? 'rgba(239,68,68,0.4)' : ''
                                    }}
                                >
                                    <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                                        <div style={{width:38,height:38,borderRadius:10,
                                            background: scanBlockedUntil ? 'rgba(239,68,68,.15)' : 'rgba(110,231,183,.15)',
                                            border: scanBlockedUntil ? '1.5px solid rgba(239,68,68,.3)' : '1.5px solid rgba(110,231,183,.25)',
                                            display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                            {scanBlockedUntil ? (
                                                <Lock size={18} style={{color:'#ef4444'}} strokeWidth={1.8}/>
                                            ) : (
                                                <ScanFace size={18} style={{color:'#6ee7b7'}} strokeWidth={1.8}/>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{fontSize:'13.5px',fontWeight:700,
                                                color: scanBlockedUntil ? '#ef4444' : '#6ee7b7',marginBottom:'2px'}}>
                                                {scanBlockedUntil ? `Scan Locked (00:${timeLeft.toString().padStart(2,'0')})` : 'Use Biometric Face Scan'}
                                            </div>
                                            <div style={{fontSize:'11.5px',color: scanBlockedUntil ? 'rgba(239,68,68,.7)' : 'rgba(110,231,183,.65)',fontWeight:500}}>
                                                {scanBlockedUntil ? 'Security lockdown active' : 'Fast and highly secure authentication'}
                                            </div>
                                        </div>
                                    </div>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                        stroke={scanBlockedUntil ? '#ef4444' : '#6ee7b7'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        {scanBlockedUntil ? (
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                        ) : (
                                            <polyline points="9 18 15 12 9 6"/>
                                        )}
                                    </svg>
                                </div>

                            </form>
                        </div>
                    </div>

                </div>

                {/* ══ FOOTER ══════════════════════════════════════════════════ */}
                <div style={{
                    position:'relative', zIndex:2,
                    borderTop:'1px solid rgba(255,255,255,.1)',
                    background:'rgba(5,15,45,.55)', backdropFilter:'blur(12px)',
                    padding:'13px 32px',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    flexWrap:'wrap', gap:'0',
                }}>
                    {[
                        {Icon:Lock,      label:'Government Secure Network'},
                        {Icon:Shield,    label:'Role Based Access'},
                        {Icon:Monitor,   label:'Centralized Control'},
                        {Icon:BarChart2, label:'Real-time Monitoring'},
                    ].map(({Icon,label},i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',gap:'32px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:'6px',color:'rgba(255,255,255,.5)'}}>
                                <Icon size={13} strokeWidth={1.8}/>
                                <span style={{fontSize:'12px',fontWeight:500}}>{label}</span>
                            </div>
                            {i<3 && <span style={{color:'rgba(255,255,255,.2)',fontSize:'20px',margin:'0 4px',lineHeight:1}}>|</span>}
                        </div>
                    ))}
                </div>

            </div>
        </>
    );
};

export default Login;
