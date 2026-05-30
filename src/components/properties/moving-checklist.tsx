"use client"

import { useEffect, useState } from "react"
import { CheckSquare, Square } from "lucide-react"
import { cn } from "@/lib/utils"

const LS_KEY = "alivia_moving_checklist"

type ChecklistTask = { id: string; week: number; label: string }

const TASKS: ChecklistTask[] = [
  { id: "t1",  week: 1, label: "Confirm purchase/rental agreement and handover date" },
  { id: "t2",  week: 1, label: "Notify landlord / property manager" },
  { id: "t3",  week: 2, label: "Start collecting packing materials (boxes, tape, bubble wrap)" },
  { id: "t4",  week: 2, label: "Research and book a moving company" },
  { id: "t5",  week: 3, label: "Sort belongings — donate, sell, or discard" },
  { id: "t6",  week: 3, label: "Begin packing non-essential items" },
  { id: "t7",  week: 4, label: "Update address with bank, telecom, and government services" },
  { id: "t8",  week: 4, label: "Transfer utility accounts (electricity, gas, water, internet)" },
  { id: "t9",  week: 5, label: "Pack bedroom and living area" },
  { id: "t10", week: 5, label: "Arrange key collection / handover date with seller or agent" },
  { id: "t11", week: 6, label: "Confirm moving truck schedule and access time at new address" },
  { id: "t12", week: 6, label: "Pack remaining items and label all boxes clearly" },
  { id: "t13", week: 7, label: "Deep clean old property" },
  { id: "t14", week: 7, label: "Moving day — verify all rooms before leaving" },
  { id: "t15", week: 8, label: "Inspect new property against handover checklist" },
  { id: "t16", week: 8, label: "Set up utilities and internet at new address" },
]

const WEEKS = Array.from({ length: 8 }, (_, i) => i + 1)

export function MovingChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LS_KEY) ?? "[]") as string[]
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecked(new Set(Array.isArray(stored) ? stored : []))
    } catch {
      // ignore
    }
  }, [])

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem(LS_KEY, JSON.stringify([...next]))
      return next
    })
  }

  const total = TASKS.length
  const done = checked.size

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-brand-50 px-4 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-brand-800">{done} of {total} tasks completed</span>
          <span className="text-brand-600">{Math.round((done / total) * 100)}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      </div>

      {WEEKS.map((week) => {
        const tasks = TASKS.filter((t) => t.week === week)
        const weekDone = tasks.filter((t) => checked.has(t.id)).length
        return (
          <div key={week} className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
              <h3 className="text-sm font-bold text-ink-800">Week {week}</h3>
              <span className="text-xs text-ink-400">{weekDone}/{tasks.length}</span>
            </div>
            <ul className="divide-y divide-border/40">
              {tasks.map((task) => {
                const isChecked = checked.has(task.id)
                return (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => toggle(task.id)}
                      className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-ink-50"
                    >
                      {isChecked
                        ? <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                        : <Square className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
                      }
                      <span className={cn("text-sm", isChecked ? "text-ink-400 line-through" : "text-ink-800")}>
                        {task.label}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
