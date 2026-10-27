import { addDays } from "./dates";
import { policies } from "./policies";
import type { DateString, Installment, Payment, PaymentPlan } from "./types";

export function availablePlans(daysUntilDeparture: number): PaymentPlan[] {
  return daysUntilDeparture > policies.depositMinDays ? ["full", "deposit"] : ["full"];
}

interface ScheduleInput {
  plan: PaymentPlan;
  total: number;
  bookedOn: DateString;
  departureDate: DateString;
}

export function buildSchedule({ plan, total, bookedOn, departureDate }: ScheduleInput): Installment[] {
  if (plan === "deposit") {
    const deposit = Math.round(total * policies.depositRate);
    const balanceCandidate = addDays(departureDate, -policies.balanceDueDays);
    return [
      { key: "deposit", dueDate: bookedOn, amount: deposit },
      { key: "balance", dueDate: balanceCandidate > bookedOn ? balanceCandidate : bookedOn, amount: total - deposit },
    ];
  }
  return [{ key: "full", dueDate: bookedOn, amount: total }];
}

export function amountPaid(payments: Payment[]): number {
  return payments
    .filter((p) => p.status === "succeeded")
    .reduce((sum, p) => sum + p.amount - p.refundedAmount, 0);
}

export interface InstallmentProgress extends Installment {
  paid: number;
  outstanding: number;
}

/** Applies what has been paid to the schedule in order. */
export function scheduleProgress(schedule: Installment[], paid: number): InstallmentProgress[] {
  let remaining = paid;
  return schedule.map((item) => {
    const applied = Math.max(0, Math.min(item.amount, remaining));
    remaining -= applied;
    return { ...item, paid: applied, outstanding: item.amount - applied };
  });
}

export function nextInstallment(schedule: Installment[], paid: number): InstallmentProgress | null {
  return scheduleProgress(schedule, paid).find((item) => item.outstanding > 0) ?? null;
}
