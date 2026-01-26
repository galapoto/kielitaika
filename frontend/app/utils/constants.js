import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const PRODUCT_NAME =
  Constants.expoConfig?.name || Constants.manifest?.name || 'Kieli Taika';
export const CORRECTION_MODES = ['light', 'medium', 'strict'];
export const LEARNING_PATHS = ['general', 'workplace', 'yki'];

const YKI_EXAM_STATE_KEY = '@yki_exam_state_v1';

let ExamStorage;
if (Platform.OS === 'web') {
  ExamStorage = {
    getItem: async (key) => {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    },
    setItem: async (key, value) => {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        // ignore
      }
    },
    removeItem: async (key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // ignore
      }
    },
  };
} else {
  ExamStorage = require('@react-native-async-storage/async-storage').default;
}

const subscribers = new Set();
let ticker = null;
let hydrated = false;
let examState = {
  examId: null,
  mode: 'exam',
  tasks: {},
  activeTaskId: null,
  updatedAt: null,
};

const snapshot = () => ({
  ...examState,
  tasks: { ...examState.tasks },
});

const notify = () => {
  const snap = snapshot();
  subscribers.forEach((cb) => cb(snap));
};

const persist = async () => {
  try {
    await ExamStorage.setItem(YKI_EXAM_STATE_KEY, JSON.stringify(examState));
  } catch (_) {
    // ignore persistence errors
  }
};

const startTicker = () => {
  if (ticker) return;
  ticker = setInterval(() => {
    const activeId = examState.activeTaskId;
    if (!activeId) return;
    const timer = examState.tasks[activeId];
    if (!timer || !timer.startedAt) return;
    const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000);
    const nextElapsed = Math.min(elapsed, timer.timeLimitSec || 0);
    if (nextElapsed !== timer.elapsedSec) {
      timer.elapsedSec = nextElapsed;
      timer.completed = timer.elapsedSec >= (timer.timeLimitSec || 0);
      examState.updatedAt = Date.now();
      notify();
      persist();
    }
  }, 1000);
};

const stopTicker = () => {
  if (ticker) clearInterval(ticker);
  ticker = null;
};

export const YKIExamModeController = {
  async hydrate() {
    if (hydrated) return snapshot();
    try {
      const raw = await ExamStorage.getItem(YKI_EXAM_STATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        examState = {
          ...examState,
          ...parsed,
          tasks: parsed.tasks || {},
        };
      }
    } catch (_) {
      // ignore hydration errors
    }
    hydrated = true;
    if (examState.activeTaskId) startTicker();
    return snapshot();
  },
  subscribe(cb) {
    subscribers.add(cb);
    cb(snapshot());
    return () => subscribers.delete(cb);
  },
  startExam({ examId, tasks = [], timeUnit = 'seconds' }) {
    const taskTimers = {};
    tasks.forEach((task) => {
      const rawLimit = task.time_limit || 0;
      const timeLimitSec = timeUnit === 'minutes' ? rawLimit * 60 : rawLimit;
      taskTimers[task.id] = {
        taskId: task.id,
        timeLimitSec,
        startedAt: null,
        elapsedSec: 0,
        completed: false,
      };
    });
    examState = {
      examId: examId || 'yki_exam',
      mode: 'exam',
      tasks: taskTimers,
      activeTaskId: tasks[0]?.id || null,
      updatedAt: Date.now(),
    };
    if (examState.activeTaskId) {
      examState.tasks[examState.activeTaskId].startedAt = Date.now();
    }
    startTicker();
    notify();
    persist();
    return snapshot();
  },
  setActiveTask(taskId) {
    if (!taskId || !examState.tasks[taskId]) return snapshot();
    examState.activeTaskId = taskId;
    if (!examState.tasks[taskId].startedAt) {
      examState.tasks[taskId].startedAt = Date.now();
    }
    examState.updatedAt = Date.now();
    startTicker();
    notify();
    persist();
    return snapshot();
  },
  getRemainingFor(taskId) {
    const timer = examState.tasks[taskId];
    if (!timer) return 0;
    const remaining = (timer.timeLimitSec || 0) - (timer.elapsedSec || 0);
    return remaining > 0 ? remaining : 0;
  },
  endExam() {
    examState = {
      examId: null,
      mode: 'exam',
      tasks: {},
      activeTaskId: null,
      updatedAt: Date.now(),
    };
    stopTicker();
    notify();
    persist();
    return snapshot();
  },
};
