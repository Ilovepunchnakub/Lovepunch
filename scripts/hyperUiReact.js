// ===== คำอธิบายไฟล์ (ภาษาไทย) : scripts/hyperUiReact.js =====
// หน้าที่หลัก:
// - ดูแลพฤติกรรม/ตรรกะของฟีเจอร์ตามชื่อไฟล์และโมดูลที่ import
// - ทำงานร่วมกับ DOM, state ภายใน และ event listener ของหน้า
// สิ่งที่ควรรู้ก่อนแก้ไข:
// - หากแก้ชื่อ id/class ใน HTML ต้องแก้ selector ในไฟล์นี้ให้ตรงกัน
// - หากแก้ flow การเรียกใช้ ควรตรวจผลกระทบกับไฟล์ app.js และ navigation.js
// - โค้ดส่วนนี้ถูกแยกโมดูลเพื่อให้ debug และปรับปรุงรายฟีเจอร์ได้ง่าย
// =============================================
import React from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import { AnimatePresence, motion } from 'https://esm.sh/framer-motion@11.2.10';

const { useEffect, useMemo, useState } = React;

const baseState = {
  mode: 'idle',
  message: 'กดเริ่มเดินทาง แล้วออกท่องไปในจักรวาลของเรา ✨',
  messageKey: 0,
  done: false,
  doneText: 'จบข้อความแล้ว กดเริ่มเพื่อเล่นซ้ำได้',
  finaleKey: 0,
  loadingText: 'กำลังเตรียม hyperspace...',
  loadingProgress: 0,
  messageTiming: {
    holdMs: 5600,
    fadeInMs: 1100,
    fadeOutMs: 1000
  }
};

export function createHyperUiReact({ mount, onStart }) {
  if (!mount) throw new Error('createHyperUiReact requires mount node');

  const root = createRoot(mount);
  let state = { ...baseState };
  let finaleExitHandler = null;

  const sync = () => {
    root.render(
      React.createElement(HyperOverlay, {
        state,
        onStart,
        onFinaleFinish: () => {
          finaleExitHandler?.();
        }
      })
    );
  };

  const setState = (patch) => {
    state = { ...state, ...patch };
    sync();
  };

  sync();

  return {
    setIdle: () => setState({ mode: 'idle', done: false, loadingProgress: 0 }),
    setLoading: ({ text, progress }) => setState({
      mode: 'loading',
      loadingText: text ?? state.loadingText,
      loadingProgress: progress ?? state.loadingProgress,
      done: false
    }),
    showMessage: (message, timing = {}) => setState({
      mode: 'message',
      message,
      messageTiming: { ...state.messageTiming, ...timing },
      messageKey: state.messageKey + 1,
      done: false
    }),
    showFinale: ({ onFinish } = {}) => {
      finaleExitHandler = typeof onFinish === 'function' ? onFinish : null;
      setState({ mode: 'finale', done: false, finaleKey: state.finaleKey + 1 });
    },
    showDone: (doneText) => setState({ mode: 'message', done: true, doneText: doneText ?? state.doneText }),
    destroy: () => root.unmount()
  };
}

function HyperOverlay({ state, onStart, onFinaleFinish }) {
  return React.createElement(
    'div',
    { className: 'hyper-ui-shell' },
    React.createElement(
      AnimatePresence,
      { mode: 'wait' },
      state.mode === 'idle' && React.createElement(
        motion.div,
        {
          key: 'idle',
          className: 'hyper-ui-center',
          initial: { opacity: 0, y: 20, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -10, scale: 0.96 },
          transition: { duration: 0.35 }
        },
        React.createElement('button', { className: 'soft-btn hyper-start-btn', onClick: onStart }, 'เริ่มเดินทาง')
      ),
      state.mode === 'loading' && React.createElement(
        motion.div,
        {
          key: 'loading',
          className: 'hyper-ui-panel',
          initial: { opacity: 0, y: 18, scale: 0.94 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -12, scale: 0.96 },
          transition: { duration: 0.35 }
        },
        React.createElement('p', { className: 'hyper-loading-title' }, state.loadingText),
        React.createElement(
          'div',
          { className: 'hyper-loading-ring-shell', 'aria-hidden': 'true' },
          React.createElement(
            'svg',
            { className: 'hyper-loading-ring', viewBox: '0 0 120 120' },
            React.createElement(motion.circle, {
              className: 'ring-progress',
              cx: '60',
              cy: '60',
              r: '48',
              strokeDasharray: `${Math.PI * 2 * 48}`,
              animate: { strokeDashoffset: Math.PI * 2 * 48 * (1 - state.loadingProgress / 100) },
              transition: { ease: 'easeOut', duration: 0.26 }
            })
          ),
          React.createElement('b', { className: 'hyper-loading-percent' }, `${state.loadingProgress}%`)
        ),
        React.createElement('small', { className: 'hyper-loading-log' }, `โหลดระบบนำทาง ${state.loadingProgress}%`)
      ),
      state.mode === 'message' && React.createElement(
        motion.div,
        {
          key: 'message',
          className: 'hyper-message-wrap',
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        },
        React.createElement(
          motion.p,
          {
            key: `${state.messageKey}-${state.message}`,
            className: 'hyper-message-text',
            initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
            animate: {
              opacity: [0, 1, 1, 0],
              y: [20, 0, 0, -10],
              filter: ['blur(8px)', 'blur(0px)', 'blur(0px)', 'blur(6px)']
            },
            transition: {
              duration: (state.messageTiming.fadeInMs + state.messageTiming.holdMs + state.messageTiming.fadeOutMs) / 1000,
              times: [0, 0.14, 0.82, 1],
              ease: 'easeInOut'
            }
          },
          state.message
        ),
        state.done && React.createElement('small', { className: 'hyper-done-text' }, state.doneText)
      ),
      state.mode === 'finale' && React.createElement(HyperFinale, { key: `finale-${state.finaleKey}`, onFinish: onFinaleFinish })
    )
  );
}

function HyperFinale({ onFinish }) {
  const [ready, setReady] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const words = useMemo(() => Array.from({ length: 100 }, (_, idx) => ({ id: idx + 1, text: 'I love you' })), []);

  useEffect(() => {
    const reveal = setTimeout(() => setTitleVisible(true), 2500);
    const t = setTimeout(() => setReady(true), 4100);
    return () => {
      clearTimeout(reveal);
      clearTimeout(t);
    };
  }, []);

  return React.createElement(
    motion.div,
    {
      className: 'hyper-love-finale',
      initial: { opacity: 0, scale: 0.96 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.98 },
      transition: { duration: 0.45 }
    },
    React.createElement(
      'div',
      { className: 'hyper-love-field', id: 'ui', 'aria-hidden': 'true' },
      words.map((item) => React.createElement(
        'div',
        { className: 'hyper-love-item', key: item.id, style: { '--i': item.id } },
        React.createElement(
          'div',
          { className: 'hyper-love-horizontal' },
          React.createElement(
            'div',
            { className: 'hyper-love-vertical' },
            React.createElement('div', { className: 'hyper-love-word' }, item.text)
          )
        )
      ))
    ),
    React.createElement(
      'div',
      { className: 'hyper-finale-overlay' },
      React.createElement('h2', { className: `hyper-finale-title${titleVisible ? ' show' : ''}` }, 'Love Forever'),
      React.createElement(
        'button',
        {
          className: `soft-btn hyper-finale-end-btn${ready ? ' show' : ''}`,
          onClick: () => onFinish?.()
        },
        'กดเพื่อจบ'
      )
    )
  );
}
