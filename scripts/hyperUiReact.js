import React from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import { AnimatePresence, motion } from 'https://esm.sh/framer-motion@11.2.10';

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
    showFinale: () => setState({ mode: 'finale', done: false, finaleKey: state.finaleKey + 1 }),
    showDone: (doneText) => setState({ mode: 'message', done: true, doneText: doneText ?? state.doneText }),
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
        state.done && React.createElement('small', { className: 'hyper-done-text' }, state.doneText)
      ),
      state.mode === 'finale' && React.createElement(HyperFinale, { key: `finale-${state.finaleKey}` })
    )
  );
}

function HyperFinale() {
  return React.createElement(
    motion.div,
    {
      className: 'hyper-love-finale',
      initial: { opacity: 0, scale: 0.96 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.98 },
      transition: { duration: 0.4 }
    },
    React.createElement('div', { className: 'hyper-love-burst', 'aria-hidden': 'true' }),
    React.createElement(
      'svg',
      { className: 'hyper-love-svg', xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 500 200', role: 'img', 'aria-label': 'I Love You' },
      React.createElement('line', { className: 'hyper-love-line hyper-love-line--left', x1: '10', y1: '17', x2: '10', y2: '183' }),
      React.createElement('line', { className: 'hyper-love-line hyper-love-line--right', x1: '490', y1: '17', x2: '490', y2: '183' }),
      React.createElement(
        'g',
        null,
        React.createElement('path', { className: 'hyper-love-letter', d: 'M42.2,73.9h11.4v52.1H42.2V73.9z' }),
        React.createElement('path', { className: 'hyper-love-letter', d: 'M85.1,73.9h11.4v42.1h22.8v10H85.1V73.9z' }),
        React.createElement('path', { className: 'hyper-love-letter', d: 'M123.9,100c0-15.2,11.7-26.9,27.2-26.9s27.2,11.7,27.2,26.9s-11.7,26.9-27.2,26.9S123.9,115.2,123.9,100zM166.9,100c0-9.2-6.8-16.5-15.8-16.5c-9,0-15.8,7.3-15.8,16.5s6.8,16.5,15.8,16.5C160.1,116.5,166.9,109.2,166.9,100z' }),
        React.createElement('path', { className: 'hyper-love-letter', d: 'M180.7,73.9H193l8.4,22.9c1.7,4.7,3.5,9.5,5,14.2h0.1c1.7-4.8,3.4-9.4,5.2-14.3l8.6-22.8h11.7l-19.9,52.1h-11.5L180.7,73.9z' }),
        React.createElement('path', { className: 'hyper-love-letter', d: 'M239.1,73.9h32.2v10h-20.7v10.2h17.9v9.5h-17.9v12.4H272v10h-33V73.9z' }),
        React.createElement('path', { className: 'hyper-love-letter', d: 'M315.8,102.5l-20.1-28.6H309l6.3,9.4c2,3,4.2,6.4,6.3,9.6h0.1c2-3.2,4.1-6.4,6.3-9.6l6.3-9.4h12.9l-19.9,28.5v23.6h-11.4V102.5z' }),
        React.createElement('path', { className: 'hyper-love-letter', d: 'M348.8,100c0-15.2,11.7-26.9,27.2-26.9c15.5,0,27.2,11.7,27.2,26.9s-11.7,26.9-27.2,26.9C360.5,126.9,348.8,115.2,348.8,100z' }),
        React.createElement('path', { className: 'hyper-love-letter', d: 'M412.4,101.1V73.9h11.4v26.7c0,10.9,2.4,15.9,11.5,15.9c8.4,0,11.4-4.6,11.4-15.8V73.9h11v26.9c0,7.8-1.1,13.5-4,17.7c-3.7,5.3-10.4,8.4-18.7,8.4c-8.4,0-15.1-3.1-18.8-8.5C413.4,114.2,412.4,108.5,412.4,101.1z' })
      )
    ),
    React.createElement('p', { className: 'hyper-love-caption' }, 'ส่งท้ายการเดินทางด้วยหัวใจทั้งดวง 💖')
  );
}
