import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Home3D.css';

const tools = [
  { mark: '✧', tag: 'EXPLORE SYMPTOMS', title: 'Start with what you feel.', text: 'Organize your symptoms and explore model-generated insights to discuss with a healthcare professional.', to: '/predict', action: 'Explore symptoms', tone: 'mint' },
  { mark: '◈', tag: 'DIABETES INSIGHTS', title: 'Give your numbers context.', text: 'Use the dedicated diabetes tool with your clinical measurements. Results are informational, not a diagnosis.', to: '/diabetes', action: 'Open diabetes tool', tone: 'blue' },
  { mark: '↗', tag: 'YOUR HISTORY', title: 'Keep the conversation going.', text: 'Return to your saved predictions when signed in, and review them before your next appointment.', to: '/previous-predictions', action: 'View prediction history', tone: 'peach' },
];
const questions = [
  ['Is this a medical diagnosis?', 'No. PREDET-AI provides informational, model-generated predictions. A qualified healthcare professional should interpret your symptoms and measurements.'],
  ['How do I get started?', 'Choose symptom analysis or the diabetes tool. Follow the prompts in the existing application and review the result with a healthcare professional.'],
  ['Can I return to my predictions?', 'Sign in to access the prediction history available in your account.'],
  ['What should I know before entering health data?', 'Enter only information you are comfortable sharing. Contact the project team for details about how your information is processed.'],
];

function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  function move(e) {
    if (!window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches || e.currentTarget.closest('[data-motion="off"]')) return;
    const b = e.currentTarget.getBoundingClientRect();
    ref.current.style.setProperty('--rx', `${-(e.clientY - b.top - b.height / 2) / b.height * 7}deg`);
    ref.current.style.setProperty('--ry', `${(e.clientX - b.left - b.width / 2) / b.width * 7}deg`);
  }
  function reset() { ref.current.style.setProperty('--rx', '0deg'); ref.current.style.setProperty('--ry', '0deg'); }
  return <article ref={ref} className={`p3-tilt ${className}`} onPointerMove={move} onPointerLeave={reset}>{children}</article>;
}

export default function HomePage() {
  const root = useRef(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const nodes = root.current.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('p3-pending'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    nodes.forEach(node => { node.classList.add('p3-pending'); observer.observe(node); });
    return () => { observer.disconnect(); nodes.forEach(node => node.classList.remove('p3-pending')); };
  }, []);
  return (
    <main ref={root} className="p3-home" id="p3-top" data-motion={paused ? 'off' : 'on'}>
      <div className="p3-wrap">
        <div className="p3-topline"><span>PREDET-AI / HEALTH, WITH PERSPECTIVE</span></div>
        <section className="p3-hero" aria-labelledby="p3-title">
          <div className="p3-copy">
            <span className="p3-eyebrow"><i aria-hidden="true" /> AI-assisted health insights</span>
            <h1 id="p3-title">A clearer picture<br />of <em>your health.</em></h1>
            <p>Turn symptoms and clinical measurements into a starting point for a more informed conversation with your doctor.</p>
            <div className="p3-actions"><Link className="p3-button p3-primary" to="/predict">Explore my symptoms <span aria-hidden="true">↗</span></Link><Link className="p3-button p3-secondary" to="/diabetes">Diabetes insights <span aria-hidden="true">→</span></Link></div>
            <p className="p3-caption">Information to support a conversation. Never a diagnosis.</p>
            <a className="p3-textlink" href="#p3-how">Discover how it works ↓</a>
          </div>
          <div className="p3-scene" aria-hidden="true">
            <div className="p3-grid" /><div className="p3-halo" /><div className="p3-orbit p3-orbit-a" /><div className="p3-orbit p3-orbit-b" />
            <div className="p3-orb"><div className="p3-cross" /><span className="p3-orb-label">HEALTH IN FOCUS</span></div>
            <div className="p3-float p3-float-a"><span className="p3-mini-icon">✧</span><div><small>YOUR STARTING POINT</small><strong>Understand your symptoms</strong></div></div>
            <div className="p3-float p3-float-b"><small>BUILT AROUND YOU</small><strong>Clarity. One step at a time.</strong><svg viewBox="0 0 220 45"><path d="M0 25H42L53 12L65 37L81 4L94 25H123L137 18L149 25H220" /></svg></div>
            <span className="p3-dot p3-dot-a" /><span className="p3-dot p3-dot-b" />
          </div>
        </section>
        <div className="p3-strip" data-reveal><span>One place to begin.</span><span>Symptom analysis</span><span>Diabetes insights</span><span>Prediction history</span></div>
        <section className="p3-section" id="p3-tools" aria-labelledby="p3-tools-title">
          <div className="p3-section-head" data-reveal><div><span className="p3-kicker">A LITTLE CLARITY GOES A LONG WAY</span><h2 id="p3-tools-title">Your next step,<br />made simpler.</h2></div><p>Thoughtfully organized tools. Clearer questions. A more useful conversation about your health.</p></div>
          <div className="p3-cards">{tools.map(tool => <div key={tool.to} data-reveal><TiltCard className={`p3-card p3-${tool.tone}`}><div className="p3-card-top"><span className="p3-tool-icon" aria-hidden="true">{tool.mark}</span><span className="p3-kicker">{tool.tag}</span></div><h3>{tool.title}</h3><p>{tool.text}</p><Link to={tool.to}>{tool.action}<span aria-hidden="true">↗</span></Link></TiltCard></div>)}</div>
        </section>
        <section className="p3-journey p3-section" id="p3-how" aria-labelledby="p3-how-title" data-reveal><div><span className="p3-kicker">FROM INPUT TO INSIGHT</span><h2 id="p3-how-title">Less guesswork.<br />More perspective.</h2><Link className="p3-button p3-primary" to="/predict">Take the first step ↗</Link></div><ol className="p3-steps">{[['Share your inputs', 'Select symptoms or enter the measurements requested by the diabetes tool.'], ['Explore the output', 'Review the model-generated result and available precautions.'], ['Talk to a professional', 'Use the information as a starting point, not a replacement for clinical advice.']].map(([title, text], i) => <li key={title}><span className="p3-step-number">0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>
        <section className="p3-section p3-faq" aria-labelledby="p3-faq-title" data-reveal><div><span className="p3-kicker">GOOD QUESTIONS, CLEAR ANSWERS</span><h2 id="p3-faq-title">Before you begin.</h2><p>Want to know more about the project?</p><Link className="p3-textlink" to="/aboutus">Meet PREDET-AI →</Link></div><div>{questions.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></section>
        <aside className="p3-disclaimer"><strong>Important to know</strong><p>PREDET-AI is for educational and informational use only. It does not provide a medical diagnosis or replace professional healthcare advice. Do not use this tool for emergencies.</p></aside>
        <footer className="p3-footer"><div><strong>PREDET-AI<span aria-hidden="true"> ✧</span></strong><p>A clearer starting point.</p></div><nav aria-label="Footer"><a href="#p3-top">Back to top ↑</a></nav></footer>
      </div>
    </main>
  );
}
