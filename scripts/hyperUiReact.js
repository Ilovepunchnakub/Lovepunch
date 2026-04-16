import React from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import { AnimatePresence, motion } from 'https://esm.sh/framer-motion@11.2.10';

const baseState = {
  mode: 'idle',
  message: 'กดเริ่มเดินทาง แล้วออกท่องไปในจักรวาลของเรา ✨',
  messageKey: 0,
  done: false,
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

  const sync = () => {
    root.render(
      React.createElement(HyperOverlay, {
        state,
        onStart
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
    showDone: () => setState({ mode: 'message', done: true }),
    destroy: () => root.unmount()
  };
}

function HyperOverlay({ state, onStart }) {
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
        React.createElement('div', { className: 'hyper-loading-bar' },
          React.createElement(motion.span, {
            animate: { width: `${state.loadingProgress}%` },
            transition: { ease: 'easeOut', duration: 0.2 }
          })
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
        state.done && React.createElement('small', { className: 'hyper-done-text' }, 'จบข้อความแล้ว กดเริ่มเพื่อเล่นซ้ำได้')
      )
    )
  );
}
