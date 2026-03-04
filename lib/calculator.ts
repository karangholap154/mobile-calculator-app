/**
 * Calculator logic — completely separated from UI.
 * All computation lives here so the screen stays clean.
 */

export type Operator = "+" | "−" | "×" | "÷" | null;

export interface CalcState {
  display: string;
  previous: string;
  operator: Operator;
  waitingForOperand: boolean;
  justEvaluated: boolean;
}

export const initialState: CalcState = {
  display: "0",
  previous: "",
  operator: null,
  waitingForOperand: false,
  justEvaluated: false,
};

/** Format a number to a reasonable display string. */
function formatResult(n: number): string {
  if (!isFinite(n)) return "Error";
  if (Math.abs(n) > 9.99999999e12) return "Error";

  const str = parseFloat(n.toPrecision(10)).toString();
  if (str.includes("e")) return "Error";
  return str;
}

/** Perform the actual arithmetic. Returns formatted string. */
function compute(a: string, b: string, op: Operator): string {
  const numA = parseFloat(a);
  const numB = parseFloat(b);

  if (isNaN(numA) || isNaN(numB)) return "Error";

  let result: number;
  switch (op) {
    case "+":
      result = numA + numB;
      break;
    case "−":
      result = numA - numB;
      break;
    case "×":
      result = numA * numB;
      break;
    case "÷":
      if (numB === 0) return "Error";
      result = numA / numB;
      break;
    default:
      return b;
  }

  return formatResult(result);
}

// ─── Action handlers ──────────────────────────────────────────────────────────

export function handleDigit(state: CalcState, digit: string): CalcState {
  const { display, waitingForOperand, justEvaluated } = state;

  if (waitingForOperand || justEvaluated) {
    return {
      ...state,
      display: digit,
      waitingForOperand: false,
      justEvaluated: false,
    };
  }

  if (display === "0" && digit !== ".") {
    return { ...state, display: digit };
  }

  if (display.length >= 12) return state;

  return { ...state, display: display + digit };
}

export function handleDecimal(state: CalcState): CalcState {
  const { display, waitingForOperand, justEvaluated } = state;

  if (waitingForOperand || justEvaluated) {
    return {
      ...state,
      display: "0.",
      waitingForOperand: false,
      justEvaluated: false,
    };
  }

  if (display.includes(".")) return state;
  return { ...state, display: display + "." };
}

export function handleOperator(state: CalcState, op: Operator): CalcState {
  const { display, previous, operator, justEvaluated } = state;

  if (operator && !justEvaluated && previous !== "") {
    const result = compute(previous, display, operator);
    return {
      display: result,
      previous: result,
      operator: op,
      waitingForOperand: true,
      justEvaluated: false,
    };
  }

  return {
    ...state,
    previous: display,
    operator: op,
    waitingForOperand: true,
    justEvaluated: false,
  };
}

export function handleEquals(state: CalcState): CalcState {
  const { display, previous, operator } = state;

  if (!operator || previous === "") {
    return { ...state, justEvaluated: true };
  }

  const result = compute(previous, display, operator);
  return {
    display: result,
    previous: "",
    operator: null,
    waitingForOperand: false,
    justEvaluated: true,
  };
}

export function handleClear(): CalcState {
  return { ...initialState };
}

export function handleToggleSign(state: CalcState): CalcState {
  const { display } = state;
  if (display === "0" || display === "Error") return state;

  if (display.startsWith("-")) {
    return { ...state, display: display.slice(1) };
  }
  return { ...state, display: "-" + display };
}

export function handlePercent(state: CalcState): CalcState {
  const { display } = state;
  const n = parseFloat(display);
  if (isNaN(n)) return state;
  return { ...state, display: formatResult(n / 100) };
}
